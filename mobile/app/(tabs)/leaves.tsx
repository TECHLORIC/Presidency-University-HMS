import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { Plus, Clock, CheckCircle, XCircle, Calendar, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { leavesApi } from '../../lib/api/leaves';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { icon: any, color: string, label: string, textColor: string, bgColor: string }> = {
  pending: { icon: Clock, color: 'text-warning', label: 'Pending', textColor: '#f59e0b', bgColor: 'bg-warning/10' },
  approved: { icon: CheckCircle, color: 'text-success', label: 'Approved', textColor: '#10b981', bgColor: 'bg-success/10' },
  rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejected', textColor: '#ef4444', bgColor: 'bg-destructive/10' },
};

export default function LeavesScreen() {
  const { user } = useAppStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  // Form State
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLeaves = async () => {
    if (!user) return;
    try {
      const data = await leavesApi.getAll(user.id, user.role);
      setLeaves(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      setLoading(true);
      await leavesApi.updateStatus(id, status);
      Alert.alert('Success', `Leave ${status}`);
      await fetchLeaves();
      if (selectedLeave?.id === id) setDetailModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason || !fromDate || !toDate || !user) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      await leavesApi.apply(user.id, reason, fromDate, toDate);
      Alert.alert('Success', 'Leave request submitted');
      setApplyModalVisible(false);
      setReason('');
      setFromDate('');
      setToDate('');
      await fetchLeaves();
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
            <Text className="text-2xl font-black text-foreground tracking-tight">Leaves</Text>
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Management Portal</Text>
          </View>
          {user?.role === 'student' && (
            <Button 
              label="New Request" 
              size="sm" 
              onPress={() => setApplyModalVisible(true)}
              className="rounded-full px-5"
            />
          )}
        </View>

        <View className="space-y-4">
          {leaves.map((leave, i) => {
            const config = statusConfig[leave.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isStaff = user?.role === 'warden' || user?.role === 'admin';

            return (
              <MotiView
                key={leave.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 50 }}
              >
                <Pressable 
                  onPress={() => {
                    setSelectedLeave(leave);
                    setDetailModalVisible(true);
                  }}
                >
                  <Card className="border-border/30 overflow-hidden">
                    <CardContent className="p-0">
                      <View className={cn("p-5 flex-row justify-between items-start", config.bgColor)}>
                        <View className="flex-1 pr-4">
                          <Text className="text-sm font-black text-foreground leading-tight" numberOfLines={2}>{leave.reason}</Text>
                          <View className="flex-row items-center gap-2 mt-2">
                            <Calendar size={12} color="#a1a1aa" />
                            <Text className="text-[10px] font-bold text-muted-foreground">{leave.from_date} → {leave.to_date}</Text>
                          </View>
                        </View>
                        <Badge 
                          label={config.label} 
                          variant="outline" 
                          className="bg-white/20 border-transparent" 
                          labelClassName={cn("text-[8px] font-black", config.color)}
                        />
                      </View>
                      
                      {isStaff && (
                        <View className="p-4 flex-row items-center justify-between border-t border-border/10">
                          <View className="flex-row items-center gap-3">
                            <View className="h-7 w-7 rounded-full bg-primary items-center justify-center">
                              <Text className="text-[8px] font-black text-white">{leave.profiles?.name?.[0]}</Text>
                            </View>
                            <Text className="text-xs font-bold text-foreground">{leave.profiles?.name}</Text>
                          </View>
                          <ChevronRight size={14} color="#a1a1aa" />
                        </View>
                      )}
                    </CardContent>
                  </Card>
                </Pressable>
              </MotiView>
            );
          })}

          {leaves.length === 0 && (
            <View className="items-center justify-center py-20 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/20">
              <Clock size={48} color="#a1a1aa" opacity={0.2} />
              <Text className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-4">No leave history</Text>
            </View>
          )}
        </View>
      </View>

      {/* Apply Leave Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={applyModalVisible}
        onRequestClose={() => setApplyModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <MotiView 
            from={{ translateY: 400 }}
            animate={{ translateY: 0 }}
            className="bg-card rounded-t-[3rem] p-8 pb-12 border-t border-border/50"
          >
            <View className="w-12 h-1.5 bg-border/20 rounded-full mx-auto mb-8" />
            <Text className="text-2xl font-black text-foreground mb-8">Request Leave</Text>
            
            <View className="space-y-6">
              <Input 
                label="Purpose of Visit" 
                placeholder="Explain clearly..." 
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
              <View className="flex-row gap-4">
                <Input 
                  label="From Date" 
                  placeholder="YYYY-MM-DD" 
                  value={fromDate}
                  onChangeText={setFromDate}
                  className="flex-1"
                />
                <Input 
                  label="To Date" 
                  placeholder="YYYY-MM-DD" 
                  value={toDate}
                  onChangeText={setToDate}
                  className="flex-1"
                />
              </View>
              <View className="flex-row gap-4 pt-6">
                <Button label="Cancel" variant="ghost" className="flex-1" onPress={() => setApplyModalVisible(false)} />
                <Button label={loading ? "Submitting..." : "Send Request"} className="flex-1 shadow-lg shadow-primary/20" onPress={handleSubmit} loading={loading} />
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
          {selectedLeave && (
            <MotiView 
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <View className={cn("p-10 items-center", statusConfig[selectedLeave.status].bgColor)}>
                {(() => {
                  const Config = statusConfig[selectedLeave.status];
                  const Icon = Config.icon;
                  return (
                    <View className="h-20 w-20 rounded-full bg-white items-center justify-center shadow-xl mb-6">
                      <Icon size={40} color={Config.textColor} />
                    </View>
                  );
                })()}
                <Badge label={selectedLeave.status} variant="default" className="bg-white shadow-sm" labelClassName={statusConfig[selectedLeave.status].color} />
                <Text className="text-2xl font-black text-foreground mt-6 text-center leading-tight">{selectedLeave.reason}</Text>
              </View>

              <View className="p-10 space-y-8">
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-muted/5 p-5 rounded-3xl border border-border/10">
                    <Text className="text-[9px] font-black uppercase text-muted-foreground mb-2">Departure</Text>
                    <View className="flex-row items-center gap-2">
                      <Calendar size={14} color="#f59e0b" />
                      <Text className="text-sm font-black text-foreground">{selectedLeave.from_date}</Text>
                    </View>
                  </View>
                  <View className="flex-1 bg-muted/5 p-5 rounded-3xl border border-border/10">
                    <Text className="text-[9px] font-black uppercase text-muted-foreground mb-2">Return</Text>
                    <View className="flex-row items-center gap-2">
                      <Calendar size={14} color="#f59e0b" />
                      <Text className="text-sm font-black text-foreground">{selectedLeave.to_date}</Text>
                    </View>
                  </View>
                </View>

                {selectedLeave.profiles && (
                  <View className="bg-primary/5 p-5 rounded-3xl border border-primary/10 flex-row items-center gap-4">
                    <View className="h-12 w-12 rounded-full bg-primary items-center justify-center shadow-md">
                      <Text className="text-lg font-black text-white">{selectedLeave.profiles.name?.[0]}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-black text-foreground">{selectedLeave.profiles.name}</Text>
                      <Text className="text-[10px] font-bold text-muted-foreground uppercase">{selectedLeave.profiles.roll_no || 'N/A'} · Room {selectedLeave.profiles.room_number || 'N/A'}</Text>
                    </View>
                  </View>
                )}

                <View className="flex-row gap-4 pt-4">
                  {user?.role !== 'student' && selectedLeave.status === 'pending' ? (
                    <>
                      <Button label="Approve" variant="success" className="flex-1 rounded-2xl" onPress={() => handleStatusUpdate(selectedLeave.id, 'approved')} />
                      <Button label="Reject" variant="destructive" className="flex-1 rounded-2xl" onPress={() => handleStatusUpdate(selectedLeave.id, 'rejected')} />
                    </>
                  ) : (
                    <Button label="Close Portal" variant="outline" className="flex-1 rounded-2xl" onPress={() => setDetailModalVisible(false)} />
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
