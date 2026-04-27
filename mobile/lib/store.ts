import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from './types';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

interface AppState {
  isAuthenticated: boolean;
  isHandlingAuth: boolean;
  session: Session | null;
  user: any | null;
  currentRole: UserRole | null;
  initializeAuth: () => void;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isHandlingAuth: true,
      session: null,
      user: null,
      currentRole: null,

      initializeAuth: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ session });
          if (session?.user) {
            supabase.from('profiles').select('*').eq('id', session.user.id).single()
              .then(({ data: profile }) => {
                if (profile) {
                  set({ 
                    isAuthenticated: true, 
                    user: { ...session.user, ...profile }, 
                    currentRole: profile.role,
                    isHandlingAuth: false
                  });
                } else {
                  supabase.auth.signOut();
                  set({ isHandlingAuth: false, isAuthenticated: false });
                }
              });
          } else {
            set({ isHandlingAuth: false });
          }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session });
          if (session?.user) {
            supabase.from('profiles').select('*').eq('id', session.user.id).single()
              .then(({ data: profile }) => {
                if (profile) {
                  set({ 
                    isAuthenticated: true, 
                    user: { ...session.user, ...profile }, 
                    currentRole: profile.role,
                    isHandlingAuth: false
                  });
                } else {
                  supabase.auth.signOut();
                  set({ isHandlingAuth: false, isAuthenticated: false });
                }
              });
          } else {
            set({ isAuthenticated: false, user: null, currentRole: null, isHandlingAuth: false });
          }
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, session: null, user: null, currentRole: null });
      },
    }),
    {
      name: 'hms-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentRole: state.currentRole
      }),
    }
  )
);
