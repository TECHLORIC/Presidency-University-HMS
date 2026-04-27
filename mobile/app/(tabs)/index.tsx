import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { 
  Bell, FileText, Ticket, UtensilsCrossed, Shield, 
  ChevronRight, Users, Clock, Zap, MessageSquare, Plus, Star,
  Megaphone, AlertTriangle, CheckCircle, User, ClipboardList, Settings,
  MapPin
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { leavesApi } from '../../lib/api/leaves';
import { ticketsApi } from '../../lib/api/tickets';
import { announcementsApi } from '../../lib/api/announcements';
import { usersApi } from '../../lib/api/users';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RainyGlass } from '../../components/ui/RainyGlass';
import { cn } from '../../lib/utils';

export default function DashboardScreen() {
  const { user, initializeAuth } = useAppStore();
  const [stats, setStats] = useState({ pendingLeaves: 0, openTickets: 0, resolvedTickets: 0, totalStudents: 0, totalStaff: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      // Parallel fetch for speed
      const [pendingLeaves, ticketStats, annData, tktsData] = await Promise.all([
        leavesApi.getPendingCount(user.id, user.role),
        ticketsApi.getStats(user.id, user.role),
        announcementsApi.getRecent(2),
        ticketsApi.getActive(user.id, user.role, 3)
      ]);

      let studentsCount = 0;
      let staffCount = 0;
      if (user.role === 'admin' || user.role === 'warden') {
        const userStats = await usersApi.getStats();
        studentsCount = userStats.students;
        staffCount = userStats.staff;
      }

      setStats({
        pendingLeaves: pendingLeaves || 0,
        openTickets: ticketStats.open,
        resolvedTickets: ticketStats.resolved,
        totalStudents: studentsCount,
        totalStaff: staffCount
      });
      setAnnouncements(annData);
      setActiveTickets(tktsData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), initializeAuth()]);
    setRefreshing(false);
  };

  if (!user) return null;

  const dashboardStats = [
    ...(user.role === 'admin' || user.role === 'warden' 
      ? [
          { label: 'Total Students', value: stats.totalStudents, icon: User, color: 'text-primary' },
          { label: 'Total Staff', value: stats.totalStaff, icon: Shield, color: 'text-info' },
        ]
      : []
    ),
    ...(user.role !== 'maintenance' ? [{ label: 'Pending Leaves', value: stats.pendingLeaves, icon: Clock, color: 'text-warning' }] : []),
    { label: 'Open Tickets', value: stats.openTickets, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Resolved Tickets', value: stats.resolvedTickets, icon: CheckCircle, color: 'text-success' },
  ];

  const quickActions = user.role === 'admin' 
    ? [
        { path: '/users', icon: Users, label: 'Manage Users', desc: 'Configure student and staff accounts', color: 'bg-primary/10 text-primary' },
        { path: '/leaves', icon: ClipboardList, label: 'Manage Leaves', desc: 'Review and approve leave applications', color: 'bg-info/10 text-info' },
        { path: '/tickets', icon: Ticket, label: 'All Tickets', desc: 'Oversight of all support tickets', color: 'bg-destructive/10 text-destructive' },
        { path: '/announcements', icon: Megaphone, label: 'Broadcast News', desc: 'Publish announcements to all users', color: 'bg-warning/10 text-warning' },
        { path: '/mess', icon: UtensilsCrossed, label: 'Mess Management', desc: 'Coordinate menus and operations', color: 'bg-success/10 text-success' },
      ]
    : user.role === 'student'
    ? [
        { path: '/leaves', icon: FileText, label: 'Apply Leave', color: 'bg-info/10 text-info' },
        { path: '/tickets', icon: Ticket, label: 'Raise Ticket', color: 'bg-warning/10 text-warning' },
        { path: '/mess', icon: UtensilsCrossed, label: 'Mess Menu', color: 'bg-success/10 text-success' },
      ]
    : [
        { path: '/tickets', icon: Ticket, label: 'Manage Tickets', color: 'bg-warning/10 text-warning' },
        { path: '/announcements', icon: Megaphone, label: 'View News', color: 'bg-primary/10 text-primary' },
        { path: '/profile', icon: User, label: 'Profile', color: 'bg-success/10 text-success' },
      ];

  return (
    <PageContainer refreshing={refreshing} onRefresh={onRefresh}>
      <View className="p-6">
        {/* Premium Greeting Card (Rainy Glass) */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] bg-primary overflow-hidden shadow-2xl border border-white/10"
        >
          <RainyGlass />
          <View className="absolute top-4 right-4 opacity-10">
             <Image 
                source={{ uri: 'https://presidencyuniversity.in/assets/images/overview-logo.webp' }} 
                className="h-24 w-24 brightness-0 invert" 
                resizeMode="contain" 
             />
          </View>
          
          <View className="p-8 space-y-3">
            <Badge label="Official Portal" className="bg-white/10 border-white/10" labelClassName="text-white text-[8px]" />
            <View>
              <Text className="text-3xl font-black text-white leading-tight">Greetings,</Text>
              <Text className="text-4xl font-black text-white/90">{user.name?.split(' ')[0]}</Text>
            </View>
            <Text className="text-white/70 text-sm font-medium leading-5 max-w-[250px]">
              {user.role === 'admin' ? 'Welcome back to the administrative command center.' : 
               user.role === 'student' ? `Currently in Room ${user.room_number || 'N/A'}, ${user.block || 'Main Block'}.` :
               `Welcome to the Presidency University ${user.role} portal.`}
            </Text>
          </View>
        </MotiView>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mt-8">
          {dashboardStats.map((stat, i) => (
            <MotiView
              key={stat.label}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 100 }}
              style={{ width: '47.5%' }}
            >
              <Card className="p-5 border-border/20">
                <View className="flex-row justify-between items-center mb-2">
                  <View className={cn("p-2 rounded-xl", stat.color.replace('text-', 'bg-').replace('/10', '/5'))}>
                    <stat.icon size={16} className={stat.color} strokeWidth={2.5} />
                  </View>
                  <Text className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</Text>
                </View>
                <Text className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</Text>
              </Card>
            </MotiView>
          ))}
        </View>

        {/* Priority Actions (iOS Notification Style) */}
        <View className="mt-10">
          <View className="flex-row items-center gap-4 mb-6 px-1">
             <Text className="text-lg font-black text-foreground tracking-tight">Priority Actions</Text>
             <View className="h-px flex-1 bg-border/20" />
          </View>
          
          <View className="space-y-3">
            {quickActions.map((action, i) => (
              <MotiView
                key={action.path}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 300 + i * 50 }}
              >
                <Pressable onPress={() => router.push(action.path as any)}>
                  <Card className="bg-[#191919]/75 border-white/20 p-4 shadow-xl">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className={cn("h-12 w-12 rounded-2xl items-center justify-center shadow-lg", action.color)}>
                          <action.icon size={22} color={action.color.split(' ')[1].includes('text-') ? undefined : 'white'} strokeWidth={2.5} />
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-white leading-tight">{action.label}</Text>
                          <Text className="text-[10px] font-medium text-white/50">{action.desc || 'Access portal features'}</Text>
                        </View>
                      </View>
                      <View className="px-3">
                        <Text className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Open</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Institutional Notifications */}
        <View className="mt-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-lg font-black text-foreground tracking-tight">Institutional Notifications</Text>
            <Pressable onPress={() => router.push('/announcements')}>
              <Text className="text-[10px] font-black text-primary uppercase tracking-widest">Archive</Text>
            </Pressable>
          </View>
          <View className="space-y-2">
            {announcements.map((a, i) => (
              <MotiView 
                key={a.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 600 + i * 50 }}
              >
                <Pressable onPress={() => router.push('/announcements')}>
                  <Card className="border-border/10 p-4 bg-muted/5">
                    <View className="flex-row items-start gap-4">
                      <View className={cn(
                        "h-10 w-10 rounded-xl items-center justify-center",
                        a.priority === 'urgent' ? 'bg-destructive/10 text-destructive' : a.priority === 'important' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                      )}>
                        <Megaphone size={18} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{a.title}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>{a.message}</Text>
                        <Text className="text-[8px] font-medium text-muted-foreground/60 mt-1">{new Date(a.created_at).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Support Tickets */}
        <View className="mt-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-lg font-black text-foreground tracking-tight">Support Inquiries</Text>
            <Pressable onPress={() => router.push('/tickets')}>
              <Text className="text-[10px] font-black text-primary uppercase tracking-widest">History</Text>
            </Pressable>
          </View>
          <View className="space-y-2">
            {activeTickets.map((t, i) => (
              <MotiView 
                key={t.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 800 + i * 50 }}
              >
                <Pressable onPress={() => router.push('/tickets')}>
                  <Card className="border-border/10 p-4 bg-muted/5">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-sm font-bold text-foreground">{t.title}</Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5 capitalize">{t.category} · Room {t.room_number || 'N/A'}</Text>
                      </View>
                      <Badge 
                        label={t.status.replace('_', ' ')} 
                        variant="outline" 
                        className={cn(
                          "border-transparent",
                          t.status === 'open' ? 'bg-warning/10' : t.status === 'in_progress' ? 'bg-info/10' : 'bg-success/10'
                        )}
                        labelClassName={cn(
                          t.status === 'open' ? 'text-warning' : t.status === 'in_progress' ? 'text-info' : 'text-success'
                        )}
                      />
                    </View>
                  </Card>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
