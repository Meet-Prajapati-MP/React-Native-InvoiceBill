import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedSlideInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromRight?: boolean;
}

/**
 * Slides in from right (or left) with fade. For page-level content.
 */
export function AnimatedSlideIn({
  children,
  delay = 0,
  duration = 450,
  fromRight = true,
  style,
  ...props
}: AnimatedSlideInProps) {
  const translateX = useSharedValue(fromRight ? 80 : -80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
