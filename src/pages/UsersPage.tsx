import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Trash2, Edit2, ShieldAlert, MapPin, Phone, Calendar, Mail, User as UserIcon, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
  const { user: currentUser } = useAppStore();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchProfiles = async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data, error } = await query;
    if (data) setProfiles(data);
    if (error) toast.error(error.message);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (profileId: string, newRole: string) => {
    if (profileId === currentUser?.id) {
      toast.error("You cannot change your own role!");
      return;
    }

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
    if (error) {
       toast.error(error.message);
    } else {
       toast.success(`Role updated to ${newRole}`);
       fetchProfiles();
       if (selectedUser?.id === profileId) {
         setSelectedUser({ ...selectedUser, role: newRole });
       }
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this user profile? This action is permanent.')) return;
    if (profileId === currentUser?.id) {
       toast.error("You cannot delete your own profile!");
       return;
    }

    const { error } = await supabase.from('profiles').delete().eq('id', profileId);
    if (error) {
       toast.error(error.message);
    } else {
       toast.success('Profile deleted successfully');
       fetchProfiles();
       if (selectedUser?.id === profileId) setSelectedUser(null);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || p.role === roleFilter)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Edit roles and manage hostel access</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
          <ShieldAlert className="h-3 w-3" />
          Admin Access
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 h-10 rounded-full bg-muted/20 border-transparent focus-visible:ring-primary" 
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] h-10 rounded-full bg-muted/20 border-transparent">
             <Filter className="h-4 w-4 mr-2 opacity-50" />
             <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="warden">Warden</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="mess">Mess Team</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="guard">Guard</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredProfiles.map((p) => (
          <Card key={p.id} className="overflow-hidden border-border/50 hover:bg-muted/30 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setSelectedUser(p)}>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  {p.name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                   <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{p.name || 'Unnamed User'}</h3>
                   <p className="text-xs text-muted-foreground truncate">{p.email || 'No email'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-muted-foreground">Role:</span>
                   <Select value={p.role} onValueChange={(val) => handleRoleChange(p.id, val)}>
                     <SelectTrigger className={`h-8 w-[140px] text-xs capitalize font-medium rounded-full border-0 ${
                       p.role === 'admin' ? 'bg-destructive/10 text-destructive' : p.role === 'warden' ? 'bg-warning/10 text-warning' : p.role === 'mess' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                     }`}>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="student" className="text-xs">Student</SelectItem>
                        <SelectItem value="warden" className="text-xs">Warden</SelectItem>
                        <SelectItem value="maintenance" className="text-xs">Maintenance Staff</SelectItem>
                        <SelectItem value="mess" className="text-xs">Mess Team</SelectItem>
                        <SelectItem value="parent" className="text-xs">Parent</SelectItem>
                        <SelectItem value="guard" className="text-xs">Guard</SelectItem>
                        <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                     </SelectContent>
                   </Select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                   <Button variant="ghost" size="sm" onClick={() => handleDeleteProfile(p.id)} className="h-8 group hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
              <DialogHeader className="mb-4">
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                   <UserIcon className="h-5 w-5 text-primary" />
                   User Profile
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 text-center pb-6 border-b">
                   {selectedUser.avatar ? (
                     <img src={selectedUser.avatar} alt={selectedUser.name} className="h-20 w-20 rounded-full object-cover shadow-lg mb-2" />
                   ) : (
                     <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg mb-2">
                        {selectedUser.name?.split(' ').map((n: string) => n[0]).join('')}
                     </div>
                   )}
                   <div className="space-y-1">
                      <h2 className="text-lg font-bold">{selectedUser.name}</h2>
                      <Badge variant="outline" className={`capitalize font-semibold ${
                        selectedUser.role === 'admin' ? 'border-destructive text-destructive' : selectedUser.role === 'warden' ? 'border-warning text-warning' : 'border-primary text-primary'
                      }`}>
                         {selectedUser.role}
                      </Badge>
                   </div>
                </div>

                <div className="grid gap-4 py-2">
                  <div className="flex items-center gap-3">
                     <Hash className="h-4 w-4 text-muted-foreground" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Registration & Roll No</p>
                        <p className="text-sm font-medium">{selectedUser.registration_id || 'N/A'} · {selectedUser.roll_no || 'No Roll No'}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date of Birth</p>
                        <p className="text-sm font-medium">{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not set'}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <Mail className="h-4 w-4 text-muted-foreground" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                        <p className="text-sm font-medium">{selectedUser.email}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                       <Phone className="h-4 w-4 text-muted-foreground" />
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Student Phone</p>
                          <p className="text-sm font-medium">{selectedUser.phone || 'N/A'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone className="h-4 w-4 text-muted-foreground" />
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Parent Phone</p>
                          <p className="text-sm font-medium">{selectedUser.parent_phone || 'N/A'}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <ShieldAlert className="h-4 w-4 text-destructive/70" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-destructive/70">Emergency Contact</p>
                        <p className="text-sm font-medium">{selectedUser.emergency_contact || 'None registered'}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Placement</p>
                        <p className="text-sm font-medium">Room {selectedUser.room_number || 'N/A'} · Block {selectedUser.block || 'Staff'}</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                     <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Home Address</p>
                        <p className="text-sm font-medium leading-relaxed">{selectedUser.home_address || 'Address not registered'}</p>
                     </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>Close</Button>
                   <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleDeleteProfile(selectedUser.id)}>
                      <Trash2 className="h-4 w-4" /> Delete Profile
                   </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {filteredProfiles.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
             <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
             <p className="text-muted-foreground font-medium">No users found.</p>
             <p className="text-xs text-muted-foreground/60 mt-1">Try broadening your search criteria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
