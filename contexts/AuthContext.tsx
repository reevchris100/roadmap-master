
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

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          await handleUserSession(session);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        if (mounted) setLoading(false);
      }
    }

    async function handleUserSession(session: Session) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email,
          subscriptionStatus: profile?.subscription_status === 'PRO' ? SubscriptionStatus.PRO : SubscriptionStatus.FREE,
          createdAt: new Date(session.user.created_at),
        };
        setCurrentUser(user);
      } catch (e) {
        console.error("Error setting user:", e);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await handleUserSession(session);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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