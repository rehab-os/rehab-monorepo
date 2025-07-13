import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-button';
  
  const variantStyles = {
    primary: 'bg-sage-500 shadow-button',
    secondary: 'bg-white border-2 border-neutral-200',
    ghost: 'bg-transparent',
  };
  
  const sizeStyles = {
    small: 'px-md py-sm',
    medium: 'px-lg py-md',
    large: 'px-xl py-lg',
  };
  
  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-charcoal',
    ghost: 'text-sage-500',
  };
  
  const textSizeStyles = {
    small: 'text-small',
    medium: 'text-body',
    large: 'text-body-lg',
  };

  const disabledStyles = disabled ? 'opacity-50' : '';
  const activeOpacity = disabled ? 1 : variant === 'ghost' ? 0.6 : 0.8;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? 'white' : '#16A34A'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={variant === 'primary' ? 'white' : variant === 'secondary' ? '#374151' : '#16A34A'}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={variant === 'primary' ? 'white' : variant === 'secondary' ? '#374151' : '#16A34A'}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};