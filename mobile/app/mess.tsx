import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { UtensilsCrossed, Plus, ShieldAlert } from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function MessScreen() {
  const { user } = useAppStore();
  const isMessStaff = user?.role === 'mess' || user?.role === 'admin';

  return (
    <PageContainer>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View>
            <Text className="text-2xl font-black text-foreground tracking-tight">Mess Menu</Text>
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Weekly Schedule</Text>
          </View>
          {isMessStaff && (
            <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <ShieldAlert size={12} color="#10b981" />
              <Text className="text-[8px] font-black text-success uppercase tracking-widest">Management</Text>
            </View>
          )}
        </View>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="rounded-[2.5rem] border-border/30 overflow-hidden">
            <CardContent className="p-12 items-center justify-center text-center">
              <View className="h-20 w-20 rounded-full bg-success/10 items-center justify-center mb-6 shadow-sm">
                <UtensilsCrossed size={40} color="#10b981" />
              </View>
              <Text className="text-xl font-black text-foreground">Menu Migrating</Text>
              <Text className="text-sm font-medium text-muted-foreground text-center mt-3 leading-6">
                We are currently migrating the live menu database. 
                {isMessStaff ? " As Mess Staff, you will soon be able to edit meals here directly." : " Check back soon for the updated weekly schedule."}
              </Text>
              {isMessStaff && (
                <Button 
                  label="Initialize Menu" 
                  className="mt-8 rounded-full px-8 shadow-lg shadow-success/20"
                  onPress={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </MotiView>
      </View>
    </PageContainer>
  );
}
