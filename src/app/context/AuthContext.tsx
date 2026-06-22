import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/supabaseDb';
import type { UserProfile } from '../lib/types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const profileFromAuthUser = (user: any): UserProfile => ({
  id: user.id,
  email: user.email ?? '',
  full_name:
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Customer',
  role: 'customer',
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(profileFromAuthUser(authUser));
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as UserProfile['role']
        });
      } else {
        setProfile(profileFromAuthUser(authUser));
      }
    } catch (e) {
      console.error('Unexpected error fetching profile:', e);
      setProfile(profileFromAuthUser(authUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
