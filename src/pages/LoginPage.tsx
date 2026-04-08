import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    } 

    if (authData?.user) {
      // Check if profile exists for this new user
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
      
      if (!profile) {
        toast.error("User authenticated, but no database profile found! Please add a row for this user in the 'profiles' SQL table.");
        await supabase.auth.signOut();
        setLoading(false);
      } else {
        toast.success("Successfully logged in!");
        // Navigation is securely handled by the useEffect once store fully syncs
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sidebar-primary/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="fixed inset-0 mesh-gradient opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card shadow-2xl border-white/20 p-2">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] p-4 bg-white shadow-xl group border border-sidebar-primary/5 transition-transform hover:scale-105 duration-700">
              <img src="https://presidencyuniversity.in/assets/images/overview-logo.webp" alt="Presidency University" className="h-full w-auto object-contain" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight text-primary">University Portal</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">Hostel Management System</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-input bg-muted/30 px-4 py-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="student@presidency.edu"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-input bg-muted/30 px-4 py-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-primary text-primary-foreground px-4 py-4 font-black uppercase text-xs tracking-widest shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10">{loading ? 'Verifying Identity...' : 'Authorized Entry'}</span>
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/60 font-medium">Secured by Presidency University Student Affairs</p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
