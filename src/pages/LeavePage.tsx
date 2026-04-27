import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { leavesApi } from '@/lib/api/leaves';

const statusConfig: Record<string, { icon: any, color: string, label: string }> = {
  pending: { icon: Clock, color: 'bg-warning/10 text-warning', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'bg-success/10 text-success', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

export default function LeavePage() {
  const { user } = useAppStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  const fetchLeaves = async () => {
    if (!user) return;
    try {
      const data = await leavesApi.getAll(user.id, user.role);
      setLeaves(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleStatusUpdate = async (e: React.MouseEvent, id: string, status: any) => {
    e.stopPropagation();
    try {
      await leavesApi.updateStatus(id, status);
      toast.success(`Leave ${status}`);
      fetchLeaves();
      if (selectedLeave?.id === id) setSelectedLeave({ ...selectedLeave, status });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async () => {
    if (!reason || !fromDate || !toDate || !user) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      await leavesApi.apply(user.id, reason, fromDate, toDate);
      toast.success('Leave request submitted');
      setOpen(false);
      setReason('');
      setFromDate('');
      setToDate('');
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Leave Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Apply and track your leave requests</p>
        </div>
        {user?.role === 'student' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Reason</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe your reason for leave..." className="mt-1.5 rounded-xl border-border/50 h-24" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>From Date</Label>
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1.5 rounded-xl border-border/50" />
                  </div>
                  <div>
                    <Label>To Date</Label>
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1.5 rounded-xl border-border/50" />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3">
        {leaves.map((leave) => {
          const config = statusConfig[leave.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const isStaff = user?.role === 'warden' || user?.role === 'admin';

          return (
            <motion.div key={leave.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card 
                className="overflow-hidden border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => setSelectedLeave(leave)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                         <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{leave.reason}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {leave.from_date} → {leave.to_date}</span>
                      </div>
                      {isStaff && (
                        <div className="flex items-center gap-2 pt-1">
                           <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                              {leave.profiles?.name?.[0]}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{leave.profiles?.name || 'Loading...'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", config.color, "border-transparent shadow-sm")}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </span>
                      
                      {isStaff && leave.status === 'pending' && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                           <Button size="sm" variant="outline" onClick={(e) => handleStatusUpdate(e, leave.id, 'approved')} className="h-7 text-[10px] px-3 font-bold uppercase tracking-tighter bg-success/5 hover:bg-success/10 text-success border-success/20 rounded-full">Approve</Button>
                           <Button size="sm" variant="outline" onClick={(e) => handleStatusUpdate(e, leave.id, 'rejected')} className="h-7 text-[10px] px-3 font-bold uppercase tracking-tighter bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive/20 rounded-full">Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        
        {leaves.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
             <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
             <p className="text-muted-foreground font-medium">No leave requests found.</p>
          </div>
        )}
      </div>

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
          <DialogContent className="p-0 overflow-hidden sm:max-w-[450px] gap-0">
            <div className={cn("p-8 border-b", statusConfig[selectedLeave.status].color)}>
               <div className="flex items-center justify-between mb-4">
                  {(() => {
                    const Config = statusConfig[selectedLeave.status];
                    const Icon = Config.icon;
                    return <Icon className="h-12 w-12 opacity-80" />;
                  })()}
                  <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-background/50 border-0 shadow-lg")}>
                     {selectedLeave.status}
                  </Badge>
               </div>
               <h2 className="text-2xl font-display font-black tracking-tight leading-tight">{selectedLeave.reason}</h2>
            </div>

            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                     <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Departure</p>
                     <p className="text-sm font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {selectedLeave.from_date}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                     <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Expected Return</p>
                     <p className="text-sm font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {selectedLeave.to_date}</p>
                  </div>
               </div>

               {selectedLeave.profiles && (
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Identity</h4>
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg">
                             {selectedLeave.profiles.name?.[0]}
                          </div>
                          <div>
                             <p className="text-sm font-bold">{selectedLeave.profiles.name}</p>
                             <p className="text-[10px] font-medium text-muted-foreground">{selectedLeave.profiles.roll_no || 'N/A'} · Room {selectedLeave.profiles.room_number || 'Staff'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t flex gap-3">
                  {user?.role !== 'student' && selectedLeave.status === 'pending' ? (
                    <>
                      <Button className="flex-1 rounded-full bg-success hover:bg-success/90" onClick={(e) => handleStatusUpdate(e, selectedLeave.id, 'approved')}>Approve Leave</Button>
                      <Button variant="destructive" className="flex-1 rounded-full" onClick={(e) => handleStatusUpdate(e, selectedLeave.id, 'rejected')}>Reject</Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full rounded-full" onClick={() => setSelectedLeave(null)}>Close View</Button>
                  )}
               </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
