// apps/mobile/src/components/ui/GradientBackground.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
}) => {
  return (
    <LinearGradient
      colors={[
        colors.primary[50],
        colors.background.default,
        colors.secondary[50],
      ]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
