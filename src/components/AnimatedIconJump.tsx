import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface AnimatedIconJumpProps extends ViewProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
}

/**
 * Icons animate from center - scale from 0 and spring to position.
 * Professional jump-from-center effect.
 */
export function AnimatedIconJump({
  children,
  index,
  delay = 0,
  style,
  ...props
}: AnimatedIconJumpProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const stagger = delay + index * 120;
    scale.value = withDelay(
      stagger,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 120 }),
      ),
    );
    opacity.value = withDelay(stagger, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
