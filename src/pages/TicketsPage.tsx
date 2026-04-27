import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Wifi, Zap, Brush, Wrench, Package, MessageSquare, Send, Clock, User as UserIcon, MapPin, Hash, ShieldAlert, Ticket } from 'lucide-react';
import { TicketCategory } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ticketsApi } from '@/lib/api/tickets';

const categoryIcons: Record<string, typeof Droplets> = {
  water: Droplets, wifi: Wifi, electricity: Zap, cleaning: Brush, plumbing: Wrench, furniture: Package, other: Package,
};

const statusColors: Record<string, string> = {
  open: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-info/10 text-info border-info/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function TicketsPage() {
  const { user } = useAppStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  
  // Detailed View State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [message, setMessage] = useState('');

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const data = await ticketsApi.getAll(user.id, user.role);
      setTickets(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async () => {
    if (!title || !desc || !user) { toast.error('Please fill all fields'); return; }
    
    try {
      await ticketsApi.create({
        title,
        description: desc,
        category,
        userId: user.id,
        roomNumber: user.room_number || 'N/A'
      });

      toast.success('Ticket raised successfully');
      setOpen(false); setTitle(''); setDesc(''); setCategory('other');
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await ticketsApi.updateStatus(id, newStatus);
      toast.success('Status updated');
      fetchTickets();
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.info("Messaging system arriving in next update!");
    setMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.role === 'student' ? 'Raise and track maintenance issues' : 'Manage hostel maintenance requests'}
          </p>
        </div>
        {user?.role === 'student' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />New Ticket</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Raise a Ticket</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" className="mt-1.5 rounded-xl border-border/50" /></div>
                <div><Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                    <SelectTrigger className="mt-1.5 rounded-xl border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['water', 'electricity', 'cleaning', 'wifi', 'plumbing', 'furniture', 'other'] as TicketCategory[]).map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the issue in detail..." className="mt-1.5 rounded-xl border-border/50 h-24" /></div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">Submit Ticket</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {tickets.map((ticket) => {
            const Icon = categoryIcons[ticket.category] || Package;
            const canManage = user?.role !== 'student';

            return (
              <motion.div 
                key={ticket.id} 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card 
                  className="overflow-hidden border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${priorityColors[ticket.priority]} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{ticket.title}</h3>
                          <Badge variant="outline" className={cn("text-[10px] h-4 py-0", statusColors[ticket.status])}>
                             {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ticket.room_number || 'N/A'} · <span className="capitalize">{ticket.category}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto md:ml-0" onClick={(e) => e.stopPropagation()}>
                       {canManage && (
                         <Select 
                           value={ticket.status} 
                           onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                         >
                           <SelectTrigger className={cn("h-8 w-fit text-[11px] font-bold border-0 px-3 rounded-full uppercase tracking-tighter", statusColors[ticket.status])}>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {Object.keys(statusColors).map(s => (
                               <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace('_', ' ')}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       )}
                       <p className="text-xs text-muted-foreground/60 whitespace-nowrap">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {tickets.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
             <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
             <p className="text-muted-foreground font-medium">No tickets raised yet.</p>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden">
            <div className="p-6 border-b">
               <div className="flex items-center gap-3 mb-4">
                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${priorityColors[selectedTicket.priority]}`}>
                    {(() => {
                      const Icon = categoryIcons[selectedTicket.category] || Package;
                      return <Icon className="h-6 w-6" />;
                    })()}
                 </div>
                 <div className="min-w-0">
                    <DialogTitle className="font-display text-xl font-bold truncate">{selectedTicket.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                       <Badge variant="outline" className={cn("capitalize h-5", statusColors[selectedTicket.status])}>
                          {selectedTicket.status.replace('_', ' ')}
                       </Badge>
                       <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(selectedTicket.created_at).toLocaleDateString()}
                       </p>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 py-4 bg-muted/30 rounded-xl px-4">
                  <div className="flex items-center gap-2">
                     <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                     <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase font-black leading-none">Room No</p>
                        <p className="text-sm font-bold">{selectedTicket.room_number || 'N/A'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Package className="h-3.5 w-3.5 text-muted-foreground" />
                     <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase font-black leading-none">Category</p>
                        <p className="text-sm font-bold capitalize">{selectedTicket.category}</p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</h4>
                  <div className="p-4 bg-muted/10 rounded-xl text-sm leading-relaxed border border-border/40">
                     {selectedTicket.description || "No description provided."}
                  </div>
               </div>
            </div>

            {/* Chat/Messages Section */}
            <div className="flex flex-col h-[300px] bg-background">
               <div className="p-3 border-b flex items-center justify-between bg-muted/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                     <MessageSquare className="h-3 w-3" /> 
                     Communication History
                  </span>
               </div>
               <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                     <MessageSquare className="h-8 w-8 mb-2" />
                     <p className="text-xs font-medium">Messages will appear here</p>
                  </div>
               </div>
               <div className="p-3 border-t bg-muted/5 flex items-center gap-2">
                  <Input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Type a message or note..." 
                    className="h-9 rounded-full bg-background/50 text-xs border-transparent focus-visible:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" className="h-9 w-9 rounded-full shrink-0" onClick={handleSendMessage}>
                     <Send className="h-4 w-4" />
                  </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
