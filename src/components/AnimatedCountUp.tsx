import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';

interface AnimatedCountUpProps extends TextProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  delay?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a number from `from` to `to` with easing, like increasing business metrics.
 */
export function AnimatedCountUp({
  from,
  to,
  duration = 2000,
  suffix = '',
  delay = 0,
  style,
  ...props
}: AnimatedCountUpProps) {
  const [display, setDisplay] = useState(from);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = Math.round(from + (to - from) * eased);
      setDisplay(value);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [started, from, to, duration]);

  const formatted = display.toLocaleString('en-IN');
  return (
    <Text style={style} {...props}>
      {formatted}{suffix}
    </Text>
  );
}
