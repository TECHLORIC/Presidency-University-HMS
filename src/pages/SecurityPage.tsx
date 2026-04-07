import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, History, Clock, Lock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function SecurityPage() {
  const { user } = useAppStore();
  const [checklist, setChecklist] = useState({
    door: false,
    almirah: false,
    electronics: false
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const isComplete = checklist.door && checklist.almirah && checklist.electronics;

  const fetchLogs = async () => {
    let query = supabase
      .from('room_security_logs')
      .select('*, profiles(name)')
      .order('timestamp', { ascending: false })
      .limit(20);

    // Filter by room only for students/parents
    if (user?.role === 'student' || user?.role === 'parent') {
      if (!user?.room_number) return;
      query = query.eq('room_number', user.room_number);
    }

    const { data } = await query;
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleConfirm = async () => {
    if (!isComplete) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.from('room_security_logs').insert({
        user_id: user?.id,
        room_number: user?.room_number || 'N/A',
        status_snapshot: checklist,
        scanned_tag_id: 'MANUAL_VERIFICATION' // Simplified from NFC
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Room Secured Successfully!");
        setChecklist({ door: false, almirah: false, electronics: false });
        fetchLogs();
      }
    } catch (error: any) {
      toast.error(`Confirmation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Departure Checklist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Secure your room before leaving the hostel</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
           <Shield className="h-4 w-4 text-primary" />
           <span className="text-xs font-bold text-primary uppercase tracking-widest">Room {user?.room_number || 'N/A'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Checklist Section */}
        <div className="md:col-span-3 space-y-4">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/5 border-b py-4">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Security Sweep
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-3">
                  {[
                    { id: 'door', label: 'Main door is latched and locked.', icon: Lock },
                    { id: 'almirah', label: 'Personal almirah/cupboard is secured.', icon: Shield },
                    { id: 'electronics', label: 'Electronic appliances and lights are switched off.', icon: Zap },
                  ].map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                        checklist[item.id as keyof typeof checklist] ? "bg-primary/5 border-primary/20" : "bg-card border-border/50 hover:border-primary/20"
                      )}
                      onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                    >
                      <Checkbox 
                        checked={checklist[item.id as keyof typeof checklist]} 
                        className="rounded-full h-5 w-5 border-2 data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", checklist[item.id as keyof typeof checklist] ? "text-primary" : "text-foreground")}>
                          {item.label}
                        </p>
                      </div>
                      <item.icon className={cn("h-4 w-4", checklist[item.id as keyof typeof checklist] ? "text-primary/50" : "text-muted-foreground/30")} />
                    </div>
                  ))}
               </div>

               <Button 
                 className={cn("w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all", isComplete ? "shadow-lg shadow-primary/20" : "grayscale opacity-50 cursor-not-allowed")}
                 disabled={!isComplete || loading}
                 onClick={handleConfirm}
               >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? "Verifying..." : "Confirm Departure"}
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Room Logs / Accountability */}
        <div className="md:col-span-2 space-y-4">
           <Card className="border-border/50 shadow-sm h-fit">
              <CardHeader className="bg-muted/5 border-b py-4">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-4 w-4" /> Room History
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 {logs.length === 0 ? (
                   <div className="p-10 text-center space-y-2 opacity-50">
                      <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-xs font-medium">No recent security events.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-border/50">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-muted/5 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm border border-primary/20">
                                 {log.profiles?.name?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-bold text-foreground truncate">{log.profiles?.name}</p>
                                 <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.timestamp).toLocaleDateString()}
                                 </p>
                              </div>
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-tighter border border-success/20 shadow-sm">
                                 <Lock className="h-2.5 w-2.5" /> Secured
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
