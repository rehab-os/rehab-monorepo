import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) => {
  return (
    <Animated.View 
      entering={FadeInUp.delay(100).springify()}
      style={[styles.container, style]}
    >
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        style={styles.searchbar}
        inputStyle={styles.input}
        iconColor="#6B7280"
        placeholderTextColor="#9CA3AF"
        theme={{
          colors: {
            primary: '#16A34A',
          },
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    elevation: 0,
  },
  input: {
    fontSize: 16,
    color: '#374151',
  },
});