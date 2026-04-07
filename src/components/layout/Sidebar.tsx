import { Home, FileText, Ticket, UtensilsCrossed, Megaphone, User, Bell, MessageSquare, Shield, Settings, Users, ClipboardList } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

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
    <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <Link 
        to="/" 
        className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors group"
      >
        <div className="flex h-10 items-center justify-center rounded-lg group-hover:scale-105 transition-transform">
          <img src="/logo.png" alt="Presidency University" className="h-full w-auto object-contain" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold text-sidebar-primary-foreground group-hover:text-sidebar-primary transition-colors">Hostel Portal</h1>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{currentRole} Access</p>
        </div>
      </Link>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {currentNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
               'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              location.pathname === item.to
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-3 border-t border-sidebar-border">
          <Link 
            to="/profile" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-sidebar-accent group",
              location.pathname === '/profile' && "bg-sidebar-accent"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground group-hover:scale-105 transition-transform">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate group-hover:text-sidebar-primary transition-colors">{user.name}</p>
              {user.roomNumber && <p className="text-xs text-sidebar-foreground/60">{user.roomNumber}</p>}
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
