import { supabase } from '../supabase';

export const usersApi = {
  async getStats() {
    const { count: studentCount } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student');
    const { count: staffCount } = await supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'student');
    return {
      students: studentCount || 0,
      staff: staffCount || 0
    };
  },

  async getAll() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getProfile(id: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async updateRole(id: string, role: string) {
    const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  }
};
