import { supabase } from '../supabase';

export const leavesApi = {
  async getPendingCount(userId?: string, role?: string) {
    let query = supabase.from('leaves').select('id', { count: 'exact' }).eq('status', 'pending');
    if (role === 'student' && userId) {
      query = query.eq('student_id', userId);
    }
    const { count } = await query;
    return count || 0;
  },

  async getAll(userId?: string, role?: string) {
    let query = supabase.from('leaves').select('*, profiles(*)').order('created_at', { ascending: false });
    if (role === 'student' && userId) {
      query = query.eq('student_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async apply(studentId: string, reason: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase.from('leaves').insert({
      student_id: studentId,
      reason,
      from_date: fromDate,
      to_date: toDate,
      status: 'pending'
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const { data, error } = await supabase.from('leaves').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
