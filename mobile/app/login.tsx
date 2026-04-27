import React, { useState, useEffect } from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Incomplete', 'Please provide both email and password.');
      return;
    }
    
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
      return;
    } 

    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (!profile) {
        Alert.alert("System Error", "User authenticated, but no database profile found! Contact Admin.");
        await supabase.auth.signOut();
        setLoading(false);
      } else {
        // Redirection handled by useEffect
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Background Orbs Simulation */}
        <View className="absolute top-[-50] left-[-50] w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <View className="absolute bottom-[-50] right-[-50] w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 800 }}
        >
          <Card className="p-2 border-border/20 bg-card/60">
            <CardHeader className="items-center py-6 space-y-4">
              <View className="h-28 w-28 rounded-[2.5rem] bg-white items-center justify-center shadow-2xl p-4 border border-primary/5">
                <Image 
                  source={{ uri: 'https://presidencyuniversity.in/assets/images/overview-logo.webp' }} 
                  className="h-full w-full"
                  resizeMode="contain"
                />
              </View>
              <View className="items-center mt-4">
                <Text className="text-3xl font-black text-primary tracking-tighter">University Portal</Text>
                <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Hostel Management System</Text>
              </View>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2">Academic Email</Text>
                <Input 
                  placeholder="student@presidency.edu"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2">Password</Text>
                <Input 
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View className="pt-4">
                <Button 
                  label={loading ? 'Verifying Identity...' : 'Authorized Entry'} 
                  onPress={handleLogin}
                  loading={loading}
                  className="shadow-xl"
                />
              </View>

              <Text className="text-center text-[9px] text-muted-foreground/60 font-black uppercase tracking-tighter mt-4">
                Secured by Presidency University Student Affairs
              </Text>
            </CardContent>
          </Card>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
