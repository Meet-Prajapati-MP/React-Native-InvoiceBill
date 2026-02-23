import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from './AnimatedSlideIn';
import { AnimatedIconJumpFromCenter } from './AnimatedIconJumpFromCenter';
import { AnimatedCountUp } from './AnimatedCountUp';

const { width } = Dimensions.get('window');
const SLIDE_COUNT = 6;

interface OnboardingScreenProps {
  onComplete: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

function getContainerBackground(slide: number) {
  if (slide === 0 || slide === 4) return colors.navy;
  if (slide === 5) return colors.purple50;
  return colors.white;
}

export function OnboardingScreen({ onComplete, onSignIn, onCreateAccount }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const insets = useSafeAreaInsets();

  const goNext = () => {
    if (slide < SLIDE_COUNT - 1) setSlide(s => s + 1);
    else onComplete();
  };

  const goSkip = () => setSlide(SLIDE_COUNT - 1);
  const isDark = slide === 0 || slide === 4;
  const containerBg = getContainerBackground(slide);

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {slide < SLIDE_COUNT - 1 && (
        <View style={styles.skipWrap}>
          <TouchableOpacity onPress={goSkip}>
            <Text style={[styles.skip, isDark && styles.skipLight]}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.slideContainer, { backgroundColor: containerBg }]}>
        {slide === 0 && <Slide1 />}
        {slide === 1 && <Slide2 />}
        {slide === 2 && <Slide3 />}
        {slide === 3 && <Slide4 />}
        {slide === 4 && <Slide5 />}
        {slide === 5 && (
          <Slide6
            onComplete={onComplete}
            onSignIn={onSignIn}
            onCreateAccount={onCreateAccount}
            bottomInset={insets.bottom}
          />
        )}
      </View>
      {slide < SLIDE_COUNT - 1 && (
        <View
          style={[
            styles.bottomNav,
            isDark && styles.bottomNavDark,
            { paddingBottom: Math.max(20, insets.bottom) },
          ]}
        >
          <View style={styles.dots}>
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i > 0 && { marginLeft: 6 },
                  i === slide && styles.dotActive,
                  i === slide && isDark && styles.dotActiveLight,
                  i !== slide && (isDark ? styles.dotInactiveDark : styles.dotInactive),
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={goNext}
            style={[styles.nextBtn, isDark ? styles.nextBtnDark : styles.nextBtnLight]}
          >
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function Slide1() {
  return (
    <View style={[styles.slide, styles.slide1Bg]}>
      <AnimatedSlideIn delay={100}>
        <View style={styles.slide1Content}>
          <View style={styles.logoBox}>
            <Image source={require('../../assets/tp-logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title1}>Trustopay</Text>
          <Text style={styles.subtitle1Light}>Payments Built on Trust</Text>
        </View>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={300}>
        <View style={styles.slide1Footer}>
          <Text style={styles.footerText}>Crafted with ❤️ in Gujarat</Text>
          <View style={styles.tricolorFooter}>
            <View style={[styles.tricolorBar, { backgroundColor: colors.saffron }]} />
            <View style={[styles.tricolorBar, { backgroundColor: colors.white }]} />
            <View style={[styles.tricolorBar, { backgroundColor: colors.indianGreen }]} />
          </View>
        </View>
      </AnimatedSlideIn>
    </View>
  );
}

const slide2Items = [
  { icon: 'briefcase' as const, label: 'Freelancers', color: colors.blue100 },
  { icon: 'business' as const, label: 'Agencies', color: colors.purple100 },
  { icon: 'people' as const, label: 'Clients', color: colors.green100 },
  { icon: 'bag' as const, label: 'Retail', color: colors.orange50 },
  { icon: 'school' as const, label: 'Education', color: '#FEF3C7' },
  { icon: 'medkit' as const, label: 'Healthcare', color: colors.red50 },
];

function Slide2() {
  return (
    <View style={[styles.slide, styles.slideWhite]}>
      <AnimatedSlideIn delay={80}>
        <Text style={styles.title2}>Built for Everyone{'\n'}Who Does Business</Text>
        <Text style={styles.desc}>From solopreneurs to growing teams — Trustopay works for you.</Text>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={200}>
        <View style={styles.grid}>
          {slide2Items.map((item) => (
            <View key={item.label} style={[styles.gridItem, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={22} color={colors.navy} />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </AnimatedSlideIn>
    </View>
  );
}

function Slide3() {
  return (
    <View style={[styles.slide, styles.slideWhite]}>
      <AnimatedSlideIn delay={80}>
        <Text style={styles.title2}>Professional Invoices{'\n'}in Seconds</Text>
        <Text style={styles.desc}>Create, send, and track — effortlessly.</Text>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={200}>
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View style={styles.invLogo}>
              <Image source={require('../../assets/tp-logo.png')} style={styles.invLogoImage} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.invNum}>INV-045</Text>
              <Text style={styles.invDate}>Feb 10, 2026</Text>
            </View>
            <View style={styles.badges}>
              <View style={styles.badgeGst}><Text style={styles.badgeText}>GST</Text></View>
              <View style={styles.badgePaid}><Text style={styles.badgeTextGreen}>PAID ✓</Text></View>
            </View>
          </View>
          <View style={styles.invLine}>
            <Text style={styles.invLabel}>Web Design Services</Text>
            <Text style={styles.invVal}>₹12,712</Text>
          </View>
          <View style={styles.invLine}>
            <Text style={styles.invLabel}>GST (18%)</Text>
            <Text style={styles.invVal}>₹2,288</Text>
          </View>
          <View style={styles.invTotal}>
            <Text style={styles.invTotalLabel}>Total</Text>
            <Text style={styles.invTotalVal}>₹15,000</Text>
          </View>
        </View>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={320}>
        {['GST-Ready & Legally Compliant', 'Milestone & Recurring Payments', 'Send via WhatsApp, Email, or Link'].map(f => (
          <View key={f} style={styles.checkRow}>
            <View style={styles.checkIcon}><Ionicons name="checkmark" size={14} color={colors.green600} /></View>
            <Text style={styles.checkText}>{f}</Text>
          </View>
        ))}
      </AnimatedSlideIn>
    </View>
  );
}

/** Uniform circle: 5 icons at 72° apart. Start top (-90°), then clockwise. */
const ICON_COUNT = 5;
const ICON_ANGLE_STEP = 360 / ICON_COUNT;
const CIRCLE_RADIUS = 95;

const methods = [
  { icon: 'globe' as const, color: colors.blue100 },
  { icon: 'wallet' as const, color: colors.purple100 },
  { icon: 'business' as const, color: '#FCE7F3' },
  { icon: 'phone-portrait' as const, color: colors.blue100 },
  { icon: 'card' as const, color: '#FEF9C3' },
];

const CLUSTER_SIZE = CIRCLE_RADIUS * 2 + 100;

function Slide4() {
  return (
    <View style={[styles.slide, styles.slideWhite]}>
      <AnimatedSlideIn delay={80}>
        <Text style={styles.title2}>Get Paid Faster,{'\n'}Pay Smarter</Text>
        <Text style={styles.desc}>Multiple payment methods, zero hassle.</Text>
      </AnimatedSlideIn>
      <View style={styles.methodsClusterWrap}>
        <View style={styles.methodsDot}>
          <Text style={styles.rupeeSymbol}>₹</Text>
        </View>
        {methods.map((m, i) => (
          <AnimatedIconJumpFromCenter
            key={i}
            index={i}
            delay={220}
            angle={-90 + i * ICON_ANGLE_STEP}
            radius={CIRCLE_RADIUS}
          >
            <View style={[styles.methodIcon, { backgroundColor: m.color }]}>
              <Ionicons name={m.icon} size={20} color={colors.navy} />
            </View>
          </AnimatedIconJumpFromCenter>
        ))}
      </View>
      <AnimatedSlideIn delay={450}>
        {[
          { text: 'In-App Wallet — Zero Fee Transfers', icon: 'flash' as const },
          { text: 'UPI, Cards, Net Banking, PayPal', icon: 'card' as const },
          { text: 'Instant Notifications & Receipts', icon: 'document-text' as const },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={f.icon} size={18} color={colors.purple} />
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </AnimatedSlideIn>
    </View>
  );
}

function Slide5() {
  return (
    <View style={[styles.slide, styles.slideNavy]}>
      <AnimatedSlideIn delay={80}>
        <Text style={styles.titleLight}>Your Money,{'\n'}Our Priority</Text>
        <Text style={styles.descLight}>Enterprise-grade security for your peace of mind.</Text>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={200}>
        <View style={styles.shieldWrap}>
          <Ionicons name="shield-checkmark" size={48} color={colors.white} />
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color={colors.navy} />
          </View>
        </View>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={320}>
        <View style={styles.securityGrid}>
          {[
            { text: 'Bank-Grade\nEncryption', icon: 'lock-closed' as const },
            { text: 'Verified\nBusinesses', icon: 'checkmark' as const },
            { text: 'Dispute\nProtection', icon: 'shield-checkmark' as const },
            { text: 'Complete\nAudit Trail', icon: 'document-text' as const },
          ].map((item, i) => (
            <View key={i} style={styles.securityItem}>
              <Ionicons name={item.icon} size={20} color={colors.purpleLight} />
              <Text style={styles.securityText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.pciText}>PCI DSS Compliant • 256-bit SSL Encrypted</Text>
      </AnimatedSlideIn>
    </View>
  );
}

function Slide6({
  onComplete,
  onSignIn,
  onCreateAccount,
  bottomInset = 0,
}: {
  onComplete: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  bottomInset?: number;
}) {
  return (
    <View style={[styles.slide, styles.slideGradient, { paddingBottom: 24 + Math.max(0, bottomInset) }]}>
      <AnimatedSlideIn delay={80}>
      <Text style={styles.title2}>
        Empowering{'\n'}
        <Text style={styles.titlePurple}>Micro & Small</Text>
        {'\n'}
        <Text style={styles.titlePurple}>Businesses</Text> Across India
      </Text>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={180}>
      <View style={styles.testimonial}>
        <View style={styles.testAvatar}><Text style={styles.testAvatarText}>AS</Text></View>
        <View>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={11} color="#FBBF24" />)}
          </View>
          <Text style={styles.testName}>Ankit Shah</Text>
          <Text style={styles.testRole}>Freelance Designer, Vadodara</Text>
        </View>
        <Text style={styles.testQuote}>
          "Finally, an invoicing app that understands Indian businesses. Simple, fast, and professional."
        </Text>
      </View>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={280}>
      <View style={styles.stats}>
        <Ionicons name="people" size={18} color={colors.purple} />
        <AnimatedCountUp
          from={2000}
          to={10000}
          suffix="+"
          duration={2200}
          delay={400}
          style={styles.statsNum}
        />
        <Text style={styles.statsLabel}>Businesses</Text>
      </View>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={360}>
      <Button onPress={onComplete} size="lg" style={styles.getStarted}>
        Get Started — It's Free
      </Button>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={420}>
      <TouchableOpacity onPress={onCreateAccount} style={styles.signInWrap}>
        <Text style={styles.signIn}>
          Don't have an account? <Text style={styles.signInLink}>Create account</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSignIn} style={styles.signInWrap}>
        <Text style={styles.signIn}>
          Already have an account? <Text style={styles.signInLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
      </AnimatedSlideIn>
      <AnimatedSlideIn delay={480}>
      <View style={styles.tricolorSmall}>
        <View style={[styles.tricolorBar, { backgroundColor: colors.saffron }]} />
        <View style={[styles.tricolorBar, { backgroundColor: colors.gray300 }]} />
        <View style={[styles.tricolorBar, { backgroundColor: colors.indianGreen }]} />
      </View>
      </AnimatedSlideIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slideContainer: { flex: 1 },
  skipWrap: { position: 'absolute', top: 48, right: 24, zIndex: 30 },
  skip: { fontSize: 14, fontWeight: '500', color: colors.gray400 },
  skipLight: { color: 'rgba(255,255,255,0.7)' },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.white,
  },
  bottomNavDark: { backgroundColor: colors.navy },
  dots: { flexDirection: 'row' },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: colors.purple },
  dotActiveLight: { backgroundColor: colors.white },
  dotInactive: { width: 8, backgroundColor: 'rgba(124,58,237,0.2)' },
  dotInactiveDark: { width: 8, backgroundColor: 'rgba(255,255,255,0.6)' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  nextBtnLight: { backgroundColor: colors.purple },
  nextBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  nextText: { fontSize: 14, fontWeight: '700', color: colors.white },
  slide: {
    width,
    flex: 1,
    minHeight: 500,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 24,
  },
  slide1Bg: {
    flex: 1,
    backgroundColor: colors.navy,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slide1Content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide1Footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 10,
    letterSpacing: 1,
  },
  tricolorFooter: {
    flexDirection: 'row',
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtitle1Light: { fontSize: 18, color: colors.white, marginBottom: 32 },
  slideWhite: { flex: 1, backgroundColor: colors.white },
  slideNavy: { flex: 1, backgroundColor: colors.navy },
  slideGradient: { flex: 1, backgroundColor: colors.purple50 },
  logoBox: {
    width: 112,
    height: 112,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: { fontSize: 40, fontWeight: '800', color: colors.purple },
  logoImage: { width: 72, height: 72 },
  invLogoImage: { width: 24, height: 24 },
  title1: { fontSize: 40, fontWeight: '700', color: colors.white, marginBottom: 12 },
  subtitle1: { fontSize: 18, color: colors.purpleLight, marginBottom: 32 },
  tricolor: {
    flexDirection: 'row',
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tricolorBar: { flex: 1 },
  tricolorSmall: {
    flexDirection: 'row',
    width: 64,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    opacity: 0.4,
    marginTop: 12,
  },
  title2: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  titlePurple: { color: colors.purple },
  titleLight: { fontSize: 24, fontWeight: '700', color: colors.white, marginBottom: 6 },
  desc: { fontSize: 14, color: colors.gray500, marginBottom: 24 },
  descLight: { fontSize: 14, color: colors.gray400, marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 56 - 24) / 3,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  gridLabel: { fontSize: 11, fontWeight: '700', marginTop: 8 },
  invoiceCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray100,
    marginBottom: 24,
  },
  invoiceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  invLogo: {
    width: 36,
    height: 36,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  invLogoText: { fontSize: 12, fontWeight: '700', color: colors.white },
  invNum: { fontSize: 12, fontWeight: '700', color: colors.navy },
  invDate: { fontSize: 10, color: colors.gray400 },
  badges: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  badgeGst: { backgroundColor: colors.blue50, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '700', color: colors.blue600 },
  badgePaid: { backgroundColor: colors.green50, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeTextGreen: { fontSize: 9, fontWeight: '700', color: colors.green600 },
  invLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invLabel: { fontSize: 12, color: colors.gray500 },
  invVal: { fontSize: 12, fontWeight: '500', color: colors.gray700 },
  invTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  invTotalLabel: { fontSize: 10, fontWeight: '700', color: colors.gray400 },
  invTotalVal: { fontSize: 20, fontWeight: '700', color: colors.navy },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkText: { fontSize: 14, fontWeight: '500', color: colors.gray700 },
  methodsClusterWrap: {
    width: CLUSTER_SIZE,
    height: CLUSTER_SIZE,
    alignSelf: 'center',
    marginBottom: 24,
  },
  methodsDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderRadius: 40,
    backgroundColor: colors.green50,
    borderWidth: 2,
    borderColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupeeSymbol: { fontSize: 30, fontWeight: '700', color: colors.green600 },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.gray50,
    borderRadius: 14,
    marginBottom: 12,
  },
  featureText: { fontSize: 15, fontWeight: '500', color: colors.gray700 },
  shieldWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 999,
  },
  securityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  securityItem: {
    width: (width - 56 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  securityText: { fontSize: 11, color: colors.gray300, marginTop: 8, textAlign: 'center' },
  pciText: { fontSize: 10, color: colors.gray500, textAlign: 'center' },
  testimonial: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray100,
    marginBottom: 24,
  },
  testAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testAvatarText: { fontSize: 14, fontWeight: '700', color: '#EA580C' },
  stars: { flexDirection: 'row', marginBottom: 4 },
  testName: { fontSize: 14, fontWeight: '700', color: colors.navy },
  testRole: { fontSize: 10, color: colors.gray400 },
  testQuote: { fontSize: 13, fontStyle: 'italic', color: colors.gray600, marginTop: 12 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  statsNum: { fontSize: 24, fontWeight: '700', color: colors.navy },
  statsLabel: { fontSize: 16, fontWeight: '500', color: colors.gray600 },
  getStarted: { width: '100%', height: 56, marginBottom: 12 },
  signInWrap: { marginTop: 12 },
  signIn: { fontSize: 14, color: colors.gray400 },
  signInLink: { color: colors.purple, fontWeight: '600' },
});
