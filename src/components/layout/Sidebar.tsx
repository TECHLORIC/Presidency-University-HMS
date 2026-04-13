import { Home, FileText, Ticket, UtensilsCrossed, Megaphone, User, Bell, MessageSquare, Shield, Settings, Users, ClipboardList } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

const studentNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/leave', icon: FileText, label: 'Leave' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/mess', icon: UtensilsCrossed, label: 'Mess' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/security', icon: Shield, label: 'Room Security' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const wardenNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/leave', icon: ClipboardList, label: 'Leave Approvals' },
  { to: '/tickets', icon: Ticket, label: 'All Tickets' },
  { to: '/announcements', icon: Megaphone, label: 'Publish News' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Manage Users' },
  { to: '/leave', icon: ClipboardList, label: 'Manage Leaves' },
  { to: '/tickets', icon: Ticket, label: 'All Tickets' },
  { to: '/mess', icon: UtensilsCrossed, label: 'Mess System' },
  { to: '/announcements', icon: Megaphone, label: 'Hostel News' },
  { to: '/security', icon: Shield, label: 'Security Logs' },
  { to: '/settings', icon: Settings, label: 'System Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const maintenanceNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'All Tickets' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const messNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/mess', icon: UtensilsCrossed, label: 'Mess Menu' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const parentNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/leave', icon: FileText, label: "Child's Leave" },
  { to: '/mess', icon: UtensilsCrossed, label: 'Mess Menu' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const guardNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/security', icon: Shield, label: 'Security Logs' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const navMap: Record<string, typeof studentNav> = {
  student: studentNav,
  warden: wardenNav,
  admin: adminNav,
  maintenance: maintenanceNav,
  mess: messNav,
  parent: parentNav,
  guard: guardNav,
};

export function Sidebar() {
  const location = useLocation();
  const { currentRole, user } = useAppStore();

  const currentNav = currentRole && navMap[currentRole] ? navMap[currentRole] : studentNav;

  return (
    <aside className="hidden md:flex w-64 flex-col glass-sidebar relative z-30">
      <Link 
        to="/" 
        className="flex items-center gap-3 px-6 py-8 border-b border-sidebar-border/30 hover:bg-white/5 transition-all group"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-inner group-hover:scale-105 transition-all duration-500">
          <img src="https://presidencyuniversity.in/assets/images/overview-logo.webp" alt="Presidency University" className="h-full w-auto object-contain brightness-0 invert" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[11px] font-extrabold text-sidebar-primary uppercase tracking-widest leading-none mb-1 drop-shadow-sm">Presidency</h1>
          <p className="text-[9px] text-white/70 uppercase font-black tracking-tighter truncate drop-shadow-sm">{currentRole} portal</p>
        </div>
      </Link>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {currentNav.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all relative group ios-notification-option border-none',
                isActive
                  ? 'text-sidebar-primary bg-white/10'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              {isActive && (
                 <motion.div 
                   layoutId="active-pill" 
                   className="absolute left-0 w-1 h-5 bg-sidebar-primary rounded-r-full" 
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
              )}
              <item.icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-sidebar-primary" : "opacity-70")} strokeWidth={2.5} />
              <span className="tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-white/5 bg-black/10 backdrop-blur-md">
          <Link 
            to="/profile" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-white/5 group relative",
              location.pathname === '/profile' && "bg-white/5 shadow-inner"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-amber-600 flex items-center justify-center text-xs font-black text-sidebar-primary-foreground group-hover:scale-105 transition-all shadow-lg overflow-hidden">
               {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-white truncate leading-tight drop-shadow-md">{user.name}</p>
              <p className="text-[9px] text-white/70 uppercase font-bold tracking-widest mt-0.5 drop-shadow-sm">{user.role}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
