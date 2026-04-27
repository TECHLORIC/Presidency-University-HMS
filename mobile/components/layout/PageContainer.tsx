import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

interface PageContainerProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
}

export const PageContainer = ({ 
  children, 
  refreshing = false, 
  onRefresh, 
  scrollable = true 
}: PageContainerProps) => {
  return (
    <View style={styles.container}>
      {/* Mesh Gradient Emulation */}
      <View style={StyleSheet.absoluteFill}>
        <View 
          style={[
            styles.gradientCircle, 
            { top: -height * 0.1, left: -width * 0.2, backgroundColor: 'rgba(30, 41, 59, 0.15)' }
          ]} 
        />
        <View 
          style={[
            styles.gradientCircle, 
            { top: 0, right: -width * 0.2, backgroundColor: 'rgba(245, 158, 11, 0.12)' }
          ]} 
        />
        <View 
          style={[
            styles.gradientCircle, 
            { bottom: -height * 0.1, right: -width * 0.1, backgroundColor: 'rgba(30, 58, 138, 0.08)' }
          ]} 
        />
        <View 
          style={[
            styles.gradientCircle, 
            { bottom: 0, left: -width * 0.1, backgroundColor: 'rgba(20, 83, 45, 0.05)' }
          ]} 
        />
      </View>

      {scrollable ? (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
          ) : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a14', // Matching the Midnight Navy background
  },
  gradientCircle: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    opacity: 0.8,
  }
});
