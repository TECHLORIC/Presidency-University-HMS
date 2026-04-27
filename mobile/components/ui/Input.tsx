import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
}

export const Input = ({
  label,
  error,
  className,
  inputClassName,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={cn("space-y-2", className)}>
      {label && (
        <Text className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 ml-1">
          {label}
        </Text>
      )}
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "bg-muted/30 border rounded-[1.25rem] px-5 py-4 text-sm text-foreground",
          isFocused ? "bg-white border-primary shadow-sm" : "border-border/60",
          error && "border-destructive bg-destructive/5",
          inputClassName
        )}
        placeholderTextColor="#a1a1aa"
        {...props}
      />
      {error && (
        <Text className="text-[10px] font-bold text-destructive ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
