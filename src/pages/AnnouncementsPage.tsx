import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, AlertTriangle, Info, Star, Plus, Trash2, Clock, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const priorityConfig: Record<string, { icon: any, color: string, badge: string }> = {
  urgent: { icon: AlertTriangle, color: 'bg-destructive/10 text-destructive', badge: 'bg-destructive text-destructive-foreground' },
  important: { icon: Star, color: 'bg-warning/10 text-warning', badge: 'bg-warning text-warning-foreground' },
  normal: { icon: Info, color: 'bg-info/10 text-info', badge: 'bg-info text-info-foreground' },
};

export default function AnnouncementsPage() {
  const { user } = useAppStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select(`*, profiles(name)`).order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async () => {
    if (!title || !message) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase.from('announcements').insert({
      title,
      message,
      priority,
      created_by: user?.id
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Announcement posted');
      setOpen(false);
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Announcement deleted');
      fetchAnnouncements();
      if (selectedAnnouncement?.id === id) setSelectedAnnouncement(null);
    }
  };

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Latest updates from hostel administration</p>
        </div>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />New Post</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle className="font-display">Post Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement heading" className="mt-1.5 rounded-xl border-border/50" /></div>
                <div><Label>Priority</Label>
                   <Select value={priority} onValueChange={setPriority}>
                     <SelectTrigger className="rounded-xl border-border/50"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Full announcement text..." className="mt-1.5 h-32 rounded-xl border-border/50" /></div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">Post to All students</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
             <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
             <p className="text-muted-foreground font-medium">No recent announcements.</p>
          </div>
        ) : announcements.map((a, i) => {
          const config = priorityConfig[a.priority] || priorityConfig.normal;
          const PriorityIcon = config.icon;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card 
                className="group relative overflow-hidden border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all cursor-pointer"
                onClick={() => setSelectedAnnouncement(a)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${config.color}`}>
                      <PriorityIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-base font-bold truncate group-hover:text-primary transition-colors">{a.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>{a.priority}</span>
                        </div>
                        {isStaff && (
                           <button onClick={(e) => handleDelete(e, a.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-full transition-all text-destructive">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{a.message}</p>
                      <div className="flex items-center gap-3 mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5"><UserIcon className="h-3 w-3" /> {a.profiles?.name || 'Admin'}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Announcement Modal */}
      {selectedAnnouncement && (
        <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
            <div className={`p-8 ${priorityConfig[selectedAnnouncement.priority].color} border-b flex items-center gap-4`}>
               {(() => {
                 const Config = priorityConfig[selectedAnnouncement.priority];
                 const Icon = Config.icon;
                 return <Icon className="h-10 w-10 shrink-0" />;
               })()}
               <div>
                  <h2 className="text-2xl font-display font-black tracking-tight">{selectedAnnouncement.title}</h2>
                  <div className="flex items-center gap-3 mt-1 opacity-70">
                     <span className="text-xs font-bold uppercase tracking-widest">Priority: {selectedAnnouncement.priority}</span>
                     <span className="h-1 w-1 rounded-full bg-current" />
                     <span className="text-xs font-medium">{new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                  </div>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                     {selectedAnnouncement.message}
                  </p>
               </div>
               
               <div className="pt-6 border-t flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {selectedAnnouncement.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                     </div>
                     <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Posted By</p>
                        <p className="text-sm font-bold">{selectedAnnouncement.profiles?.name || 'Administrator'}</p>
                     </div>
                  </div>
                  <Button variant="outline" className="rounded-full px-6" onClick={() => setSelectedAnnouncement(null)}>Close</Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
