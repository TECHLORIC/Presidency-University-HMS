import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { 
  User as UserIcon, Mail, Phone, MapPin, Hash, Settings, 
  LogOut, ChevronRight, Camera, Save, Calendar, Home as HomeIcon, Loader2,
  Lock
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

export default function ProfileScreen() {
  const { user, logout, initializeAuth } = useAppStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
    const sanitizedData = {
      ...formData,
      dob: formData.dob === '' ? null : formData.dob
    };

    const { error } = await supabase
      .from('profiles')
      .update(sanitizedData)
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      await initializeAuth();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <PageContainer>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 pt-6"
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 800 }}
        >
          {/* Profile Header Card */}
          <Card className="rounded-[2.5rem] p-8 items-center border-border/40">
            <View className="relative">
              <View className="h-24 w-24 rounded-full bg-primary items-center justify-center overflow-hidden border-4 border-background shadow-2xl">
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} className="h-full w-full" />
                ) : (
                  <Text className="text-3xl font-black text-white">
                    {user.name?.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                )}
              </View>
              {isEditing && (
                <Pressable className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg border-2 border-background">
                  <Camera size={14} color="white" />
                </Pressable>
              )}
            </View>
            
            <Text className="text-xl font-black text-foreground mt-4">{user.name}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <Badge label={user.role} variant="outline" className="px-3" />
              <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {user.block || 'STAFF'} · Room {user.room_number || 'N/A'}
              </Text>
            </View>

            <View className="flex-row gap-3 mt-6">
              {!isEditing ? (
                <Button 
                  label="Edit Profile" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full px-8"
                  onPress={() => setIsEditing(true)} 
                />
              ) : (
                <>
                  <Button label="Cancel" variant="ghost" size="sm" onPress={() => setIsEditing(false)} />
                  <Button 
                    label={loading ? "Saving..." : "Save"} 
                    size="sm" 
                    className="rounded-full px-8" 
                    onPress={handleUpdate} 
                    loading={loading}
                  />
                </>
              )}
            </View>
          </Card>
        </MotiView>

        {!isEditing ? (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="mt-6 space-y-6"
          >
            {/* Personal Details Card */}
            <Card className="rounded-[2rem] border-border/30 overflow-hidden">
              <View className="p-5 border-b border-border/10 bg-muted/5">
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Details</Text>
              </View>
              <View className="p-2">
                {[
                  { icon: Hash, label: 'Roll Number', value: user.roll_no || 'Not set' },
                  { icon: Calendar, label: 'Date of Birth', value: user.dob || 'Not set' },
                  { icon: Mail, label: 'Email', value: user.email },
                  { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
                ].map((item, i) => (
                  <View key={item.label} className={cn("flex-row items-center gap-4 p-4", i !== 3 && "border-b border-border/5")}>
                    <View className="h-9 w-9 rounded-xl bg-primary/5 items-center justify-center">
                      <item.icon size={16} color="#a1a1aa" />
                    </View>
                    <View>
                      <Text className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{item.label}</Text>
                      <Text className="text-sm font-bold text-foreground mt-0.5">{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* Emergency Details Card */}
            <Card className="rounded-[2rem] border-border/30 overflow-hidden">
              <View className="p-5 border-b border-border/10 bg-muted/5">
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guardian & Emergency</Text>
              </View>
              <View className="p-2">
                {[
                  { icon: Phone, label: 'Parent Phone', value: user.parent_phone || 'Not set' },
                  { icon: Phone, label: 'Emergency Contact', value: user.emergency_contact || 'Not set' },
                  { icon: HomeIcon, label: 'Address', value: user.home_address || 'Not set' },
                ].map((item, i) => (
                  <View key={item.label} className={cn("flex-row items-center gap-4 p-4", i !== 2 && "border-b border-border/5")}>
                    <View className="h-9 w-9 rounded-xl bg-primary/5 items-center justify-center">
                      <item.icon size={16} color="#a1a1aa" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{item.label}</Text>
                      <Text className="text-sm font-bold text-foreground mt-0.5">{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </MotiView>
        ) : (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mt-6 space-y-4"
          >
            <Card className="rounded-[2.5rem] p-6 space-y-5 border-border/30">
               <Input label="Roll Number" value={formData.roll_no} onChangeText={v => setFormData({...formData, roll_no: v})} placeholder="e.g. PU101" />
               <Input label="Date of Birth" value={formData.dob} onChangeText={v => setFormData({...formData, dob: v})} placeholder="YYYY-MM-DD" />
               <Input label="Phone Number" value={formData.phone} onChangeText={v => setFormData({...formData, phone: v})} placeholder="10-digit number" />
               <Input label="Parent Phone" value={formData.parent_phone} onChangeText={v => setFormData({...formData, parent_phone: v})} placeholder="Guardian number" />
               <Input label="Home Address" value={formData.home_address} onChangeText={v => setFormData({...formData, home_address: v})} multiline placeholder="Full address..." />
            </Card>
          </MotiView>
        )}

        {/* System Actions */}
        <View className="mt-8 mb-10">
          <Card className="rounded-3xl border-border/30 overflow-hidden">
             <Pressable 
              onPress={handleLogout}
              className="flex-row items-center justify-between p-5 bg-destructive/5"
             >
                <View className="flex-row items-center gap-4">
                  <LogOut size={18} color="#ef4444" />
                  <Text className="text-[10px] font-black uppercase tracking-widest text-destructive">Sign Out</Text>
                </View>
                <ChevronRight size={16} color="#ef4444" opacity={0.3} />
             </Pressable>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
