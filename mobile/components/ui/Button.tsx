import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { cn } from '../../lib/utils';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
  labelClassName?: string;
}

export const Button = ({
  label,
  variant = 'default',
  size = 'md',
  loading = false,
  className,
  labelClassName,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    default: 'bg-primary border-primary shadow-lg shadow-primary/20',
    outline: 'bg-transparent border-border/60 border',
    ghost: 'bg-transparent border-transparent',
    destructive: 'bg-destructive border-destructive shadow-lg shadow-destructive/20',
    success: 'bg-success border-success shadow-lg shadow-success/20',
    info: 'bg-info border-info shadow-lg shadow-info/20',
  };

  const sizes = {
    sm: 'px-4 py-2 rounded-2xl',
    md: 'px-6 py-4 rounded-[1.5rem]',
    lg: 'px-8 py-5 rounded-[2rem]',
    icon: 'p-3 rounded-full w-12 h-12 items-center justify-center',
  };

  const textVariants = {
    default: 'text-white',
    outline: 'text-foreground',
    ghost: 'text-foreground',
    destructive: 'text-white',
    success: 'text-white',
    info: 'text-white',
  };

  const textSizes = {
    sm: 'text-xs font-bold uppercase tracking-widest',
    md: 'text-sm font-black uppercase tracking-widest',
    lg: 'text-base font-black uppercase tracking-[0.1em]',
    icon: 'text-lg',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center border',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 grayscale',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#18181b' : 'white'} />
      ) : (
        <Text className={cn('text-center font-black', textVariants[variant], textSizes[size], labelClassName)}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
