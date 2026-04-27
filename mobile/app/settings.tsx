import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Settings as SettingsIcon, Shield, Bell, Lock, ChevronRight } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-6">
        <Text className="text-xl font-black text-foreground">System Settings</Text>
        <Text className="text-xs text-muted-foreground">Global configuration</Text>
      </View>

      <View className="space-y-4">
        {[
          { icon: Shield, label: 'Security', desc: 'Policies & Auth' },
          { icon: Bell, label: 'Notifications', desc: 'Push Alert Triggers' },
          { icon: Lock, label: 'Privacy', desc: 'Data Retention' },
        ].map((item) => (
          <Pressable key={item.label}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center">
                    <item.icon size={18} color="#18181b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">{item.label}</Text>
                    <Text className="text-[10px] text-muted-foreground">{item.desc}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#a1a1aa" />
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card className="mt-8 border-dashed border-2 border-border/30 bg-muted/5">
        <CardContent className="p-8 items-center text-center">
          <SettingsIcon size={32} color="#a1a1aa" opacity={0.2} />
          <Text className="text-sm font-bold text-muted-foreground mt-3">More settings coming soon</Text>
          <Text className="text-[10px] text-muted-foreground/60 mt-1 italic text-center">
            Integration with hostel block API is in progress.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
