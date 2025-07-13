import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type StatusType = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'checked-in';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const statusConfig = {
  'scheduled': {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    label: 'Scheduled',
  },
  'in-progress': {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    label: 'In Progress',
  },
  'completed': {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    label: 'Completed',
  },
  'cancelled': {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    label: 'Cancelled',
  },
  'checked-in': {
    backgroundColor: '#E0E7FF',
    color: '#4338CA',
    label: 'Checked In',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        size === 'small' && styles.smallBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          size === 'small' && styles.smallText,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
});