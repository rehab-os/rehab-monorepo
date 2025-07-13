import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
  noPadding = false,
}) => {
  const baseStyles = 'bg-white rounded-card shadow-card';
  const paddingStyles = noPadding ? '' : 'p-xl';
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`${baseStyles} ${paddingStyles} ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View className={`${baseStyles} ${paddingStyles} ${className}`}>
      {children}
    </View>
  );
};