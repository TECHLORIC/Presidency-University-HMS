import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  className?: string;
  labelClassName?: string;
}

export const Badge = ({
  label,
  variant = 'default',
  className,
  labelClassName,
  ...props
}: BadgeProps) => {
  const variants = {
    default: "bg-primary border-transparent",
    secondary: "bg-secondary border-transparent",
    outline: "bg-transparent border-border/60",
    destructive: "bg-destructive/10 border-transparent",
    success: "bg-success/10 border-transparent",
    warning: "bg-warning/10 border-transparent",
    info: "bg-info/10 border-transparent",
  };

  const textVariants = {
    default: "text-white",
    secondary: "text-white",
    outline: "text-foreground",
    destructive: "text-destructive",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  };

  return (
    <View
      className={cn(
        "px-3 py-1 rounded-full border self-start",
        variants[variant],
        className
      )}
      {...props}
    >
      <Text className={cn("text-[8px] font-black uppercase tracking-[0.1em]", textVariants[variant], labelClassName)}>
        {label}
      </Text>
    </View>
  );
};
