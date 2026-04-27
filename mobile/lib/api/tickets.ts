import { supabase } from '../supabase';
import { TicketCategory } from '../types';

export const ticketsApi = {
  async getStats(userId?: string, role?: string) {
    let openQuery = supabase.from('tickets').select('id', { count: 'exact' }).in('status', ['open', 'in_progress']);
    let resolvedQuery = supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'resolved');

    if (role === 'student' && userId) {
      openQuery = openQuery.eq('created_by', userId);
      resolvedQuery = resolvedQuery.eq('created_by', userId);
    }

    const [{ count: openCount }, { count: resolvedCount }] = await Promise.all([
      openQuery,
      resolvedQuery
    ]);

    return {
      open: openCount || 0,
      resolved: resolvedCount || 0
    };
  },

  async getActive(userId?: string, role?: string, limit = 3) {
    let query = supabase.from('tickets').select('*').neq('status', 'closed').order('created_at', { ascending: false }).limit(limit);
    if (role === 'student' && userId) {
      query = query.eq('created_by', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAll(userId?: string, role?: string) {
    let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (role === 'student' && userId) {
      query = query.eq('created_by', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(ticket: { title: string; description: string; category: TicketCategory; userId: string; roomNumber: string }) {
    const { data, error } = await supabase.from('tickets').insert({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: 'medium',
      status: 'open',
      created_by: ticket.userId,
      room_number: ticket.roomNumber
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase.from('tickets').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
