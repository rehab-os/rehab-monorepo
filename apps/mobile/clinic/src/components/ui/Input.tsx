import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  icon?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  disabled = false,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? 'border-error'
    : isFocused
    ? 'border-sage-500'
    : 'border-neutral-200';

  return (
    <View className={className}>
      {label && (
        <Text className="text-small font-medium text-charcoal mb-sm">
          {label}
        </Text>
      )}
      
      <View
        className={`h-12 flex-row items-center bg-white rounded-input border-2 ${borderColor} px-md`}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isFocused ? '#16A34A' : '#9CA3AF'}
            style={{ marginRight: 8 }}
          />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-body text-charcoal"
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-sm"
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-caption text-error mt-xs">
          {error}
        </Text>
      )}
    </View>
  );
};