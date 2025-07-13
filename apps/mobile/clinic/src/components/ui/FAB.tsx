import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface FABProps {
  icon: string;
  onPress: () => void;
  label?: string;
  style?: any;
}

const AnimatedFAB = Animated.createAnimatedComponent(PaperFAB);

export const FAB: React.FC<FABProps> = ({ icon, onPress, label, style }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 20 }),
      withSpring(1, { damping: 10 })
    );
    rotation.value = withSequence(
      withSpring(10),
      withSpring(-10),
      withSpring(0)
    );
    onPress();
  };

  return (
    <AnimatedFAB
      icon={icon}
      label={label}
      style={[styles.fab, animatedStyle, style]}
      onPress={handlePress}
      color="#FFFFFF"
      theme={{
        colors: {
          accent: '#16A34A',
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#16A34A',
  },
});