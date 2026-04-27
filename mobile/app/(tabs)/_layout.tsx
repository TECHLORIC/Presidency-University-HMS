import React from 'react';
import { Tabs } from 'expo-router';
import { Home, FileText, Ticket, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#f59e0b' : '#1e293b',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: isDark ? '#050a14' : '#f8f9fa',
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
          paddingBottom: 8,
          height: 65,
          elevation: 0,
          borderTopWidth: 0.5,
        },
        headerStyle: {
          backgroundColor: isDark ? '#050a14' : '#f8f9fa',
        },
        headerTitleStyle: {
          color: isDark ? '#f1f5f9' : '#1e293b',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: 12,
          letterSpacing: 2,
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'HMS DASHBOARD',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          headerTitle: 'LEAVE MANAGEMENT',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          headerTitle: 'SUPPORT TICKETS',
          tabBarIcon: ({ color, size }) => <Ticket size={size} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          headerTitle: 'USER PROFILE',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
