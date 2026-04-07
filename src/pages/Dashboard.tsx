import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Ticket, UtensilsCrossed, Megaphone, Bell, MessageSquare, 
  Clock, CheckCircle, AlertTriangle, User, Shield, Users, ClipboardList, Settings 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const quickActions = [
  { to: '/leave', icon: FileText, label: 'Apply Leave', color: 'bg-info/10 text-info' },
  { to: '/tickets', icon: Ticket, label: 'Raise Ticket', color: 'bg-warning/10 text-warning' },
  { to: '/mess', icon: UtensilsCrossed, label: 'Mess Menu', color: 'bg-success/10 text-success' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAppStore();
  const [stats, setStats] = useState({ pendingLeaves: 0, openTickets: 0, resolvedTickets: 0, totalStudents: 0, totalStaff: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      // Admin specific global stats
      let studentsCount = 0;
      let staffCount = 0;
      if (user?.role === 'admin' || user?.role === 'warden') {
        const { count: sCount } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student');
        const { count: stCount } = await supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'student');
        studentsCount = sCount || 0;
        staffCount = stCount || 0;
      }

      // Leaves Stats
      let leavesQuery = supabase.from('leaves').select('id', { count: 'exact' }).eq('status', 'pending');
      if (user?.role === 'student') leavesQuery = leavesQuery.eq('student_id', user.id);
      const { count: pendingLeaves } = await leavesQuery;

      // Tickets Stats
      let openTicketsQuery = supabase.from('tickets').select('id', { count: 'exact' }).in('status', ['open', 'in_progress']);
      let resolvedTicketsQuery = supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'resolved');
      
      if (user?.role === 'student') {
        openTicketsQuery = openTicketsQuery.eq('created_by', user.id);
        resolvedTicketsQuery = resolvedTicketsQuery.eq('created_by', user.id);
      }
      
      const [{ count: openTickets }, { count: resolvedTickets }] = await Promise.all([
        openTicketsQuery, resolvedTicketsQuery
      ]);

      setStats({
        pendingLeaves: pendingLeaves || 0,
        openTickets: openTickets || 0,
        resolvedTickets: resolvedTickets || 0,
        totalStudents: studentsCount,
        totalStaff: staffCount
      });

      // Recent Announcements
      const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(2);
      if (annData) setAnnouncements(annData);

      // Active Tickets Fetch
      let tktsQuery = supabase.from('tickets').select('*').neq('status', 'closed').order('created_at', { ascending: false }).limit(3);
      if (user?.role === 'student') tktsQuery = tktsQuery.eq('created_by', user.id);
      const { data: tktsData } = await tktsQuery;
      if (tktsData) setActiveTickets(tktsData);
    }

    if (user?.id) fetchDashboardData();
  }, [user]);

  const dashboardStats = [
    ...(user?.role === 'admin' || user?.role === 'warden' 
      ? [
          { label: 'Total Students', value: stats.totalStudents, icon: User, color: 'text-primary' },
          { label: 'Total Staff', value: stats.totalStaff, icon: Shield, color: 'text-info' },
        ]
      : []
    ),
    ...(user?.role !== 'maintenance' ? [{ label: 'Pending Leaves', value: stats.pendingLeaves, icon: Clock, color: 'text-warning' }] : []),
    { label: 'Open Tickets', value: stats.openTickets, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Resolved Tickets', value: stats.resolvedTickets, icon: CheckCircle, color: 'text-success' },
  ];

  const currentActions = user?.role === 'admin' 
    ? [
        { to: '/users', icon: Users, label: 'Manage Users', color: 'bg-primary/10 text-primary' },
        { to: '/leave', icon: ClipboardList, label: 'Manage Leaves', color: 'bg-info/10 text-info' },
        { to: '/announcements', icon: Megaphone, label: 'Broadcast News', color: 'bg-warning/10 text-warning' },
        { to: '/settings', icon: Settings, label: 'Settings', color: 'bg-success/10 text-success' },
      ]
    : user?.role === 'maintenance' 
    ? [
        { to: '/tickets', icon: Ticket, label: 'Manage Tickets', color: 'bg-warning/10 text-warning' },
        { to: '/announcements', icon: Megaphone, label: 'View News', color: 'bg-primary/10 text-primary' },
        { to: '/profile', icon: User, label: 'Profile', color: 'bg-success/10 text-success' },
      ]
    : user?.role === 'mess'
    ? [
        { to: '/mess', icon: UtensilsCrossed, label: 'Update Menu', color: 'bg-success/10 text-success' },
        { to: '/announcements', icon: Megaphone, label: 'Mess Alerts', color: 'bg-orange-500/10 text-orange-600' },
        { to: '/profile', icon: User, label: 'Profile', color: 'bg-primary/10 text-primary' },
      ]
    : user?.role === 'parent'
    ? [
        { to: '/leave', icon: FileText, label: "Child's Leave", color: 'bg-info/10 text-info' },
        { to: '/mess', icon: UtensilsCrossed, label: 'Mess Menu', color: 'bg-success/10 text-success' },
        { to: '/announcements', icon: Megaphone, label: 'News', color: 'bg-primary/10 text-primary' },
        { to: '/profile', icon: User, label: 'Profile', color: 'bg-warning/10 text-warning' },
      ]
    : user?.role === 'guard'
    ? [
        { to: '/security', icon: Shield, label: 'Security Logs', color: 'bg-destructive/10 text-destructive' },
        { to: '/announcements', icon: Megaphone, label: 'View News', color: 'bg-primary/10 text-primary' },
        { to: '/profile', icon: User, label: 'Profile', color: 'bg-success/10 text-success' },
      ]
    : quickActions;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">
          Good morning, <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.role === 'maintenance' ? 'Maintenance Access' : 
           user?.role === 'mess' ? 'Mess Management Team' :
           user?.role === 'parent' ? 'Parent Portal' :
           user?.role === 'guard' ? 'Security Guard Portal' :
           `${user?.room_number ? `Room ${user.room_number} · ` : ''}${user?.block || 'Admin Block'}`}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="font-display text-base font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentActions.map((action) => (
            <Link key={action.to} to={action.to} className="h-full">
              <Card className="hover:shadow-md transition-all group h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Announcements */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Recent Announcements</h2>
          <Link to="/announcements" className="text-xs text-primary font-medium">View all</Link>
        </div>
        <div className="space-y-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent announcements.</p>
          ) : announcements.map((a) => (
            <Link key={a.id} to="/announcements" className="block">
              <Card className="hover:bg-muted/30 hover:border-primary/20 transition-all group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      a.priority === 'urgent' ? 'bg-destructive/10 text-destructive' : a.priority === 'important' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                    }`}>
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Active Tickets</h2>
          <Link to="/tickets" className="text-xs text-primary font-medium">View all</Link>
        </div>
        <div className="space-y-2">
           {activeTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tickets.</p>
          ) : activeTickets.map((t) => (
            <Link key={t.id} to="/tickets" className="block">
              <Card className="hover:bg-muted/30 hover:border-primary/20 transition-all group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{t.category} · {t.room_number}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      t.status === 'open' ? 'bg-warning/10 text-warning' : t.status === 'in_progress' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
