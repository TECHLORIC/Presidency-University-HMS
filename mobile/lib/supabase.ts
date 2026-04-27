import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aasogqvyhvaxmxsqyetl.supabase.co';
const supabaseAnonKey = 'sb_publishable_0C7tPCUGGejZKtsb1MeE7w_8ieCTWZa';

// Robust storage wrapper for Supabase in React Native
const ExpoStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
