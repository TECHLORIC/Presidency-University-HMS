export type UserRole = 'student' | 'parent' | 'warden' | 'maintenance' | 'mess' | 'security' | 'guard' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  room_number?: string;
  block?: string;
  phone?: string;
  registration_id?: string;
  roll_no?: string;
  dob?: string;
  parent_phone?: string;
  emergency_contact?: string;
  home_address?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: LeaveStatus;
  createdAt: string;
  approvedBy?: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'water' | 'electricity' | 'cleaning' | 'wifi' | 'plumbing' | 'furniture' | 'other';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdByName: string;
  targetRoles: UserRole[];
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface MealItem {
  name: string;
  type: 'veg' | 'non-veg';
}

export interface DayMenu {
  day: string;
  breakfast: MealItem[];
  lunch: MealItem[];
  snacks: MealItem[];
  dinner: MealItem[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'ticket' | 'announcement' | 'gym' | 'general';
  read: boolean;
  createdAt: string;
}
