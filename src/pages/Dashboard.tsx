import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Ticket, UtensilsCrossed, Megaphone, Bell, MessageSquare, 
  Clock, CheckCircle, AlertTriangle, User, Shield, Users, ClipboardList, Settings 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
        { to: '/tickets', icon: Ticket, label: 'All Tickets', color: 'bg-destructive/10 text-destructive' },
        { to: '/announcements', icon: Megaphone, label: 'Broadcast News', color: 'bg-warning/10 text-warning' },
        { to: '/mess', icon: UtensilsCrossed, label: 'Mess Management', color: 'bg-success/10 text-success' },
        { to: '/settings', icon: Settings, label: 'System Settings', color: 'bg-muted text-muted-foreground' },
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-5xl pb-10">
      {/* Premium Greeting Card */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 bg-primary mesh-gradient border border-sidebar-primary/20 shadow-2xl group">
        {/* Advanced Rainy Glass Overlay - Activates on Hover */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="rain-drop drip group-hover:opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDuration: `${2 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <div 
              key={`static-${i}`}
              className="rain-drop group-hover:opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 8}px`,
                height: `${3 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
        
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
           <img src="https://presidencyuniversity.in/assets/images/overview-logo.webp" alt="PU" className="h-32 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-2">
          <Badge className="bg-white/10 text-sidebar-primary border-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-widest mb-4">Official Portal</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-xl">
            Greetings, <span className="text-sidebar-primary drop-shadow-xl">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white text-sm md:text-base max-w-md font-medium leading-relaxed drop-shadow-lg">
            {user?.role === 'admin' ? 'Welcome back to the administrative command center. You have full oversight of all hostel operations.' : 
             user?.role === 'student' ? `Welcome to your digital residence. You are currently in Room ${user.room_number || 'N/A'}, ${user.block || 'Main Block'}.` :
             `Welcome to the Presidency University ${user?.role} portal. Your tools are ready.`}
          </p>
        </div>
      </motion.div>

      {/* Glassmorphic Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="glass-card group ios-hover water-drop-button hover:bg-white/90">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl bg-muted/50", stat.color.replace('text-', 'bg-').replace('/10', '/5'))}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} strokeWidth={2.5} />
                </div>
                <span className={cn("font-display text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground drop-shadow-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Refined Quick Actions */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center gap-4">
           <h2 className="font-display text-lg font-black tracking-tight">Priority Actions</h2>
           <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentActions.map((action) => (
            <Link key={action.to} to={action.to} className="h-full">
              <Card className="ios-hover water-drop-button active:scale-95 group h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-all duration-500 shadow-lg", action.color)}>
                    <action.icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-tight leading-tight">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Institutional Notifications */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-black tracking-tight">Institutional Notifications</h2>
          <Link to="/announcements" className="text-[10px] uppercase font-black tracking-widest text-primary hover:underline transition-all">Archive</Link>
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

      {/* Support & Maintenance Inquiries */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-black tracking-tight">Support & Maintenance Inquiries</h2>
          <Link to="/tickets" className="text-[10px] uppercase font-black tracking-widest text-primary hover:underline transition-all">History</Link>
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
