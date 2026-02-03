
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
  upgradeSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.full_name || session.user.email,
            subscriptionStatus: SubscriptionStatus.FREE, // Default for new users
            createdAt: new Date(session.user.created_at),
          };
          setCurrentUser(user);
          setIsGuest(false);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
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
  };

  const upgradeSubscription = () => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        subscriptionStatus: SubscriptionStatus.PRO,
        paypalSubscriptionId: `sub_${Date.now()}`
      };
      setCurrentUser(updatedUser);
      // In a real app, you would also save this to your database.
      // e.g., supabase.from('users').update({ ... }).eq('id', currentUser.id)
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