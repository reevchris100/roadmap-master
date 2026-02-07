
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';
import { SubscriptionStatus } from '../types';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  upgradeSubscription: (orderId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: if Supabase takes too long, we must eventually render.
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("Auth initialization timed out, forcing render.");
        setLoading(false);
      }
    }, 5000);

    async function handleUserSession(session: Session) {
      // Default user object from session (fallback)
      let user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email,
        subscriptionStatus: SubscriptionStatus.FREE,
        createdAt: new Date(session.user.created_at),
      };

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          user.subscriptionStatus = profile.subscription_status === 'PRO' ? SubscriptionStatus.PRO : SubscriptionStatus.FREE;
        } else if (error && error.code !== 'PGRST116') {
          console.warn('Profile fetch warning (using defaults):', error.message);
        }
      } catch (e) {
        console.warn("Profile fetch failed entirely (using defaults)", e);
      } finally {
        if (mounted) {
          setCurrentUser(user);
          setLoading(false);
        }
      }
    }

    // Initialize: Check session immediately
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) {
        if (session) {
          await handleUserSession(session);
        }
        // Always set loading to false after initial check, regardless of session presence
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          // console.log("Auth State Change:", _event);
          if (session) {
            // If we already have a user matching this session, we might not need to re-fetch,
            // but checking profile updates is safer.
            await handleUserSession(session);
          } else {
            setCurrentUser(null);
            // setLoading(false); // Initial loading is handled by getSession, subsequent changes don't reset loading state
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signUp = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    // Triggers will handle profile creation
    if (error) throw error;
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setCurrentUser(null);
    }
  };

  const upgradeSubscription = async (orderId: string) => {
    if (currentUser) {
      // Update DB
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'PRO',
          subscription_id: orderId
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error("Failed to upgrade subscription in DB:", error);
        alert("Payment successful but database update failed. Please contact support.");
        return;
      }

      const updatedUser = {
        ...currentUser,
        subscriptionStatus: SubscriptionStatus.PRO,
      };
      setCurrentUser(updatedUser);
    }
  };

  const value = { currentUser, login, signUp, loginWithGoogle, logout, upgradeSubscription };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};