
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';
import { SubscriptionStatus } from '../types';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  isGuest: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  upgradeSubscription: (orderId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('isGuest') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('isGuest', String(isGuest));
  }, [isGuest]);

  useEffect(() => {
    // Safety timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session) {
            // Fetch profile to get subscription status
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
            setIsGuest(false);
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Fallback: treat as logged out or guest if error occurs
          setCurrentUser(null);
        } finally {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
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

  const loginAsGuest = () => {
    setIsGuest(true);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setIsGuest(false);
    localStorage.removeItem('isGuest');
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

  const value = { currentUser, isGuest, login, signUp, loginWithGoogle, loginAsGuest, logout, upgradeSubscription };

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