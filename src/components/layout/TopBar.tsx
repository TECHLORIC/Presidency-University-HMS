import { Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { user } = useAppStore();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 py-3 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 items-center justify-center rounded-lg">
          <img src="/logo.png" alt="Presidency University" className="h-full w-auto object-contain" />
        </div>
        <h1 className="font-display text-sm font-bold">Hostel Portal</h1>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {user?.role} Portal
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Link>
      </div>
    </header>
  );
}
