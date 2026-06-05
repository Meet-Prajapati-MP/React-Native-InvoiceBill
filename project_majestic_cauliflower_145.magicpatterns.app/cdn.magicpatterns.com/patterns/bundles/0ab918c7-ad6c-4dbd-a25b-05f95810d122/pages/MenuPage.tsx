import React, { useState } from 'react';
import { Wallet, Activity, Building, Package, HelpCircle, MessageSquare, ChevronRight, LogOut, Landmark, Check, X, Loader2, Crown, Camera, Trash2, Download, Mail, Phone, MapPin, User, Plus, ArrowUpRight, ArrowDownLeft, FileText, Briefcase, UserCircle, Building2, Receipt, Globe, BarChart3, Settings, ShieldCheck, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn, formatINR } from '../lib/utils';
import { ReportsAnalytics } from '../components/ReportsAnalytics';
import { BusinessProfile } from '../components/BusinessProfile';
import { InvoiceSettings } from '../components/InvoiceSettings';
import { TermsConditions } from '../components/TermsConditions';
import { VerificationCenter } from '../components/VerificationCenter';
import { PaymentReminder } from '../components/PaymentReminder';
import { AddressManagement } from '../components/AddressManagement';
interface MenuPageProps {
  onNavigate: (tab: string) => void;
}
export function MenuPage({
  onNavigate
}: MenuPageProps) {
  const [showBankVerification, setShowBankVerification] = useState(false);
  const [showGSTDetails, setShowGSTDetails] = useState(false);
  const [showItemList, setShowItemList] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [showSubscribeFlow, setShowSubscribeFlow] = useState(false);
  const [showSubDetails, setShowSubDetails] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  // Profile state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('Arjun Mehta');
  const [profileEmail, setProfileEmail] = useState('arjun.mehta@example.com');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [profilePincode, setProfilePincode] = useState('');
  // GST State
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  // Business Profile State
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [showInvoiceSettings, setShowInvoiceSettings] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [showVerificationCenter, setShowVerificationCenter] = useState(false);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const [showAddressManagement, setShowAddressManagement] = useState(false);
  // Subscription cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Support state
  const [showHelpCentre, setShowHelpCentre] = useState(false);
  const [showMessageCentre, setShowMessageCentre] = useState(false);
  // Item List State
  const [items, setItems] = useState([{
    id: 1,
    name: 'Website Design',
    rate: 15000,
    description: 'Full website design and development'
  }, {
    id: 2,
    name: 'Logo Design',
    rate: 5000,
    description: 'Professional logo with brand guidelines'
  }]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemRate, setNewItemRate] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  // Mock verified accounts
  const [accounts, setAccounts] = useState([{
    id: 1,
    bank: 'HDFC Bank',
    account: '**** 1234',
    verified: true
  }]);
  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setAccounts([...accounts, {
        id: 2,
        bank: 'SBI Bank',
        account: '**** 5678',
        verified: true
      }]);
    }, 2000);
  };
  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setIsSubscribed(true);
      setShowSubscribeFlow(false);
    }, 2000);
  };
  const handlePhotoUpload = () => {
    setProfilePhoto('https://api.dicebear.com/7.x/initials/svg?seed=AM&backgroundColor=7C3AED&textColor=ffffff');
  };
  const handleAddItem = () => {
    if (!newItemName || !newItemRate) return;
    setItems([...items, {
      id: Date.now(),
      name: newItemName,
      rate: Number(newItemRate),
      description: newItemDesc
    }]);
    setNewItemName('');
    setNewItemRate('');
    setNewItemDesc('');
    setShowAddItem(false);
  };
  const handleDeleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };
  const menuGroups = [{
    title: 'Subscription',
    items: [{
      icon: Crown,
      label: 'Subscription',
      action: () => setShowSubDetails(true),
      badge: isSubscribed ? 'Pro' : 'Free Plan',
      badgeColor: isSubscribed ? 'bg-purple-100 text-trustopay-purple' : 'bg-gray-100 text-gray-500'
    }]
  }, {
    title: 'Manage Finances',
    items: [{
      icon: Wallet,
      label: 'Wallet',
      action: () => onNavigate('add-money')
    }, {
      icon: Landmark,
      label: 'Bank Accounts',
      action: () => setShowBankVerification(true)
    }, {
      icon: Activity,
      label: 'Activity',
      action: () => setShowActivity(true)
    }]
  }, {
    title: 'Manage Business',
    items: [{
      icon: Building,
      label: 'Business',
      action: () => setShowBusinessProfile(true)
    }, {
      icon: Settings,
      label: 'Invoice Settings',
      action: () => setShowInvoiceSettings(true)
    }, {
      icon: FileText,
      label: 'Terms & Conditions',
      action: () => setShowTermsConditions(true)
    }, {
      icon: ShieldCheck,
      label: 'Verification Center',
      action: () => setShowVerificationCenter(true)
    }, {
      icon: MapPin,
      label: 'My Addresses',
      action: () => setShowAddressManagement(true)
    }, {
      icon: Bell,
      label: 'Send Reminders',
      action: () => setShowPaymentReminder(true)
    }, {
      icon: BarChart3,
      label: 'Reports & Analytics',
      action: () => setShowReports(true)
    }, {
      icon: Package,
      label: 'Item List',
      action: () => setShowItemList(true)
    }]
  }, {
    title: 'Get Support',
    items: [{
      icon: HelpCircle,
      label: 'Help Centre',
      action: () => setShowHelpCentre(true)
    }, {
      icon: MessageSquare,
      label: 'Message Centre',
      action: () => setShowMessageCentre(true)
    }]
  }];
  return <div className="flex flex-col min-h-screen bg-trustopay-bg pb-24" data-id="element-3944">
      {/* Profile Header */}
      <div className="px-5 pt-12 pb-6 bg-white shadow-sm mb-4" data-id="element-3945">
        <button onClick={() => setShowProfile(true)} className="flex items-center gap-4 w-full text-left" data-id="element-3946">
          <div className="relative" data-id="element-3947">
            {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" data-id="element-3948" /> : <div className="w-16 h-16 rounded-full bg-trustopay-navy text-white flex items-center justify-center text-xl font-bold" data-id="element-3949">
                AM
              </div>}
          </div>
          <div className="flex-1" data-id="element-3950">
            <h1 className="text-xl font-bold text-trustopay-navy" data-id="element-3951">
              {profileName}
            </h1>
            <p className="text-sm text-gray-500" data-id="element-3952">{profileEmail}</p>
            <p className="text-xs text-gray-400 mt-0.5" data-id="element-3953">{profilePhone}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" data-id="element-3954" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-6" data-id="element-3955">
        {menuGroups.map((group, groupIndex) => <motion.div key={group.title} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: groupIndex * 0.1
      }} data-id="element-3956">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2" data-id="element-3957">
              {group.title}
            </h3>
            <Card className="overflow-hidden border-none shadow-sm" data-id="element-3958">
              {group.items.map((item, index) => {
            const Icon = item.icon;
            return <div key={item.label} data-id="element-3959">
                    <button onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left" data-id="element-3960">
                      <div className="flex items-center gap-3" data-id="element-3961">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-trustopay-navy" data-id="element-3962">
                          <Icon size={16} data-id="element-3963" />
                        </div>
                        <span className="font-medium text-trustopay-navy" data-id="element-3964">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2" data-id="element-3965">
                        {item.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`} data-id="element-3966">
                            {item.badge}
                          </span>}
                        <ChevronRight size={18} className="text-gray-300" data-id="element-3967" />
                      </div>
                    </button>
                    {index < group.items.length - 1 && <div className="h-[1px] bg-gray-100 mx-4" data-id="element-3968" />}
                  </div>;
          })}
            </Card>
          </motion.div>)}

        <motion.button initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5
      }} className="w-full p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors" data-id="element-3969">
          <LogOut size={18} data-id="element-3970" />
          Log Out
        </motion.button>

        <div className="text-center text-xs text-gray-400 pb-4" data-id="element-3971">
          Version 1.0.2 • Trustopay India
        </div>
      </div>

      {/* Profile Overlay */}
      <AnimatePresence data-id="element-3972">
        {showProfile && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-3973">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-3974">
              <button onClick={() => setShowProfile(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3975">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-3976" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-3977">
                My Profile
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8" data-id="element-3978">
              {/* Profile Photo */}
              <div className="flex flex-col items-center" data-id="element-3979">
                <div className="relative mb-4" data-id="element-3980">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-100" data-id="element-3981" /> : <div className="w-24 h-24 rounded-full bg-trustopay-navy text-white flex items-center justify-center text-3xl font-bold border-4 border-purple-100" data-id="element-3982">
                      AM
                    </div>}
                  <button onClick={handlePhotoUpload} className="absolute bottom-0 right-0 w-8 h-8 bg-trustopay-purple text-white rounded-full flex items-center justify-center shadow-lg" data-id="element-3983">
                    <Camera size={14} data-id="element-3984" />
                  </button>
                </div>
                {profilePhoto && <button onClick={() => setProfilePhoto(null)} className="text-xs text-red-500 flex items-center gap-1 hover:underline" data-id="element-3985">
                    <Trash2 size={12} data-id="element-3986" /> Remove Photo
                  </button>}
              </div>

              {/* Profile Fields */}
              <div className="space-y-4" data-id="element-3987">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-3988">
                  <User size={18} className="text-gray-400" data-id="element-3989" />
                  <div className="flex-1" data-id="element-3990">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-3991">
                      Full Name
                    </p>
                    <p className="font-medium text-trustopay-navy" data-id="element-3992">
                      {profileName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-3993">
                  <Phone size={18} className="text-gray-400" data-id="element-3994" />
                  <div className="flex-1" data-id="element-3995">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-3996">
                      Mobile Number
                    </p>
                    <p className="font-medium text-trustopay-navy" data-id="element-3997">
                      {profilePhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-3998">
                  <Mail size={18} className="text-gray-400" data-id="element-3999" />
                  <div className="flex-1" data-id="element-4000">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-4001">
                      Email Address
                    </p>
                    <p className="font-medium text-trustopay-navy" data-id="element-4002">
                      {profileEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-4003">
                  <MapPin size={18} className="text-gray-400" data-id="element-4004" />
                  <div className="flex-1" data-id="element-4005">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-4006">
                      Pin Code{' '}
                      <span className="text-gray-300 normal-case" data-id="element-4007">
                        (Optional)
                      </span>
                    </p>
                    {profilePincode ? <p className="font-medium text-trustopay-navy" data-id="element-4008">
                        {profilePincode}
                      </p> : <input type="text" placeholder="Enter pin code" value={profilePincode} onChange={e => setProfilePincode(e.target.value)} className="text-sm text-trustopay-navy bg-transparent outline-none placeholder:text-gray-300 w-full" maxLength={6} data-id="element-4009" />}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setShowProfile(false)} data-id="element-4010">
                Done
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* GST Details Overlay */}
      <AnimatePresence data-id="element-4011">
        {showGSTDetails && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4012">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4013">
              <button onClick={() => setShowGSTDetails(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4014">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4015" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4016">
                GST Details
              </h2>
            </div>

            <div className="flex-1 p-5 space-y-6" data-id="element-4017">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200" data-id="element-4018">
                <div data-id="element-4019">
                  <p className="font-medium text-trustopay-navy" data-id="element-4020">Enable GST</p>
                  <p className="text-xs text-gray-500" data-id="element-4021">
                    Include GST in invoices
                  </p>
                </div>
                <button onClick={() => setGstEnabled(!gstEnabled)} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out', gstEnabled ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-4022">
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out', gstEnabled ? 'translate-x-6' : 'translate-x-0')} data-id="element-4023" />
                </button>
              </div>

              {gstEnabled && <div className="space-y-4" data-id="element-4024">
                  <Input label="GST Number" placeholder="e.g. 22AAAAA0000A1Z5" value={gstNumber} onChange={e => setGstNumber(e.target.value)} data-id="element-4025" />
                  <Input label="Business Name" placeholder="Enter registered business name" value={businessName} onChange={e => setBusinessName(e.target.value)} data-id="element-4026" />
                </div>}

              <Button className="w-full mt-auto" onClick={() => setShowGSTDetails(false)} data-id="element-4027">
                Save Details
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Item List Overlay */}
      <AnimatePresence data-id="element-4028">
        {showItemList && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4029">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4030">
              <button onClick={() => setShowItemList(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4031">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4032" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4033">
                Item List
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5" data-id="element-4034">
              <div className="space-y-4 mb-6" data-id="element-4035">
                {items.map(item => <Card key={item.id} className="p-4 flex justify-between items-start" data-id="element-4036">
                    <div data-id="element-4037">
                      <h3 className="font-bold text-trustopay-navy" data-id="element-4038">
                        {item.name}
                      </h3>
                      <p className="text-sm font-medium text-trustopay-purple" data-id="element-4039">
                        {formatINR(item.rate)}
                      </p>
                      {item.description && <p className="text-xs text-gray-500 mt-1" data-id="element-4040">
                          {item.description}
                        </p>}
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 p-1" data-id="element-4041">
                      <Trash2 size={16} data-id="element-4042" />
                    </button>
                  </Card>)}
              </div>

              {showAddItem ? <Card className="p-4 space-y-3 border-trustopay-purple bg-purple-50/30" data-id="element-4043">
                  <Input placeholder="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="bg-white" data-id="element-4044" />
                  <Input placeholder="Rate (₹)" type="number" value={newItemRate} onChange={e => setNewItemRate(e.target.value)} className="bg-white" data-id="element-4045" />
                  <Input placeholder="Description (Optional)" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="bg-white" data-id="element-4046" />
                  <div className="flex gap-2" data-id="element-4047">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowAddItem(false)} data-id="element-4048">
                      Cancel
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleAddItem} data-id="element-4049">
                      Save Item
                    </Button>
                  </div>
                </Card> : <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAddItem(true)} data-id="element-4050">
                  <Plus size={16} className="mr-2" data-id="element-4051" /> Add New Item
                </Button>}
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Activity Overlay */}
      <AnimatePresence data-id="element-4052">
        {showActivity && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4053">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4054">
              <button onClick={() => setShowActivity(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4055">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4056" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4057">
                Activity
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5" data-id="element-4058">
              <div className="relative pl-4 space-y-8 border-l border-gray-100 ml-2" data-id="element-4059">
                {[{
              title: 'Invoice INV-006 Sent',
              desc: 'Sent to Priya Sharma',
              time: '2 hours ago',
              icon: FileText,
              color: 'bg-purple-100 text-trustopay-purple'
            }, {
              title: 'Payment Received',
              desc: '₹45,000 from Design Studio',
              time: 'Yesterday',
              icon: ArrowDownLeft,
              color: 'bg-green-100 text-green-600'
            }, {
              title: 'Payment Sent',
              desc: '₹2,500 to Rahul Verma',
              time: 'Yesterday',
              icon: ArrowUpRight,
              color: 'bg-red-100 text-red-600'
            }, {
              title: 'Subscription Activated',
              desc: 'Yearly Pro Plan',
              time: '2 days ago',
              icon: Crown,
              color: 'bg-yellow-100 text-yellow-600'
            }, {
              title: 'New Customer Added',
              desc: 'Manish Gupta',
              time: '3 days ago',
              icon: User,
              color: 'bg-blue-100 text-blue-600'
            }].map((item, i) => <div key={i} className="relative" data-id="element-4060">
                    <div className={`absolute -left-[25px] w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${item.color}`} data-id="element-4061">
                      <item.icon size={14} data-id="element-4062" />
                    </div>
                    <div data-id="element-4063">
                      <p className="font-bold text-trustopay-navy text-sm" data-id="element-4064">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-4065">{item.desc}</p>
                      <p className="text-[10px] text-gray-400 mt-1" data-id="element-4066">
                        {item.time}
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Reports & Analytics Overlay */}
      <AnimatePresence data-id="element-4067">
        {showReports && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4068">
            <ReportsAnalytics isOpen={showReports} onClose={() => setShowReports(false)} data-id="element-4069" />
          </motion.div>}
      </AnimatePresence>

      {/* Bank Verification Overlay */}
      <AnimatePresence data-id="element-4070">
        {showBankVerification && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-4071">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4072">
              <button onClick={() => setShowBankVerification(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4073">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4074" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4075">
                Bank Accounts
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-5" data-id="element-4076">
              <h3 className="text-sm font-bold text-gray-500 mb-4" data-id="element-4077">
                Linked Accounts
              </h3>
              <div className="space-y-3 mb-8" data-id="element-4078">
                {accounts.map(acc => <div key={acc.id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between" data-id="element-4079">
                    <div className="flex items-center gap-3" data-id="element-4080">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600" data-id="element-4081">
                        <Landmark size={20} data-id="element-4082" />
                      </div>
                      <div data-id="element-4083">
                        <p className="font-bold text-trustopay-navy" data-id="element-4084">
                          {acc.bank}
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-4085">{acc.account}</p>
                      </div>
                    </div>
                    {acc.verified && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1" data-id="element-4086">
                        <Check size={12} data-id="element-4087" /> Verified
                      </span>}
                  </div>)}
              </div>

              <h3 className="text-sm font-bold text-gray-500 mb-4" data-id="element-4088">
                Add New Account
              </h3>
              <div className="space-y-4" data-id="element-4089">
                <Input label="Account Number" placeholder="Enter account number" data-id="element-4090" />
                <Input label="IFSC Code" placeholder="Enter IFSC code" data-id="element-4091" />
                <Input label="Account Holder Name" placeholder="Enter name as per bank" data-id="element-4092" />

                <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start" data-id="element-4093">
                  <div className="mt-0.5" data-id="element-4094">
                    <Activity size={16} className="text-blue-600" data-id="element-4095" />
                  </div>
                  <p className="text-xs text-blue-700" data-id="element-4096">
                    We will deposit ₹1 to your account to verify ownership
                    (Penny Drop Verification).
                  </p>
                </div>

                <Button className="w-full mt-4" onClick={handleVerify} disabled={verifying || verified} data-id="element-4097">
                  {verifying ? <>
                      <Loader2 size={18} className="animate-spin mr-2" data-id="element-4098" />{' '}
                      Verifying...
                    </> : verified ? <>
                      <Check size={18} className="mr-2" data-id="element-4099" /> Verified Successfully
                    </> : 'Verify with Penny Drop'}
                </Button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Subscribe Flow Overlay */}
      <AnimatePresence data-id="element-4100">
        {showSubscribeFlow && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowSubscribeFlow(false)} data-id="element-4101">
            <motion.div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6" onClick={e => e.stopPropagation()} data-id="element-4102">
              <div className="flex justify-between items-center mb-6" data-id="element-4103">
                <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-4104">
                  Confirm Subscription
                </h2>
                <button onClick={() => setShowSubscribeFlow(false)} className="p-2 bg-gray-100 rounded-full" data-id="element-4105">
                  <X size={20} data-id="element-4106" />
                </button>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-100" data-id="element-4107">
                <div className="flex justify-between items-center mb-2" data-id="element-4108">
                  <span className="font-bold text-trustopay-navy" data-id="element-4109">
                    Yearly Plan
                  </span>
                  <span className="font-bold text-trustopay-purple" data-id="element-4110">
                    ₹999/year
                  </span>
                </div>
                <p className="text-sm text-gray-500" data-id="element-4111">
                  Includes unlimited invoices, GST support, and premium
                  templates.
                </p>
              </div>

              <Button className="w-full h-12 text-lg" onClick={handleSubscribe} disabled={subscribing} data-id="element-4112">
                {subscribing ? 'Processing...' : 'Pay ₹999 & Subscribe'}
              </Button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* GST Details Overlay */}
      <AnimatePresence data-id="element-4113">
        {showBusinessProfile && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4114">
            <BusinessProfile isOpen={showBusinessProfile} onClose={() => setShowBusinessProfile(false)} data-id="element-4115" />
          </motion.div>}
      </AnimatePresence>

      {/* Invoice Settings Overlay */}
      <AnimatePresence data-id="element-4116">
        {showInvoiceSettings && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4117">
            <InvoiceSettings isOpen={showInvoiceSettings} onClose={() => setShowInvoiceSettings(false)} data-id="element-4118" />
          </motion.div>}
      </AnimatePresence>

      {/* Terms & Conditions Overlay */}
      <AnimatePresence data-id="element-4119">
        {showTermsConditions && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4120">
            <TermsConditions isOpen={showTermsConditions} onClose={() => setShowTermsConditions(false)} data-id="element-4121" />
          </motion.div>}
      </AnimatePresence>

      {/* Verification Center Overlay */}
      <AnimatePresence data-id="element-4122">
        {showVerificationCenter && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4123">
            <VerificationCenter isOpen={showVerificationCenter} onClose={() => setShowVerificationCenter(false)} data-id="element-4124" />
          </motion.div>}
      </AnimatePresence>

      {/* Payment Reminder Overlay */}
      <AnimatePresence data-id="element-4125">
        {showPaymentReminder && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4126">
            <PaymentReminder isOpen={showPaymentReminder} onClose={() => setShowPaymentReminder(false)} data-id="element-4127" />
          </motion.div>}
      </AnimatePresence>

      {/* Address Management Overlay */}
      <AnimatePresence data-id="element-4128">
        {showAddressManagement && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50" data-id="element-4129">
            <AddressManagement isOpen={showAddressManagement} onClose={() => setShowAddressManagement(false)} data-id="element-4130" />
          </motion.div>}
      </AnimatePresence>

      {/* Subscription Details Overlay */}
      <AnimatePresence data-id="element-4131">
        {showSubDetails && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4132">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4133">
              <button onClick={() => setShowSubDetails(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4134">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4135" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4136">
                Subscription Details
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-4137">
              <div className="text-center py-4" data-id="element-4138">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3" data-id="element-4139">
                  <Crown size={32} className="text-trustopay-purple" data-id="element-4140" />
                </div>
                <h3 className="text-xl font-bold text-trustopay-navy" data-id="element-4141">
                  Invoice Pro
                </h3>
                <p className="text-sm text-gray-500" data-id="element-4142">Yearly Plan</p>
              </div>

              <Card className="p-4 space-y-3" data-id="element-4143">
                <div className="flex justify-between text-sm" data-id="element-4144">
                  <span className="text-gray-500" data-id="element-4145">Plan</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-4146">
                    Yearly
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-4147">
                  <span className="text-gray-500" data-id="element-4148">Amount</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-4149">
                    ₹999/year
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-4150">
                  <span className="text-gray-500" data-id="element-4151">Started</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-4152">
                    Oct 24, 2024
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-4153">
                  <span className="text-gray-500" data-id="element-4154">Renews</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-4155">
                    Oct 24, 2025
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-4156">
                  <span className="text-gray-500" data-id="element-4157">Status</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full" data-id="element-4158">
                    Active
                  </span>
                </div>
              </Card>

              <Card className="p-4" data-id="element-4159">
                <h4 className="font-bold text-trustopay-navy mb-3" data-id="element-4160">
                  What's Included
                </h4>
                <div className="space-y-2" data-id="element-4161">
                  {['Unlimited invoices', 'GST support', 'Premium templates', 'Priority support', 'WhatsApp & Email delivery'].map(feature => <div key={feature} className="flex items-center gap-2 text-sm" data-id="element-4162">
                      <Check size={14} className="text-green-500" data-id="element-4163" />
                      <span className="text-gray-700" data-id="element-4164">{feature}</span>
                    </div>)}
                </div>
              </Card>

              <div className="flex gap-3" data-id="element-4165">
                {!isSubscribed && <Button className="flex-1" onClick={() => setShowSubscribeFlow(true)} data-id="element-4166">
                    Upgrade Plan
                  </Button>}
                <Button variant="outline" className="flex-1 gap-2" data-id="element-4167">
                  <Download size={16} data-id="element-4168" /> Invoice
                </Button>
              </div>

              {/* Cancel Subscription */}
              {isSubscribed && <div className="pt-2" data-id="element-4169">
                  {!showCancelConfirm ? <button onClick={() => setShowCancelConfirm(true)} className="w-full text-center text-sm text-red-500 font-medium py-3 hover:bg-red-50 rounded-xl transition-colors" data-id="element-4170">
                      Cancel Subscription
                    </button> : <Card className="p-4 border-red-200 bg-red-50/50" data-id="element-4171">
                      <p className="font-bold text-red-600 text-sm mb-1" data-id="element-4172">
                        Cancel subscription?
                      </p>
                      <p className="text-xs text-gray-500 mb-4" data-id="element-4173">
                        You'll lose access to Pro features at the end of your
                        billing period (Oct 24, 2025).
                      </p>
                      <div className="flex gap-3" data-id="element-4174">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCancelConfirm(false)} data-id="element-4175">
                          Keep Plan
                        </Button>
                        <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => {
                  setIsSubscribed(false);
                  setShowCancelConfirm(false);
                }} data-id="element-4176">
                          Cancel
                        </Button>
                      </div>
                    </Card>}
                </div>}

              {/* Show cancel for free users too - but different message */}
              {!isSubscribed && <button onClick={() => setShowSubscribeFlow(true)} className="w-full text-center text-sm text-trustopay-purple font-medium py-3 hover:bg-purple-50 rounded-xl transition-colors" data-id="element-4177">
                  Upgrade to Pro →
                </button>}
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Help Centre Overlay */}
      <AnimatePresence data-id="element-4178">
        {showHelpCentre && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4179">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4180">
              <button onClick={() => setShowHelpCentre(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4181">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4182" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4183">
                Help Centre
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5" data-id="element-4184">
              {/* Search */}
              <div className="relative" data-id="element-4185">
                <input type="text" placeholder="Search for help..." className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:bg-white transition-colors" data-id="element-4186" />
                <HelpCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" data-id="element-4187" />
              </div>

              {/* FAQ Categories */}
              <div data-id="element-4188">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-4189">
                  Popular Topics
                </p>
                <div className="space-y-2" data-id="element-4190">
                  {[{
                title: 'Getting Started',
                desc: 'How to create your first invoice',
                icon: '🚀'
              }, {
                title: 'Payments & Wallet',
                desc: 'Add money, withdraw, and payment issues',
                icon: '💰'
              }, {
                title: 'Invoice Management',
                desc: 'Edit, delete, and resend invoices',
                icon: '📄'
              }, {
                title: 'GST & Tax',
                desc: 'Setting up GST and tax calculations',
                icon: '🧾'
              }, {
                title: 'Subscription & Billing',
                desc: 'Plan details, upgrades, and cancellation',
                icon: '👑'
              }, {
                title: 'Account & Security',
                desc: 'Profile, password, and privacy settings',
                icon: '🔒'
              }].map(topic => <button key={topic.title} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors" data-id="element-4191">
                      <span className="text-xl" data-id="element-4192">{topic.icon}</span>
                      <div className="flex-1" data-id="element-4193">
                        <p className="font-medium text-trustopay-navy text-sm" data-id="element-4194">
                          {topic.title}
                        </p>
                        <p className="text-[11px] text-gray-500" data-id="element-4195">
                          {topic.desc}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" data-id="element-4196" />
                    </button>)}
                </div>
              </div>

              {/* Contact Support */}
              <div data-id="element-4197">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-4198">
                  Still need help?
                </p>
                <Card className="p-4 space-y-3" data-id="element-4199">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-purple-50 transition-colors text-left" data-id="element-4200">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center" data-id="element-4201">
                      <MessageSquare size={18} className="text-trustopay-purple" data-id="element-4202" />
                    </div>
                    <div data-id="element-4203">
                      <p className="font-medium text-trustopay-navy text-sm" data-id="element-4204">
                        Chat with us
                      </p>
                      <p className="text-[10px] text-gray-400" data-id="element-4205">
                        Usually replies within 5 mins
                      </p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 transition-colors text-left" data-id="element-4206">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center" data-id="element-4207">
                      <Mail size={18} className="text-blue-600" data-id="element-4208" />
                    </div>
                    <div data-id="element-4209">
                      <p className="font-medium text-trustopay-navy text-sm" data-id="element-4210">
                        Email support
                      </p>
                      <p className="text-[10px] text-gray-400" data-id="element-4211">
                        support@trustopay.in
                      </p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-green-50 transition-colors text-left" data-id="element-4212">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center" data-id="element-4213">
                      <Phone size={18} className="text-green-600" data-id="element-4214" />
                    </div>
                    <div data-id="element-4215">
                      <p className="font-medium text-trustopay-navy text-sm" data-id="element-4216">
                        Call us
                      </p>
                      <p className="text-[10px] text-gray-400" data-id="element-4217">
                        Mon-Sat, 9 AM - 7 PM
                      </p>
                    </div>
                  </button>
                </Card>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Message Centre Overlay */}
      <AnimatePresence data-id="element-4218">
        {showMessageCentre && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-4219">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-4220">
              <button onClick={() => setShowMessageCentre(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-4221">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-4222" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-4223">
                Message Centre
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4" data-id="element-4224">
              {[{
            title: 'Welcome to Trustopay! 🎉',
            preview: "Thanks for joining. Here's how to get started with your first invoice...",
            time: '2 days ago',
            read: true,
            icon: Crown,
            iconBg: 'bg-purple-100',
            iconColor: 'text-trustopay-purple'
          }, {
            title: 'Payment Received',
            preview: '₹25,000 received from Creative Studio for INV-002. Funds added to wallet.',
            time: 'Yesterday',
            read: true,
            icon: ArrowDownLeft,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
          }, {
            title: 'Invoice Overdue Reminder',
            preview: 'INV-003 for Global Services (₹5,000) is overdue. Send a reminder?',
            time: '5 hours ago',
            read: false,
            icon: FileText,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
          }, {
            title: 'Pro Plan Activated ✨',
            preview: 'Your yearly subscription is now active. Enjoy unlimited invoices and premium features.',
            time: '3 days ago',
            read: true,
            icon: Crown,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
          }, {
            title: 'New Feature: Recurring Invoices',
            preview: 'You can now set up recurring invoices for regular clients. Try it out!',
            time: '1 week ago',
            read: true,
            icon: MessageSquare,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
          }].map((msg, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: i * 0.05
          }} data-id="element-4225">
                  <button className="w-full text-left p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors relative" data-id="element-4226">
                    {!msg.read && <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-trustopay-purple" data-id="element-4227" />}
                    <div className="flex gap-3" data-id="element-4228">
                      <div className={`w-10 h-10 rounded-full ${msg.iconBg} flex items-center justify-center flex-shrink-0`} data-id="element-4229">
                        <msg.icon size={18} className={msg.iconColor} data-id="element-4230" />
                      </div>
                      <div className="flex-1 min-w-0" data-id="element-4231">
                        <p className={cn('text-sm truncate', !msg.read ? 'font-bold text-trustopay-navy' : 'font-medium text-trustopay-navy')} data-id="element-4232">
                          {msg.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2" data-id="element-4233">
                          {msg.preview}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5" data-id="element-4234">
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}