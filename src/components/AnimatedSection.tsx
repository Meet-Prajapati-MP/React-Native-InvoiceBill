import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedSectionProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  index?: number;
}

/**
 * Slides in from right to left when the section loads.
 * Use for dynamic content sections on each page.
 */
export function AnimatedSection({
  children,
  delay = 0,
  duration = 400,
  index = 0,
  style,
  ...props
}: AnimatedSectionProps) {
  const translateX = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      delay + index * 80,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    opacity.value = withDelay(
      delay + index * 80,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
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
