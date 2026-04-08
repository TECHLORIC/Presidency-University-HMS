import { Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { user } = useAppStore();

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-white/20 backdrop-blur-xl px-4 py-4 md:px-8 relative z-20">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm p-1">
          <img src="https://presidencyuniversity.in/assets/images/overview-logo.webp" alt="PU Logo" className="h-full w-auto object-contain" />
        </div>
        <h1 className="font-display text-sm font-black uppercase tracking-tight text-primary">HMS Portal</h1>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[10px] font-black tracking-widest text-primary/80 uppercase drop-shadow-sm">
          {user?.role} status: operational
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/40 shadow-sm border border-white/20 hover:bg-white transition-all active:scale-90 group overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Bell className="h-4.5 w-4.5 text-primary relative z-10" strokeWidth={2.5} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-white animate-bounce" />
        </Link>
      </div>
    </header>
  );
}
