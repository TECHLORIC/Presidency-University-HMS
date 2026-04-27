import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Shield, CheckCircle2, History, Clock, Lock, Zap, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { securityApi } from '../lib/api/security';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export default function SecurityScreen() {
  const { user } = useAppStore();
  const [checklist, setChecklist] = useState({
    door: false,
    almirah: false,
    electronics: false
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const isComplete = checklist.door && checklist.almirah && checklist.electronics;

  const fetchLogs = async () => {
    try {
      const data = await securityApi.getLogs(user?.id, user?.room_number, user?.role, 20);
      setLogs(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleConfirm = async () => {
    if (!isComplete || !user) return;
    setLoading(true);
    
    try {
      await securityApi.logSecurity(user.id, user.room_number || 'N/A', checklist);
      Alert.alert('Success', "Room Secured Successfully!");
      setChecklist({ door: false, almirah: false, electronics: false });
      await fetchLogs();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-black text-foreground">Security Sweep</Text>
          <Text className="text-xs text-muted-foreground">Secure your room before leaving</Text>
        </View>
        <Badge label={`Room ${user?.room_number || 'N/A'}`} variant="info" className="rounded-full" />
      </View>

      <View className="space-y-6">
        {/* Checklist Section */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <View className="p-4 bg-muted/5 border-b border-border/50">
             <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Checklist
             </Text>
          </View>
          <CardContent className="p-6 space-y-4">
             <View className="space-y-3">
                {[
                  { id: 'door', label: 'Main door is latched and locked.', icon: Lock },
                  { id: 'almirah', label: 'Personal almirah is secured.', icon: Shield },
                  { id: 'electronics', label: 'Electronics switched off.', icon: Zap },
                ].map((item) => (
                  <Pressable 
                    key={item.id}
                    onPress={() => toggleCheck(item.id as keyof typeof checklist)}
                    className={cn(
                      "flex-row items-center space-x-3 p-4 rounded-2xl border transition-all",
                      checklist[item.id as keyof typeof checklist] ? "bg-primary/5 border-primary/20" : "bg-card border-border/50"
                    )}
                  >
                    <View className={cn(
                      "h-5 w-5 rounded-full border-2 items-center justify-center",
                      checklist[item.id as keyof typeof checklist] ? "bg-primary border-primary" : "border-border"
                    )}>
                      {checklist[item.id as keyof typeof checklist] && <View className="h-2 w-2 bg-white rounded-full" />}
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className={cn("text-xs font-bold", checklist[item.id as keyof typeof checklist] ? "text-primary" : "text-foreground")}>
                        {item.label}
                      </Text>
                    </View>
                    <item.icon size={14} color={checklist[item.id as keyof typeof checklist] ? "#18181b" : "#a1a1aa"} opacity={0.3} />
                  </Pressable>
                ))}
             </View>

             <Button 
               label={loading ? "Verifying..." : "Confirm Departure"}
               disabled={!isComplete || loading}
               onPress={handleConfirm}
               className={cn("mt-4 py-4 rounded-2xl shadow-lg shadow-primary/20", !isComplete && "opacity-50")}
               loading={loading}
             />
          </CardContent>
        </Card>

        {/* Room Logs */}
        <Card className="border-border/50 shadow-sm">
          <View className="p-4 bg-muted/5 border-b border-border/50">
             <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Recent Security Events
             </Text>
          </View>
          <CardContent className="p-0">
             {logs.length === 0 ? (
               <View className="p-10 items-center opacity-50">
                  <Clock size={32} color="#a1a1aa" />
                  <Text className="text-xs font-bold mt-2">No recent events</Text>
               </View>
             ) : (
               <View className="divide-y divide-border/50">
                  {logs.map((log, i) => (
                    <View key={log.id} className="p-4 flex-row items-center justify-between">
                       <View className="flex-row items-center gap-3">
                          <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                             <Text className="text-[10px] font-black text-primary">{log.profiles?.name?.[0]}</Text>
                          </View>
                          <View>
                             <Text className="text-xs font-bold text-foreground">{log.profiles?.name}</Text>
                             <Text className="text-[9px] text-muted-foreground">
                               {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.timestamp).toLocaleDateString()}
                             </Text>
                          </View>
                       </View>
                       <Badge label="Secured" variant="success" className="h-6" labelClassName="text-[8px]" />
                    </View>
                  ))}
               </View>
             )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
