import { create } from 'zustand';
import { UserRole } from './types';
import { supabase } from './supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// We extend the Supabase User with our profile structure mentally, or we fetch it
interface AppState {
  isAuthenticated: boolean;
  isHandlingAuth: boolean; // Add a loading state
  session: Session | null;
  user: any | null; // will hold merged profile data
  sidebarOpen: boolean;
  currentRole: UserRole | null;
  setSidebarOpen: (open: boolean) => void;
  initializeAuth: () => void;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isHandlingAuth: true,
  session: null,
  user: null,
  sidebarOpen: false,
  currentRole: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  initializeAuth: () => {
    // Initial fetch of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session });
      if (session?.user) {
        // Fetch profile
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile, error }) => {
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

    // Listen for auth changes
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
}));
