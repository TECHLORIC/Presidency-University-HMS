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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-24 items-center justify-center rounded-xl p-2 bg-white">
              <img src="/logo.png" alt="Presidency University" className="h-full w-auto object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display mt-2">Hostel Portal</CardTitle>
              <CardDescription>Sign in to access your portal</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="name@presidency.edu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 mt-4 font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
