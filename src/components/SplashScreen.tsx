import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const COLORS = {
  purpleDark: '#4C1D95',
  purpleMid: '#6D28D9',
  purpleBright: '#8B5CF6',
  pinkLogo: '#EC4899',
  white: '#FFFFFF',
};

const LOGO_SIZE = 56;
const DURATION = 600;
const EASE = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Stylized P logo – rounded container, bold letter */
function PLogo() {
  return (
    <View style={styles.logoBox}>
      <Text style={styles.logoLetter}>P</Text>
    </View>
  );
}

export function SplashScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateX = useSharedValue(28);

  useEffect(() => {
    logoScale.value = withDelay(
      180,
      withSequence(
        withTiming(1.06, { duration: DURATION * 0.45, easing: EASE }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
      ),
    );
    logoOpacity.value = withDelay(180, withTiming(1, { duration: DURATION * 0.55 }));
    textOpacity.value = withDelay(420, withTiming(1, { duration: 400 }));
    textTranslateX.value = withDelay(
      420,
      withTiming(0, { duration: 450, easing: Easing.bezier(0.22, 0.61, 0.36, 1) }),
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateX: textTranslateX.value }],
  }));

  return (
    <LinearGradient
      colors={[COLORS.purpleDark, COLORS.purpleMid, COLORS.purpleBright]}
      locations={[0, 0.45, 1]}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <PLogo />
        </Animated.View>
        <Animated.Text style={[styles.title, textAnimatedStyle]}>Invoices</Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 16,
    backgroundColor: COLORS.pinkLogo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
