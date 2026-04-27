import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, Modal, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { 
  Megaphone, AlertTriangle, Info, Star, Plus, Trash2, 
  Clock, User as UserIcon, X, ChevronRight 
} from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { announcementsApi } from '../lib/api/announcements';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const priorityConfig: Record<string, { icon: any, color: string, textColor: string, badge: string, bgColor: string }> = {
  urgent: { icon: AlertTriangle, color: 'text-destructive', textColor: '#ef4444', badge: 'bg-destructive', bgColor: 'bg-destructive/10' },
  important: { icon: Star, color: 'text-warning', textColor: '#f59e0b', badge: 'bg-warning', bgColor: 'bg-warning/10' },
  normal: { icon: Info, color: 'text-info', textColor: '#0ea5e9', badge: 'bg-info', bgColor: 'bg-info/10' },
};

export default function AnnouncementsScreen() {
  const { user } = useAppStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!title || !message || !user) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await announcementsApi.create({
        title,
        message,
        priority,
        userId: user.id
      });
      Alert.alert('Success', 'Announcement posted');
      setCreateModalVisible(false);
      setTitle('');
      setMessage('');
      await fetchAnnouncements();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await announcementsApi.delete(id);
              await fetchAnnouncements();
              if (selectedAnnouncement?.id === id) setDetailModalVisible(false);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <PageContainer refreshing={refreshing} onRefresh={onRefresh}>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View>
            <Text className="text-2xl font-black text-foreground tracking-tight">Broadcasts</Text>
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Official Updates</Text>
          </View>
          {isStaff && (
            <Button 
              label="Post News" 
              size="sm" 
              onPress={() => setCreateModalVisible(true)}
              className="rounded-full px-5"
            />
          )}
        </View>

        <View className="space-y-4">
          {announcements.map((a, i) => {
            const config = priorityConfig[a.priority] || priorityConfig.normal;
            const Icon = config.icon;

            return (
              <MotiView
                key={a.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 50 }}
              >
                <Pressable 
                  onPress={() => {
                    setSelectedAnnouncement(a);
                    setDetailModalVisible(true);
                  }}
                >
                  <Card className="border-border/30 overflow-hidden">
                    <CardContent className="p-0">
                       <View className={cn("p-5 flex-row items-start gap-4", config.bgColor)}>
                        <View className={cn("h-12 w-12 rounded-2xl items-center justify-center bg-white shadow-sm")}>
                          <Icon size={24} color={config.textColor} strokeWidth={2.5} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-sm font-black text-foreground flex-1 pr-2" numberOfLines={1}>{a.title}</Text>
                            <Badge label={a.priority} variant="outline" className="bg-white/20 border-transparent h-4" labelClassName={cn("text-[7px]", config.color)} />
                          </View>
                          <Text className="text-xs text-muted-foreground leading-relaxed" numberOfLines={2}>{a.message}</Text>
                        </View>
                      </View>
                      
                      <View className="p-4 flex-row items-center justify-between border-t border-border/10">
                        <View className="flex-row items-center gap-4">
                          <View className="flex-row items-center gap-2">
                             <View className="h-6 w-6 rounded-full bg-primary items-center justify-center">
                               <Text className="text-[7px] font-black text-white">{a.profiles?.name?.[0] || 'A'}</Text>
                             </View>
                             <Text className="text-[10px] font-bold text-foreground">{a.profiles?.name || 'Administrator'}</Text>
                          </View>
                          <View className="flex-row items-center gap-1.5">
                            <Clock size={10} color="#a1a1aa" />
                            <Text className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</Text>
                          </View>
                        </View>
                        {isStaff && (
                          <Pressable onPress={() => handleDelete(a.id)} className="p-1">
                            <Trash2 size={14} color="#ef4444" opacity={0.6} />
                          </Pressable>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              </MotiView>
            );
          })}

          {announcements.length === 0 && (
            <View className="items-center justify-center py-20 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/20">
              <Megaphone size={48} color="#a1a1aa" opacity={0.2} />
              <Text className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-4">No recent news</Text>
            </View>
          )}
        </View>
      </View>

      {/* Create Announcement Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <MotiView 
            from={{ translateY: 500 }}
            animate={{ translateY: 0 }}
            className="bg-card rounded-t-[3rem] p-8 pb-12 border-t border-border/50"
          >
            <View className="w-12 h-1.5 bg-border/20 rounded-full mx-auto mb-8" />
            <Text className="text-2xl font-black text-foreground mb-8">Post Broadcast</Text>
            
            <View className="space-y-6">
              <Input 
                label="Heading" 
                placeholder="Announcement title..." 
                value={title}
                onChangeText={setTitle}
              />
              
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-3">Priority Level</Text>
                <View className="flex-row gap-3">
                  {['normal', 'important', 'urgent'].map(p => (
                    <Pressable 
                      key={p}
                      onPress={() => setPriority(p)}
                      className={cn(
                        "px-4 py-2 rounded-2xl border",
                        priority === p ? "bg-primary border-primary" : "bg-muted/10 border-border/20"
                      )}
                    >
                      <Text className={cn("text-[10px] font-black uppercase tracking-widest", priority === p ? "text-white" : "text-muted-foreground")}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Input 
                label="Detailed Message" 
                placeholder="Full announcement text..." 
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
              />

              <View className="flex-row gap-4 pt-6">
                <Button label="Cancel" variant="ghost" className="flex-1" onPress={() => setCreateModalVisible(false)} />
                <Button label={loading ? "Posting..." : "Authorize Post"} className="flex-1 shadow-lg shadow-primary/20" onPress={handleSubmit} loading={loading} />
              </View>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/70 p-6">
          {selectedAnnouncement && (
            <MotiView 
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <View className={cn("p-10", priorityConfig[selectedAnnouncement.priority].bgColor)}>
                <View className="flex-row gap-5 items-center">
                  <View className="h-16 w-16 rounded-[1.5rem] bg-white items-center justify-center shadow-xl">
                    {(() => {
                      const Config = priorityConfig[selectedAnnouncement.priority];
                      const Icon = Config.icon;
                      return <Icon size={32} color={Config.textColor} strokeWidth={2.5} />;
                    })()}
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-foreground leading-tight">{selectedAnnouncement.title}</Text>
                    <Badge label={selectedAnnouncement.priority} variant="default" className={cn("mt-2", priorityConfig[selectedAnnouncement.priority].badge)} />
                  </View>
                </View>
              </View>

              <ScrollView className="p-10 max-h-[400px]">
                <Text className="text-base font-medium text-foreground leading-relaxed">
                  {selectedAnnouncement.message}
                </Text>
              </ScrollView>

              <View className="p-10 pt-4 border-t border-border/10 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 rounded-full bg-primary items-center justify-center shadow-md">
                    <Text className="text-lg font-black text-white">
                      {selectedAnnouncement.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[9px] font-black uppercase text-muted-foreground">Authorized By</Text>
                    <Text className="text-sm font-bold text-foreground">{selectedAnnouncement.profiles?.name || 'Administrator'}</Text>
                  </View>
                </View>
                <Button label="Close" variant="outline" size="sm" className="rounded-2xl px-6" onPress={() => setDetailModalVisible(false)} />
              </View>
            </MotiView>
          )}
        </View>
      </Modal>
    </PageContainer>
  );
}
