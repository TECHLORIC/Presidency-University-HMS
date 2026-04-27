import { supabase } from '../supabase';

export const announcementsApi = {
  async getRecent(limit = 2) {
    const { data, error } = await supabase.from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getAll() {
    const { data, error } = await supabase.from('announcements')
      .select(`*, profiles(name)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(announcement: { title: string; message: string; priority: string; userId: string }) {
    const { data, error } = await supabase.from('announcements').insert({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      created_by: announcement.userId
    }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
};
