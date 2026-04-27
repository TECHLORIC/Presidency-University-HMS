import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export const RainyGlass = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Static drops */}
      {[...Array(15)].map((_, i) => (
        <View 
          key={`static-${i}`}
          style={[
            styles.drop,
            {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              opacity: 0.15,
            }
          ]}
        />
      ))}
      
      {/* Animated drops */}
      {[...Array(20)].map((_, i) => (
        <MotiView 
          key={`drip-${i}`}
          from={{ translateY: -50, opacity: 0 }}
          animate={{ translateY: 400, opacity: 0.3 }}
          transition={{
            type: 'timing',
            duration: 2000 + Math.random() * 3000,
            loop: true,
            delay: Math.random() * 5000,
          }}
          style={[
            styles.drop,
            {
              left: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 10 + Math.random() * 15,
              opacity: 0.2,
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
  }
});
