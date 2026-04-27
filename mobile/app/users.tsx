import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, RefreshControl, TextInput } from 'react-native';
import { MotiView } from 'moti';
import { 
  Users, Search, Filter, Trash2, ShieldAlert, MapPin, 
  Phone, Calendar, Mail, User as UserIcon, Hash, ChevronRight 
} from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { usersApi } from '../lib/api/users';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const roles = [
  'student', 'warden', 'maintenance', 'mess', 'parent', 'guard', 'admin'
];

export default function UsersScreen() {
  const { user: currentUser } = useAppStore();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchProfiles = async () => {
    try {
      const data = await usersApi.getAll();
      setProfiles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfiles();
    setRefreshing(false);
  };

  const handleRoleChange = async (profileId: string, newRole: string) => {
    if (profileId === currentUser?.id) {
      Alert.alert("Error", "You cannot change your own role!");
      return;
    }

    try {
      setLoading(true);
      await usersApi.updateRole(profileId, newRole);
      Alert.alert('Success', `Role updated to ${newRole}`);
      await fetchProfiles();
      if (selectedUser?.id === profileId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profileId === currentUser?.id) {
       Alert.alert("Error", "You cannot delete your own profile!");
       return;
    }

    Alert.alert(
      "Delete Profile",
      "Are you sure? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await usersApi.delete(profileId);
              Alert.alert('Success', 'Profile deleted');
              await fetchProfiles();
              setDetailModalVisible(false);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredProfiles = profiles.filter(p => 
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || p.role === roleFilter)
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        className="flex-1 p-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xl font-black text-foreground">User Management</Text>
            <Text className="text-xs text-muted-foreground">Manage roles & access</Text>
          </View>
          <Badge label="Admin Access" variant="destructive" className="rounded-full" />
        </View>

        <View className="space-y-4 mb-6">
          <Input 
            placeholder="Search users..." 
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="rounded-full"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <Pressable 
              onPress={() => setRoleFilter('all')}
              className={cn("px-4 py-2 rounded-full border border-border", roleFilter === 'all' ? "bg-primary border-primary" : "bg-muted/30")}
            >
              <Text className={cn("text-[10px] font-black uppercase", roleFilter === 'all' ? "text-white" : "text-muted-foreground")}>All</Text>
            </Pressable>
            {roles.map(r => (
              <Pressable 
                key={r}
                onPress={() => setRoleFilter(r)}
                className={cn("px-4 py-2 rounded-full border border-border", roleFilter === r ? "bg-primary border-primary" : "bg-muted/30")}
              >
                <Text className={cn("text-[10px] font-black uppercase", roleFilter === r ? "text-white" : "text-muted-foreground")}>{r}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="space-y-3">
          {filteredProfiles.map((p, i) => (
            <MotiView
              key={p.id}
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 50 }}
            >
              <Pressable 
                onPress={() => {
                  setSelectedUser(p);
                  setDetailModalVisible(true);
                }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-10 w-10 rounded-full bg-primary items-center justify-center">
                        <Text className="text-xs font-bold text-white">
                          {p.name?.split(' ').map((n: string) => n[0]).join('')}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{p.name || 'Unnamed'}</Text>
                        <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{p.email}</Text>
                      </View>
                    </View>
                    <Badge 
                      label={p.role} 
                      variant="outline" 
                      className={cn("h-6 border-transparent", p.role === 'admin' ? 'bg-destructive/10' : 'bg-info/10')} 
                      labelClassName={p.role === 'admin' ? 'text-destructive' : 'text-info'}
                    />
                  </CardContent>
                </Card>
              </Pressable>
            </MotiView>
          ))}
        </View>
      </ScrollView>

      {/* User Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 p-6">
          {selectedUser && (
            <MotiView 
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[2.5rem] overflow-hidden"
            >
              <View className="p-8 items-center border-b border-border/50">
                <View className="h-20 w-20 rounded-full bg-primary items-center justify-center shadow-xl mb-4">
                  <Text className="text-2xl font-black text-white">
                    {selectedUser.name?.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
                <Text className="text-lg font-black text-foreground">{selectedUser.name}</Text>
                <Badge label={selectedUser.role} variant="outline" className="mt-2" />
              </View>

              <ScrollView className="p-8 space-y-6 max-h-[400px]">
                <View className="space-y-4">
                  <View className="flex-row items-center gap-4">
                    <Mail size={16} color="#a1a1aa" />
                    <View>
                      <Text className="text-[9px] font-black uppercase text-muted-foreground">Email</Text>
                      <Text className="text-sm font-bold text-foreground">{selectedUser.email}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <Hash size={16} color="#a1a1aa" />
                    <View>
                      <Text className="text-[9px] font-black uppercase text-muted-foreground">Registration</Text>
                      <Text className="text-sm font-bold text-foreground">{selectedUser.registration_id || 'N/A'}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <MapPin size={16} color="#a1a1aa" />
                    <View>
                      <Text className="text-[9px] font-black uppercase text-muted-foreground">Location</Text>
                      <Text className="text-sm font-bold text-foreground">Room {selectedUser.room_number || 'N/A'} · {selectedUser.block || 'Staff'}</Text>
                    </View>
                  </View>
                </View>

                <View className="pt-6 border-t border-border/50">
                  <Text className="text-[9px] font-black uppercase text-muted-foreground mb-3">Change Role</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {roles.map(r => (
                      <Pressable 
                        key={r}
                        onPress={() => handleRoleChange(selectedUser.id, r)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border border-border",
                          selectedUser.role === r ? "bg-primary border-primary" : "bg-muted/30"
                        )}
                      >
                        <Text className={cn("text-[9px] font-black uppercase", selectedUser.role === r ? "text-white" : "text-foreground")}>{r}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View className="p-8 pt-4 border-t border-border/50 flex-row gap-3">
                <Button label="Close" variant="outline" className="flex-1" onPress={() => setDetailModalVisible(false)} />
                <Button label="Delete" variant="destructive" className="flex-1" onPress={() => handleDeleteProfile(selectedUser.id)} />
              </View>
            </MotiView>
          )}
        </View>
      </Modal>
    </View>
  );
}
