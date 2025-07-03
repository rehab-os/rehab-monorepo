// apps/mobile/src/components/ui/AnimatedCard.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@rehab/shared/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  style,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={[styles.card, style]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});

export default AnimatedCard;
