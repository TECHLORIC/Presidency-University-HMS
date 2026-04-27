import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare, ChevronRight, Hash } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { ticketsApi } from '../../lib/api/tickets';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { icon: any, color: string, label: string, textColor: string, bgColor: string }> = {
  open: { icon: AlertCircle, color: 'text-warning', label: 'Open', textColor: '#f59e0b', bgColor: 'bg-warning/10' },
  in_progress: { icon: Clock, color: 'text-info', label: 'In Progress', textColor: '#0ea5e9', bgColor: 'bg-info/10' },
  resolved: { icon: CheckCircle, color: 'text-success', label: 'Resolved', textColor: '#10b981', bgColor: 'bg-success/10' },
};

export default function TicketsScreen() {
  const { user } = useAppStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('maintenance');

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const data = await ticketsApi.getAll(user.id, user.role);
      setTickets(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      setLoading(true);
      await ticketsApi.updateStatus(id, status);
      Alert.alert('Success', `Ticket ${status.replace('_', ' ')}`);
      await fetchTickets();
      if (selectedTicket?.id === id) setDetailModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !user) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      await ticketsApi.create(user.id, title, description, category);
      Alert.alert('Success', 'Support ticket raised');
      setCreateModalVisible(false);
      setTitle('');
      setDescription('');
      await fetchTickets();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer refreshing={refreshing} onRefresh={onRefresh}>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View>
            <Text className="text-2xl font-black text-foreground tracking-tight">Support</Text>
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Ticket Inquiries</Text>
          </View>
          {user?.role === 'student' && (
            <Button 
              label="Raise Ticket" 
              size="sm" 
              onPress={() => setCreateModalVisible(true)}
              className="rounded-full px-5"
            />
          )}
        </View>

        <View className="space-y-4">
          {tickets.map((ticket, i) => {
            const config = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = config.icon;
            const isStaff = user?.role !== 'student' && user?.role !== 'parent';

            return (
              <MotiView
                key={ticket.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 50 }}
              >
                <Pressable 
                  onPress={() => {
                    setSelectedTicket(ticket);
                    setDetailModalVisible(true);
                  }}
                >
                  <Card className="border-border/30 overflow-hidden">
                    <CardContent className="p-0">
                      <View className={cn("p-5 flex-row justify-between items-start", config.bgColor)}>
                        <View className="flex-1 pr-4">
                          <Text className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">{ticket.category}</Text>
                          <Text className="text-sm font-black text-foreground leading-tight" numberOfLines={2}>{ticket.title}</Text>
                        </View>
                        <Badge 
                          label={config.label} 
                          variant="outline" 
                          className="bg-white/20 border-transparent" 
                          labelClassName={cn("text-[8px] font-black", config.color)}
                        />
                      </View>
                      
                      <View className="p-4 flex-row items-center justify-between border-t border-border/10">
                        <View className="flex-row items-center gap-4">
                          {isStaff ? (
                             <View className="flex-row items-center gap-2">
                                <View className="h-6 w-6 rounded-full bg-primary items-center justify-center">
                                  <Text className="text-[7px] font-black text-white">{ticket.profiles?.name?.[0]}</Text>
                                </View>
                                <Text className="text-[10px] font-bold text-foreground">{ticket.profiles?.name}</Text>
                             </View>
                          ) : (
                            <View className="flex-row items-center gap-1.5">
                              <Hash size={10} color="#a1a1aa" />
                              <Text className="text-[10px] font-black text-muted-foreground uppercase">TKT-{ticket.id.slice(0, 4)}</Text>
                            </View>
                          )}
                          <View className="flex-row items-center gap-1.5">
                            <Clock size={10} color="#a1a1aa" />
                            <Text className="text-[10px] text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</Text>
                          </View>
                        </View>
                        <ChevronRight size={14} color="#a1a1aa" />
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              </MotiView>
            );
          })}

          {tickets.length === 0 && (
            <View className="items-center justify-center py-20 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/20">
              <MessageSquare size={48} color="#a1a1aa" opacity={0.2} />
              <Text className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-4">No active tickets</Text>
            </View>
          )}
        </View>
      </View>

      {/* Raise Ticket Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <MotiView 
            from={{ translateY: 400 }}
            animate={{ translateY: 0 }}
            className="bg-card rounded-t-[3rem] p-8 pb-12 border-t border-border/50"
          >
            <View className="w-12 h-1.5 bg-border/20 rounded-full mx-auto mb-8" />
            <Text className="text-2xl font-black text-foreground mb-8">Raise Support Ticket</Text>
            
            <View className="space-y-6">
              <View className="flex-row gap-2">
                {['maintenance', 'mess', 'other'].map(cat => (
                  <Pressable 
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full border",
                      category === cat ? "bg-primary border-primary" : "bg-muted/10 border-border/20"
                    )}
                  >
                    <Text className={cn("text-[9px] font-black uppercase tracking-widest", category === cat ? "text-white" : "text-muted-foreground")}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
              <Input 
                label="Issue Title" 
                placeholder="Brief summary of the issue..." 
                value={title}
                onChangeText={setTitle}
              />
              <Input 
                label="Detailed Description" 
                placeholder="Explain the problem in detail..." 
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              <View className="flex-row gap-4 pt-6">
                <Button label="Cancel" variant="ghost" className="flex-1" onPress={() => setCreateModalVisible(false)} />
                <Button label={loading ? "Submitting..." : "Raise Ticket"} className="flex-1 shadow-lg shadow-primary/20" onPress={handleSubmit} loading={loading} />
              </View>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/70 p-6">
          {selectedTicket && (
            <MotiView 
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <View className={cn("p-10 items-center", statusConfig[selectedTicket.status].bgColor)}>
                <View className="h-20 w-20 rounded-full bg-white items-center justify-center shadow-xl mb-6">
                   {(() => {
                      const Config = statusConfig[selectedTicket.status];
                      const Icon = Config.icon;
                      return <Icon size={40} color={Config.textColor} />;
                   })()}
                </View>
                <Badge label={selectedTicket.status.replace('_', ' ')} variant="default" className="bg-white shadow-sm" labelClassName={statusConfig[selectedTicket.status].color} />
                <Text className="text-2xl font-black text-foreground mt-6 text-center leading-tight">{selectedTicket.title}</Text>
              </View>

              <View className="p-10 space-y-8">
                <View>
                  <Text className="text-[9px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Description</Text>
                  <Text className="text-sm font-medium text-foreground leading-relaxed bg-muted/5 p-5 rounded-3xl border border-border/10">
                    {selectedTicket.description}
                  </Text>
                </View>

                {selectedTicket.profiles && (
                  <View className="bg-primary/5 p-5 rounded-3xl border border-primary/10 flex-row items-center gap-4">
                    <View className="h-12 w-12 rounded-full bg-primary items-center justify-center shadow-md">
                      <Text className="text-lg font-black text-white">{selectedTicket.profiles.name?.[0]}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-black text-foreground">{selectedTicket.profiles.name}</Text>
                      <Text className="text-[10px] font-bold text-muted-foreground uppercase">{selectedTicket.category} Inquiry · Room {selectedTicket.profiles.room_number || 'N/A'}</Text>
                    </View>
                  </View>
                )}

                <View className="flex-row gap-4 pt-4">
                  {user?.role !== 'student' && user?.role !== 'parent' ? (
                    <View className="flex-1 space-y-3">
                      {selectedTicket.status === 'open' && (
                        <Button label="Mark In Progress" variant="info" className="w-full rounded-2xl" onPress={() => handleStatusUpdate(selectedTicket.id, 'in_progress')} />
                      )}
                      {selectedTicket.status !== 'resolved' && (
                        <Button label="Mark Resolved" variant="success" className="w-full rounded-2xl" onPress={() => handleStatusUpdate(selectedTicket.id, 'resolved')} />
                      )}
                      <Button label="Close Detail" variant="outline" className="w-full rounded-2xl" onPress={() => setDetailModalVisible(false)} />
                    </View>
                  ) : (
                    <Button label="Close Inquiry" variant="outline" className="flex-1 rounded-2xl" onPress={() => setDetailModalVisible(false)} />
                  )}
                </View>
              </View>
            </MotiView>
          )}
        </View>
      </Modal>
    </PageContainer>
  );
}
