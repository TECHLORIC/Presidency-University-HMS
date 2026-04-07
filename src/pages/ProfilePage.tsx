import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { 
  User as UserIcon, Mail, Phone, MapPin, Hash, Settings, 
  LogOut, ChevronRight, Camera, Save, Calendar, Home, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout, initializeAuth } = useAppStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roll_no: '',
    dob: '',
    parent_phone: '',
    emergency_contact: '',
    home_address: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        roll_no: user.roll_no || '',
        dob: user.dob || '',
        parent_phone: user.parent_phone || '',
        emergency_contact: user.emergency_contact || '',
        home_address: user.home_address || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleUpdate = async () => {
    setLoading(true);
    
    // Sanitize data: Postgres doesn't like empty strings for DATE types
    const sanitizedData = {
      ...formData,
      dob: formData.dob === '' ? null : formData.dob
    };

    const { error } = await supabase
      .from('profiles')
      .update(sanitizedData)
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      await initializeAuth(); // Refresh global user state
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar: publicUrl }));
      toast.success('Photo uploaded successfully!');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*" 
      />

      {/* Profile Header */}
      <Card className="rounded-2xl p-6 text-center relative overflow-hidden transition-all border-border/50">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        <div className="relative inline-block mt-4">
          <div className="group h-24 w-24 rounded-full bg-primary mx-auto flex items-center justify-center overflow-hidden shadow-xl border-4 border-background relative">
            {formData.avatar ? (
              <img src={formData.avatar} alt={user.name} className={cn("h-full w-full object-cover transition-opacity", uploading && "opacity-40")} />
            ) : (
              <span className={cn("font-display text-3xl font-bold text-primary-foreground transition-opacity", uploading && "opacity-40")}>
                {user.name?.split(' ').map((n: string) => n[0]).join('')}
              </span>
            )}
            
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="h-8 w-8 text-white animate-spin drop-shadow-md" />
              </div>
            )}
          </div>
          
          {isEditing && (
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={uploading}
               className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:after:bg-black/10 hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
             >
                <Camera className="h-4 w-4" />
             </button>
          )}
        </div>
        <h1 className="font-display text-xl font-bold mt-4 line-clamp-1">{user.name}</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
           <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-widest px-2">{user.role}</Badge>
           <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{user.block || 'Staff Block'} · Room {user.room_number || 'N/A'}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-5">
          {!isEditing ? (
            <Button variant="outline" size="sm" className="rounded-full gap-2 px-6 h-9" onClick={() => setIsEditing(true)}>
               <Settings className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <>
               <Button variant="ghost" size="sm" className="rounded-full px-6 h-9" onClick={() => setIsEditing(false)} disabled={loading || uploading}>Cancel</Button>
               <Button size="sm" className="rounded-full gap-2 px-6 h-9 shadow-lg shadow-primary/20" onClick={handleUpdate} disabled={loading || uploading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
                  {loading ? 'Saving...' : 'Save Changes'}
               </Button>
            </>
          )}
        </div>
      </Card>

      {!isEditing ? (
        <div className="grid gap-6">
          {/* Static Info View */}
          <Card className="rounded-2xl border-border/50">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-muted/5">
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Details</h2>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { icon: Hash, label: 'Roll Number', value: user.roll_no || 'Not set' },
                  { icon: Calendar, label: 'Date of Birth', value: user.dob ? new Date(user.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not set' },
                  { icon: Mail, label: 'Login Email', value: user.email },
                  { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-5 py-4">
                    <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-70 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-muted/5">
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guardian & Emergency</h2>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { icon: Phone, label: 'Parent Phone', value: user.parent_phone || 'Not set' },
                  { icon: Phone, label: 'Emergency Contact', value: user.emergency_contact || 'Not set' },
                  { icon: Home, label: 'Home Address', value: user.home_address || 'Not set' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-5 py-4">
                    <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-70 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Edit Form View */}
          <Card className="rounded-2xl p-6 space-y-4 border-border/50">
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Login Email</Label>
               <Input value={user.email} disabled className="bg-muted/50 cursor-not-allowed rounded-xl border-border/50" />
               <p className="text-[10px] text-muted-foreground italic ml-1">Your primary account email used for sign-in.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Roll Number</Label>
                  <Input 
                    value={formData.roll_no} 
                    onChange={e => setFormData({ ...formData, roll_no: e.target.value })} 
                    placeholder="e.g. PU101" 
                    className="rounded-xl border-border/50 focus-visible:ring-primary"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</Label>
                  <Input 
                    type="date" 
                    value={formData.dob} 
                    onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                    className="rounded-xl border-border/50 focus-visible:ring-primary"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
               <Input 
                 value={formData.phone} 
                 onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                 placeholder="Your 10-digit number" 
                 className="rounded-xl border-border/50 focus-visible:ring-primary"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Parent Phone</Label>
                  <Input 
                    value={formData.parent_phone} 
                    onChange={e => setFormData({ ...formData, parent_phone: e.target.value })} 
                    className="rounded-xl border-border/50 focus-visible:ring-primary"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emergency Contact</Label>
                  <Input 
                    value={formData.emergency_contact} 
                    onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })} 
                    className="rounded-xl border-border/50 focus-visible:ring-primary"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Home Address</Label>
               <Textarea 
                 value={formData.home_address} 
                 onChange={e => setFormData({ ...formData, home_address: e.target.value })} 
                 placeholder="Full home address..." 
                 rows={3} 
                 className="rounded-xl border-border/50 focus-visible:ring-primary min-h-[100px]"
               />
            </div>

            <div className="space-y-2 pt-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Image URL</Label>
               <div className="flex gap-2">
                  <Input 
                    value={formData.avatar} 
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })} 
                    placeholder="https://image-url.com/profile.jpg" 
                    className="rounded-xl border-border/50 focus-visible:ring-primary flex-1"
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-4 border-dashed border-2 hover:border-primary transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     <Camera className="h-4 w-4 mr-2" /> Upload
                  </Button>
               </div>
               <p className="text-[10px] text-muted-foreground italic ml-1">Paste a link or use the upload button to change your photo.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Main Actions */}
      <Card className="rounded-2xl divide-y divide-border overflow-hidden border-border/50">
        <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-4 w-full hover:bg-destructive/5 transition-all text-destructive font-bold uppercase tracking-widest text-[10px]">
          <LogOut className="h-4.5 w-4.5" />
          <span className="flex-1 text-left">Sign Out</span>
          <ChevronRight className="h-4 w-4 opacity-50" />
        </button>
      </Card>
    </motion.div>
  );
}
