import { supabase } from '../supabase';

export const securityApi = {
  async getLogs(userId?: string, roomNumber?: string, role?: string, limit = 20) {
    let query = supabase
      .from('room_security_logs')
      .select('*, profiles(name)')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (role === 'student' || role === 'parent') {
      if (!roomNumber) return [];
      query = query.eq('room_number', roomNumber);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async logSecurity(userId: string, roomNumber: string, statusSnapshot: any) {
    const { data, error } = await supabase.from('room_security_logs').insert({
      user_id: userId,
      room_number: roomNumber || 'N/A',
      status_snapshot: statusSnapshot,
      scanned_tag_id: 'MANUAL_VERIFICATION'
    }).select().single();
    if (error) throw error;
    return data;
  }
};
