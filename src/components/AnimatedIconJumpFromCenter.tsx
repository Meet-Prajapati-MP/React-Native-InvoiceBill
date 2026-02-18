import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const ICON_SIZE = 48;
const ICON_HALF = ICON_SIZE / 2;

interface AnimatedIconJumpFromCenterProps extends ViewProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  /** Angle in degrees: 0 = right, 90 = bottom, 180 = left, 270 = top. Used with radius for uniform circle. */
  angle: number;
  /** Radius from center in pixels. Same for all = equal spacing. */
  radius: number;
}

const DURATION = 380;
const EASING = Easing.bezier(0.25, 0.1, 0.25, 1); // smooth ease

/**
 * Smooth emanate-from-center: icons glide to their circle positions
 * with subtle fade and scale. No bounce, professional feel.
 */
export function AnimatedIconJumpFromCenter({
  children,
  index,
  delay = 0,
  angle,
  radius,
  style,
  ...props
}: AnimatedIconJumpFromCenterProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const rad = (angle * Math.PI) / 180;
    const offsetX = radius * Math.cos(rad);
    const offsetY = radius * Math.sin(rad);

    const stagger = delay + index * 85;

    translateX.value = withDelay(stagger, withTiming(offsetX, { duration: DURATION, easing: EASING }));
    translateY.value = withDelay(stagger, withTiming(offsetY, { duration: DURATION, easing: EASING }));
    scale.value = withDelay(stagger, withTiming(1, { duration: DURATION, easing: EASING }));
    opacity.value = withDelay(stagger, withTiming(1, { duration: DURATION * 0.7, easing: EASING }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: ICON_SIZE,
          height: ICON_SIZE,
          marginLeft: -ICON_HALF,
          marginTop: -ICON_HALF,
        },
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
