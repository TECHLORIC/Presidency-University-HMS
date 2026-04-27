import React from 'react';
import { View, ViewProps, Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ className, style, ...props }: CardProps) => (
  <View
    style={style}
    className={cn(
      "bg-card/40 rounded-[2rem] border border-border/40 overflow-hidden shadow-sm",
      className
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: CardProps) => (
  <View className={cn("p-5", className)} {...props} />
);

export const CardHeader = ({ className, ...props }: CardProps) => (
  <View className={cn("p-5 pb-3", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: TextProps & { className?: string }) => (
  <Text className={cn("font-black text-lg text-foreground tracking-tight", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: TextProps & { className?: string }) => (
  <Text className={cn("text-xs text-muted-foreground font-medium", className)} {...props} />
);
