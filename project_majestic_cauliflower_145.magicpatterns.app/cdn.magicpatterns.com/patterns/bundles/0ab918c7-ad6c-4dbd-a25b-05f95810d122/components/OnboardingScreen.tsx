import React, { useEffect, useState, Children } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Lock, Zap, Briefcase, Building2, Users, ShoppingBag, GraduationCap, Stethoscope, Smartphone, CreditCard, Globe, Wallet, FileText, Star, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
interface OnboardingScreenProps {
  onComplete: () => void;
}
const SLIDE_COUNT = 6;
const contentVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0
  })
};
export function OnboardingScreen({
  onComplete
}: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const goNext = () => {
    if (slide < SLIDE_COUNT - 1) {
      setDir(1);
      setSlide(s => s + 1);
    } else {
      onComplete();
    }
  };
  const goSkip = () => {
    setDir(1);
    setSlide(SLIDE_COUNT - 1);
  };
  const isDark = slide === 0 || slide === 4;
  return <div className="flex flex-col overflow-hidden" style={{
    height: '100vh',
    maxHeight: '100dvh'
  }} data-id="element-1499">
      {/* Skip */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-6 z-30 flex justify-end" data-id="element-1500">
        {slide < SLIDE_COUNT - 1 && <button onClick={goSkip} className={cn('text-sm font-medium', isDark ? 'text-white/70' : 'text-gray-400')} data-id="element-1501">
            Skip
          </button>}
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden" data-id="element-1502">
        <AnimatePresence initial={false} custom={dir} mode="wait" data-id="element-1503">
          <motion.div key={slide} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} className="w-full h-full" data-id="element-1504">
            {slide === 0 && <Slide1 data-id="element-1505" />}
            {slide === 1 && <Slide2 data-id="element-1506" />}
            {slide === 2 && <Slide3 data-id="element-1507" />}
            {slide === 3 && <Slide4 data-id="element-1508" />}
            {slide === 4 && <Slide5 data-id="element-1509" />}
            {slide === 5 && <Slide6 onComplete={onComplete} data-id="element-1510" />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      {slide < SLIDE_COUNT - 1 && <div className={cn('px-6 py-5 flex items-center justify-between z-20', isDark ? 'bg-trustopay-navy' : 'bg-white')} data-id="element-1511">
          <div className="flex gap-1.5" data-id="element-1512">
            {Array.from({
          length: SLIDE_COUNT
        }).map((_, i) => <motion.div key={i} animate={{
          width: i === slide ? 24 : 8,
          backgroundColor: i === slide ? isDark ? '#FFFFFF' : '#7C3AED' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.2)'
        }} transition={{
          duration: 0.3
        }} className="h-2 rounded-full" data-id="element-1513" />)}
          </div>
          <button onClick={goNext} className={cn('flex items-center gap-1.5 font-bold text-sm px-5 py-2.5 rounded-full', isDark ? 'bg-white/10 text-white' : 'bg-trustopay-purple text-white')} data-id="element-1514">
            Next <ChevronRight size={16} data-id="element-1515" />
          </button>
        </div>}
    </div>;
}
/* ═══ SLIDE 1: Welcome ═══ */
function Slide1() {
  return <div className="w-full h-full bg-gradient-to-br from-trustopay-navy via-[#1a1145] to-trustopay-purple flex flex-col items-center justify-center px-8 text-white text-center relative" data-id="element-1516">
      <motion.div initial={{
      scale: 0,
      rotate: -180
    }} animate={{
      scale: 1,
      rotate: 0
    }} transition={{
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.1
    }} className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-black/30" data-id="element-1517">
        <span className="text-5xl font-black text-trustopay-purple tracking-tighter" data-id="element-1518">
          TP
        </span>
      </motion.div>

      <motion.h1 className="text-5xl font-bold mb-3 tracking-tight" initial="hidden" animate="visible" variants={{
      visible: {
        transition: {
          staggerChildren: 0.04,
          delayChildren: 0.3
        }
      }
    }} data-id="element-1519">
        {'Trustopay'.split('').map((c, i) => <motion.span key={i} variants={{
        hidden: {
          opacity: 0,
          y: 30
        },
        visible: {
          opacity: 1,
          y: 0
        }
      }} data-id="element-1520">
            {c}
          </motion.span>)}
      </motion.h1>

      <motion.p custom={2} variants={contentVariants} initial="hidden" animate="visible" className="text-lg text-purple-200 font-medium" data-id="element-1521">
        Payments Built on Trust
      </motion.p>

      <motion.div custom={4} variants={contentVariants} initial="hidden" animate="visible" className="absolute bottom-10 flex flex-col items-center gap-2.5" data-id="element-1522">
        <p className="text-[11px] text-purple-300 font-medium tracking-widest uppercase" data-id="element-1523">
          Crafted with ❤️ in Gujarat
        </p>
        <div className="flex w-20 h-1 rounded-full overflow-hidden" data-id="element-1524">
          <div className="flex-1 bg-[#FF9933]" data-id="element-1525" />
          <div className="flex-1 bg-white" data-id="element-1526" />
          <div className="flex-1 bg-[#138808]" data-id="element-1527" />
        </div>
      </motion.div>
    </div>;
}
/* ═══ SLIDE 2: Who It's For ═══ */
function Slide2() {
  const items = [{
    icon: Briefcase,
    label: 'Freelancers',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  }, {
    icon: Building2,
    label: 'Agencies',
    color: 'bg-purple-50 text-purple-600 border-purple-100'
  }, {
    icon: Users,
    label: 'Clients',
    color: 'bg-green-50 text-green-600 border-green-100'
  }, {
    icon: ShoppingBag,
    label: 'Retail',
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  }, {
    icon: GraduationCap,
    label: 'Education',
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  }, {
    icon: Stethoscope,
    label: 'Healthcare',
    color: 'bg-red-50 text-red-600 border-red-100'
  }];
  return <div className="w-full h-full bg-white flex flex-col px-7 pt-20 pb-4 relative overflow-hidden" data-id="element-1528">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" data-id="element-1529" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" data-id="element-1530" />

      <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible" className="relative z-10" data-id="element-1531">
        <h2 className="text-3xl font-bold text-trustopay-navy mb-2 leading-tight" data-id="element-1532">
          Built for Everyone
          <br data-id="element-1533" />
          Who Does Business
        </h2>
        <p className="text-gray-500 text-sm mb-8" data-id="element-1534">
          From solopreneurs to growing teams — Trustopay works for you.
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 relative z-10" data-id="element-1535">
        {items.map((item, i) => {
        const Icon = item.icon;
        return <motion.div key={item.label} custom={i + 1} variants={contentVariants} initial="hidden" animate="visible" className={cn('border rounded-2xl p-4 flex flex-col items-center gap-2', item.color)} data-id="element-1536">
              <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm" data-id="element-1537">
                <Icon size={22} data-id="element-1538" />
              </div>
              <span className="text-[11px] font-bold" data-id="element-1539">{item.label}</span>
            </motion.div>;
      })}
      </div>

      <motion.p custom={7} variants={contentVariants} initial="hidden" animate="visible" className="text-center text-[11px] text-gray-400 mt-auto pt-4" data-id="element-1540">
        + Consulting, Construction, Food & Hospitality, and more
      </motion.p>
    </div>;
}
/* ═══ SLIDE 3: Invoicing ═══ */
function Slide3() {
  return <div className="w-full h-full bg-gradient-to-b from-purple-50 via-white to-white flex flex-col px-7 pt-20 pb-4" data-id="element-1541">
      <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible" className="text-center mb-6" data-id="element-1542">
        <h2 className="text-2xl font-bold text-trustopay-navy mb-1.5" data-id="element-1543">
          Professional Invoices
          <br data-id="element-1544" />
          in Seconds
        </h2>
        <p className="text-sm text-gray-500" data-id="element-1545">
          Create, send, and track — effortlessly.
        </p>
      </motion.div>

      <motion.div custom={1} variants={contentVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mx-2 mb-8 rotate-1" data-id="element-1546">
        <div className="flex justify-between items-start mb-4" data-id="element-1547">
          <div className="flex items-center gap-2.5" data-id="element-1548">
            <div className="w-9 h-9 bg-trustopay-purple rounded-lg flex items-center justify-center text-white font-bold text-xs" data-id="element-1549">
              TP
            </div>
            <div data-id="element-1550">
              <p className="text-xs font-bold text-trustopay-navy" data-id="element-1551">INV-045</p>
              <p className="text-[10px] text-gray-400" data-id="element-1552">Feb 10, 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2" data-id="element-1553">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full" data-id="element-1554">
              GST
            </span>
            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded-full" data-id="element-1555">
              PAID ✓
            </span>
          </div>
        </div>
        <div className="space-y-2 mb-3" data-id="element-1556">
          <div className="flex justify-between text-xs" data-id="element-1557">
            <span className="text-gray-500" data-id="element-1558">Web Design Services</span>
            <span className="font-medium text-gray-700" data-id="element-1559">₹12,712</span>
          </div>
          <div className="flex justify-between text-xs" data-id="element-1560">
            <span className="text-gray-500" data-id="element-1561">GST (18%)</span>
            <span className="font-medium text-gray-700" data-id="element-1562">₹2,288</span>
          </div>
        </div>
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center" data-id="element-1563">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider" data-id="element-1564">
            Total
          </span>
          <span className="text-xl font-bold text-trustopay-navy" data-id="element-1565">₹15,000</span>
        </div>
      </motion.div>

      <div className="space-y-3.5 px-2" data-id="element-1566">
        {['GST-Ready & Legally Compliant', 'Milestone & Recurring Payments', 'Send via WhatsApp, Email, or Link'].map((f, i) => <motion.div key={i} custom={i + 2} variants={contentVariants} initial="hidden" animate="visible" className="flex items-center gap-3" data-id="element-1567">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" data-id="element-1568">
              <Check size={14} className="text-green-600" data-id="element-1569" />
            </div>
            <span className="text-sm font-medium text-gray-700" data-id="element-1570">{f}</span>
          </motion.div>)}
      </div>
    </div>;
}
/* ═══ SLIDE 4: Payments ═══ */
function Slide4() {
  const methods = [{
    icon: Wallet,
    color: 'bg-purple-100 text-purple-600',
    x: 0,
    y: -85
  }, {
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-600',
    x: 80,
    y: -26
  }, {
    icon: CreditCard,
    color: 'bg-orange-100 text-orange-600',
    x: 50,
    y: 68
  }, {
    icon: Globe,
    color: 'bg-indigo-100 text-indigo-600',
    x: -50,
    y: 68
  }, {
    icon: Building2,
    color: 'bg-red-100 text-red-600',
    x: -80,
    y: -26
  }];
  return <div className="w-full h-full bg-white flex flex-col px-7 pt-20 pb-4 relative overflow-hidden" data-id="element-1571">
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-50" data-id="element-1572" />

      <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible" className="text-center mb-6 relative z-10" data-id="element-1573">
        <h2 className="text-2xl font-bold text-trustopay-navy mb-1.5" data-id="element-1574">
          Get Paid Faster,
          <br data-id="element-1575" />
          Pay Smarter
        </h2>
        <p className="text-sm text-gray-500" data-id="element-1576">
          Multiple payment methods, zero hassle.
        </p>
      </motion.div>

      <div className="relative w-56 h-56 mx-auto mb-8 z-10" data-id="element-1577">
        <motion.div animate={{
        scale: [1, 1.08, 1]
      }} transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }} className="absolute inset-0 m-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center z-10 border-2 border-green-100" data-id="element-1578">
          <span className="text-3xl font-bold text-green-600" data-id="element-1579">₹</span>
        </motion.div>
        {methods.map((m, i) => {
        const Icon = m.icon;
        return <motion.div key={i} initial={{
          x: 0,
          y: 0,
          opacity: 0,
          scale: 0.5
        }} animate={{
          x: m.x,
          y: m.y,
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3 + i * 0.08,
          type: 'spring',
          stiffness: 200,
          damping: 15
        }} className={cn('absolute inset-0 m-auto w-12 h-12 rounded-xl flex items-center justify-center shadow-sm', m.color)} data-id="element-1580">
              <Icon size={20} data-id="element-1581" />
            </motion.div>;
      })}
      </div>

      <div className="space-y-2.5 px-1 z-10 relative" data-id="element-1582">
        {[{
        text: 'In-App Wallet — Zero Fee Transfers',
        icon: Zap
      }, {
        text: 'UPI, Cards, Net Banking, PayPal',
        icon: CreditCard
      }, {
        text: 'Instant Notifications & Receipts',
        icon: FileText
      }].map((f, i) => {
        const Icon = f.icon;
        return <motion.div key={i} custom={i + 3} variants={contentVariants} initial="hidden" animate="visible" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl" data-id="element-1583">
              <Icon size={18} className="text-trustopay-purple flex-shrink-0" data-id="element-1584" />
              <span className="text-sm font-medium text-gray-700" data-id="element-1585">
                {f.text}
              </span>
            </motion.div>;
      })}
      </div>
    </div>;
}
/* ═══ SLIDE 5: Trust & Security ═══ */
function Slide5() {
  return <div className="w-full h-full bg-trustopay-navy flex flex-col px-7 pt-20 pb-4 text-white" data-id="element-1586">
      <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible" className="text-center mb-10" data-id="element-1587">
        <h2 className="text-3xl font-bold mb-2" data-id="element-1588">
          Your Money,
          <br data-id="element-1589" />
          Our Priority
        </h2>
        <p className="text-gray-400 text-sm" data-id="element-1590">
          Enterprise-grade security for your peace of mind.
        </p>
      </motion.div>

      <motion.div initial={{
      scale: 0.5,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      delay: 0.2,
      type: 'spring',
      stiffness: 200,
      damping: 15
    }} className="relative w-32 h-32 mx-auto mb-10" data-id="element-1591">
        <motion.div animate={{
        scale: [1, 1.4, 1],
        opacity: [0.3, 0, 0.3]
      }} transition={{
        duration: 2,
        repeat: Infinity
      }} className="absolute inset-0 bg-trustopay-purple rounded-full" data-id="element-1592" />
        <div className="relative w-full h-full bg-gradient-to-br from-trustopay-purple to-indigo-600 rounded-full flex items-center justify-center shadow-2xl" data-id="element-1593">
          <Shield size={48} className="text-white" data-id="element-1594" />
          <div className="absolute -bottom-1 -right-1 bg-white text-trustopay-navy p-2 rounded-full shadow-lg" data-id="element-1595">
            <Lock size={14} data-id="element-1596" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6" data-id="element-1597">
        {[{
        text: 'Bank-Grade\nEncryption',
        icon: Lock
      }, {
        text: 'Verified\nBusinesses',
        icon: Check
      }, {
        text: 'Dispute\nProtection',
        icon: Shield
      }, {
        text: 'Complete\nAudit Trail',
        icon: FileText
      }].map((item, i) => {
        const Icon = item.icon;
        return <motion.div key={i} custom={i + 2} variants={contentVariants} initial="hidden" animate="visible" className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center text-center gap-2" data-id="element-1598">
              <Icon size={20} className="text-purple-300" data-id="element-1599" />
              <span className="text-[11px] font-medium text-gray-300 whitespace-pre-line leading-tight" data-id="element-1600">
                {item.text}
              </span>
            </motion.div>;
      })}
      </div>

      <motion.p custom={6} variants={contentVariants} initial="hidden" animate="visible" className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-auto" data-id="element-1601">
        PCI DSS Compliant • 256-bit SSL Encrypted
      </motion.p>
    </div>;
}
/* ═══ SLIDE 6: Get Started ═══ */
function Slide6({
  onComplete
}: {
  onComplete: () => void;
}) {
  return <div className="w-full h-full bg-gradient-to-br from-white via-purple-50/50 to-purple-50 flex flex-col px-7 pt-20 pb-6" data-id="element-1602">
      <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible" className="mb-6" data-id="element-1603">
        <h2 className="text-3xl font-bold text-trustopay-navy leading-tight" data-id="element-1604">
          Empowering
          <br data-id="element-1605" />
          <span className="text-trustopay-purple" data-id="element-1606">Micro & Small</span>
          <br data-id="element-1607" />
          <span className="text-trustopay-purple" data-id="element-1608">Businesses</span> Across India
        </h2>
      </motion.div>

      <motion.div custom={1} variants={contentVariants} initial="hidden" animate="visible" className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-6" data-id="element-1609">
        <div className="flex items-center gap-3 mb-3" data-id="element-1610">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm" data-id="element-1611">
            AS
          </div>
          <div data-id="element-1612">
            <div className="flex text-yellow-400 mb-0.5" data-id="element-1613">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill="currentColor" data-id="element-1614" />)}
            </div>
            <p className="text-sm font-bold text-trustopay-navy" data-id="element-1615">Ankit Shah</p>
            <p className="text-[10px] text-gray-400" data-id="element-1616">
              Freelance Designer, Vadodara
            </p>
          </div>
        </div>
        <p className="text-gray-600 italic text-[13px] leading-relaxed" data-id="element-1617">
          "Finally, an invoicing app that understands Indian businesses. Simple,
          fast, and professional."
        </p>
      </motion.div>

      <motion.div custom={2} variants={contentVariants} initial="hidden" animate="visible" className="text-center mb-8" data-id="element-1618">
        <p className="text-xs font-medium text-gray-400 mb-1" data-id="element-1619">
          Join a growing community
        </p>
        <div className="flex items-center justify-center gap-2" data-id="element-1620">
          <Users size={18} className="text-trustopay-purple" data-id="element-1621" />
          <span className="text-2xl font-bold text-trustopay-navy" data-id="element-1622">
            <Counter from={0} to={10000} data-id="element-1623" />+
          </span>
          <span className="text-base font-medium text-gray-600" data-id="element-1624">
            Businesses
          </span>
        </div>
      </motion.div>

      <motion.div custom={3} variants={contentVariants} initial="hidden" animate="visible" className="mt-auto space-y-3" data-id="element-1625">
        <Button size="lg" className="w-full text-base h-14 shadow-xl shadow-purple-200/50" onClick={onComplete} data-id="element-1626">
          Get Started — It's Free
        </Button>
        <button onClick={onComplete} className="w-full text-center text-sm font-medium text-gray-400" data-id="element-1627">
          Already have an account?{' '}
          <span className="text-trustopay-purple font-semibold" data-id="element-1628">Sign In</span>
        </button>
        <div className="flex justify-center pt-3" data-id="element-1629">
          <div className="flex w-16 h-1 rounded-full overflow-hidden opacity-40" data-id="element-1630">
            <div className="flex-1 bg-[#FF9933]" data-id="element-1631" />
            <div className="flex-1 bg-gray-300" data-id="element-1632" />
            <div className="flex-1 bg-[#138808]" data-id="element-1633" />
          </div>
        </div>
      </motion.div>
    </div>;
}
/* ═══ Counter Animation ═══ */
function Counter({
  from,
  to
}: {
  from: number;
  to: number;
}) {
  const [count, setCount] = useState(from);
  useEffect(() => {
    const steps = 50;
    const stepTime = 2000 / steps;
    const inc = (to - from) / steps;
    let current = from;
    const timer = setInterval(() => {
      current += inc;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [from, to]);
  return <>{count.toLocaleString()}</>;
}