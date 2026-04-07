import { Home, FileText, Ticket, UtensilsCrossed, MessageSquare, ClipboardList, Megaphone, User, Users, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const studentNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/leave', icon: FileText, label: 'Leave' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const wardenNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/leave', icon: ClipboardList, label: 'Approvals' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const navMap: Record<string, typeof studentNav> = {
  student: studentNav,
  warden: wardenNav,
  admin: adminNav,
};

export function BottomNav() {
  const location = useLocation();
  const { currentRole } = useAppStore();
  const currentNav = currentRole && navMap[currentRole] ? navMap[currentRole].slice(0, 5) : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      {currentNav.map((tab) => {
        const active = location.pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-all', active && 'bg-primary')}>
              <tab.icon className={cn('h-4 w-4', active ? 'text-primary-foreground' : '')} />
            </div>
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
