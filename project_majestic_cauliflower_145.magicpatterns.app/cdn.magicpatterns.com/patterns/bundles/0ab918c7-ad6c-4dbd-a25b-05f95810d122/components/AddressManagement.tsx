import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Home, Building2, Package, Star, Edit2, Trash2, MapPin, Check, AlertCircle, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
interface Address {
  id: string;
  type: 'home' | 'business' | 'billing';
  businessType: 'individual' | 'sole_prop' | 'partnership' | 'pvt_ltd' | 'public_ltd' | 'other';
  isDefault: boolean;
  fullName: string;
  professionalTitle?: string;
  phone: string;
  email?: string;
  website?: string;
  building: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin?: string;
  pan?: string;
  cin?: string;
}
interface AddressManagementProps {
  isOpen: boolean;
  onClose: () => void;
}
const INITIAL_ADDRESSES: Address[] = [{
  id: '1',
  type: 'home',
  businessType: 'individual',
  isDefault: true,
  fullName: 'Ankit Shah',
  professionalTitle: 'Graphic Designer',
  phone: '+91 98765 43210',
  email: 'ankit@trustopay.com',
  building: '123, Sahajanand Apartments',
  street: 'Near Railway Station, Alkapuri',
  city: 'Vadodara',
  state: 'Gujarat',
  pincode: '390007',
  country: 'India',
  pan: 'ABCDE1234F'
}, {
  id: '2',
  type: 'business',
  businessType: 'pvt_ltd',
  isDefault: false,
  fullName: 'Trustopay Innovations Pvt Ltd',
  phone: '+91 80 1234 5678',
  email: 'info@trustopay.com',
  website: 'https://trustopay.com',
  building: 'Office 301, Tech Park',
  street: 'HSR Layout',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560102',
  country: 'India',
  gstin: '29ABCDE1234F1Z5',
  cin: 'U72900KA2020PTC123456'
}];
const INDIAN_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli', 'Lakshadweep'];
const BUSINESS_TYPES = [{
  id: 'individual',
  label: 'Individual / Freelancer',
  desc: 'No registration needed'
}, {
  id: 'sole_prop',
  label: 'Sole Proprietorship',
  desc: 'Business under your name'
}, {
  id: 'partnership',
  label: 'Partnership / LLP',
  desc: 'Multiple partners'
}, {
  id: 'pvt_ltd',
  label: 'Private Limited',
  desc: 'Registered company'
}, {
  id: 'public_ltd',
  label: 'Public Limited',
  desc: 'Listed company'
}, {
  id: 'other',
  label: 'Other',
  desc: 'NGO, Trust, etc.'
}];
export function AddressManagement({
  isOpen,
  onClose
}: AddressManagementProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  // Form State
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    businessType: 'individual',
    country: 'India'
  });
  const [showGstSection, setShowGstSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [noGst, setNoGst] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resetForm = () => {
    setFormData({
      type: 'home',
      businessType: 'individual',
      country: 'India',
      fullName: 'Ankit Shah',
      phone: '+91 98765 43210',
      email: 'ankit@trustopay.com'
    });
    setEditingId(null);
    setErrors({});
    setShowGstSection(false);
    setShowPreview(false);
    setNoGst(false);
  };
  const handleAddNew = () => {
    resetForm();
    setView('form');
  };
  const handleEdit = (address: Address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowGstSection(!!address.gstin || !!address.pan || !!address.cin);
    setView('form');
  };
  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    setShowToast({
      type: 'success',
      message: 'Address deleted'
    });
    setTimeout(() => setShowToast(null), 2000);
  };
  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    setShowToast({
      type: 'success',
      message: 'Default address updated'
    });
    setTimeout(() => setShowToast(null), 2000);
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.building?.trim()) newErrors.building = 'Building details required';
    if (!formData.street?.trim()) newErrors.street = 'Street/Area required';
    if (!formData.city?.trim()) newErrors.city = 'City required';
    if (!formData.state?.trim()) newErrors.state = 'State required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'PIN Code required';else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid PIN Code';
    if (formData.gstin && formData.gstin.length !== 15) newErrors.gstin = 'GSTIN must be 15 chars';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (!validateForm()) {
      setShowToast({
        type: 'error',
        message: 'Please fix errors'
      });
      setTimeout(() => setShowToast(null), 2000);
      return;
    }
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      const newAddress = {
        ...formData,
        id: editingId || Date.now().toString(),
        isDefault: formData.isDefault || addresses.length === 0 // First address is always default
      } as Address;
      if (newAddress.isDefault) {
        // Unset other defaults
        setAddresses(prev => prev.map(a => ({
          ...a,
          isDefault: false
        })));
        setAddresses(prev => editingId ? prev.map(a => a.id === editingId ? newAddress : {
          ...a,
          isDefault: false
        }) : [...prev.map(a => ({
          ...a,
          isDefault: false
        })), newAddress]);
      } else {
        setAddresses(prev => editingId ? prev.map(a => a.id === editingId ? newAddress : a) : [...prev, newAddress]);
      }
      setIsSaving(false);
      setShowToast({
        type: 'success',
        message: 'Address saved successfully!'
      });
      setTimeout(() => {
        setShowToast(null);
        setView('list');
      }, 1500);
    }, 1000);
  };
  const handleUseLocation = () => {
    // Mock location detection
    setFormData(prev => ({
      ...prev,
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390007',
      country: 'India'
    }));
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-73">
      {/* Toast */}
      <AnimatePresence data-id="element-74">
        {showToast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-75">
            {showToast.type === 'success' ? <Check size={16} data-id="element-76" /> : <AlertCircle size={16} data-id="element-77" />}
            {showToast.message}
          </motion.div>}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between" data-id="element-78">
        <div className="flex items-center gap-3" data-id="element-79">
          <button onClick={view === 'form' ? () => setView('list') : onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-80">
            <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-81" />
          </button>
          <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-82">
            {view === 'list' ? 'My Addresses' : editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
        </div>
        {view === 'list' ? <Button size="sm" className="px-3 h-9" onClick={handleAddNew} data-id="element-83">
            <Plus size={16} className="mr-1" data-id="element-84" /> Add New
          </Button> : <Button size="sm" className="px-4 h-9" onClick={handleSave} disabled={isSaving} data-id="element-85">
            {isSaving ? <Loader2 size={16} className="animate-spin" data-id="element-86" /> : 'Save'}
          </Button>}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32" data-id="element-87">
        <AnimatePresence mode="wait" data-id="element-88">
          {view === 'list' ? <motion.div key="list" initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="space-y-4" data-id="element-89">
              {addresses.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" data-id="element-90">
                  <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-trustopay-purple mb-2" data-id="element-91">
                    <MapPin size={32} data-id="element-92" />
                  </div>
                  <h3 className="text-xl font-bold text-trustopay-navy" data-id="element-93">
                    Add Your First Address
                  </h3>
                  <p className="text-gray-500 max-w-[260px]" data-id="element-94">
                    Required for sending and receiving invoices and payments.
                  </p>
                  <Button onClick={handleAddNew} className="mt-4" data-id="element-95">
                    Add Address
                  </Button>
                </div> : addresses.map(addr => <Card key={addr.id} className={cn('p-4 relative overflow-hidden transition-all', addr.isDefault ? 'border-trustopay-purple bg-purple-50/30' : 'hover:shadow-md')} data-id="element-96">
                    <div className="flex justify-between items-start mb-3" data-id="element-97">
                      <div className="flex items-center gap-2" data-id="element-98">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', addr.type === 'home' ? 'bg-blue-100 text-blue-600' : addr.type === 'business' ? 'bg-purple-100 text-trustopay-purple' : 'bg-orange-100 text-orange-600')} data-id="element-99">
                          {addr.type === 'home' ? <Home size={16} data-id="element-100" /> : addr.type === 'business' ? <Building2 size={16} data-id="element-101" /> : <Package size={16} data-id="element-102" />}
                        </div>
                        <div data-id="element-103">
                          <span className="font-bold text-trustopay-navy capitalize text-sm" data-id="element-104">
                            {addr.type} Address
                          </span>
                          <p className="text-[10px] text-gray-400 capitalize" data-id="element-105">
                            {BUSINESS_TYPES.find(b => b.id === addr.businessType)?.label || 'Individual'}
                          </p>
                        </div>
                        {addr.isDefault && <span className="bg-trustopay-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" data-id="element-106">
                            <Star size={8} fill="currentColor" data-id="element-107" /> Default
                          </span>}
                      </div>
                    </div>

                    <div className="space-y-1 mb-4 pl-1" data-id="element-108">
                      <p className="font-bold text-trustopay-navy text-sm" data-id="element-109">
                        {addr.fullName}
                      </p>
                      {addr.professionalTitle && <p className="text-xs text-gray-500" data-id="element-110">
                          {addr.professionalTitle}
                        </p>}
                      <p className="text-sm text-gray-600" data-id="element-111">{addr.building}</p>
                      <p className="text-sm text-gray-600" data-id="element-112">{addr.street}</p>
                      <p className="text-sm text-gray-600" data-id="element-113">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-gray-600" data-id="element-114">{addr.country}</p>
                      <p className="text-sm text-gray-600 mt-1" data-id="element-115">{addr.phone}</p>
                      {addr.email && <p className="text-xs text-gray-500" data-id="element-116">{addr.email}</p>}

                      <div className="flex flex-wrap gap-1.5 mt-2" data-id="element-117">
                        {addr.gstin && <span className="text-[10px] font-medium text-trustopay-purple bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1" data-id="element-118">
                            GSTIN: {addr.gstin} <Check size={10} data-id="element-119" />
                          </span>}
                        {!addr.gstin && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded" data-id="element-120">
                            GST: Not Registered
                          </span>}
                        {addr.pan && <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded" data-id="element-121">
                            PAN: {addr.pan}
                          </span>}
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-gray-100 pt-3" data-id="element-122">
                      <button onClick={() => handleEdit(addr)} className="flex-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center gap-1" data-id="element-123">
                        <Edit2 size={12} data-id="element-124" /> Edit
                      </button>
                      <div className="w-px bg-gray-200" data-id="element-125" />
                      <button onClick={() => handleDelete(addr.id)} className="flex-1 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded flex items-center justify-center gap-1" data-id="element-126">
                        <Trash2 size={12} data-id="element-127" /> Delete
                      </button>
                      {!addr.isDefault && <>
                          <div className="w-px bg-gray-200" data-id="element-128" />
                          <button onClick={() => handleSetDefault(addr.id)} className="flex-1 py-1.5 text-xs font-medium text-trustopay-purple hover:bg-purple-50 rounded" data-id="element-129">
                            Set Default
                          </button>
                        </>}
                    </div>
                  </Card>)}
            </motion.div> : <motion.div key="form" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 20
        }} className="space-y-6" data-id="element-130">
              {/* Section 1: Business Type */}
              <div className="space-y-3" data-id="element-131">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-132">
                  Business Type *
                </p>
                <div className="space-y-2" data-id="element-133">
                  {BUSINESS_TYPES.map(bt => <button key={bt.id} onClick={() => setFormData({
                ...formData,
                businessType: bt.id as any
              })} className={cn('w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all', formData.businessType === bt.id ? 'border-trustopay-purple bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200')} data-id="element-134">
                      <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', formData.businessType === bt.id ? 'border-trustopay-purple' : 'border-gray-300')} data-id="element-135">
                        {formData.businessType === bt.id && <div className="w-2 h-2 rounded-full bg-trustopay-purple" data-id="element-136" />}
                      </div>
                      <div data-id="element-137">
                        <p className={cn('text-sm font-bold', formData.businessType === bt.id ? 'text-trustopay-purple' : 'text-trustopay-navy')} data-id="element-138">
                          {bt.label}
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-139">{bt.desc}</p>
                      </div>
                    </button>)}
                </div>
              </div>

              {/* Section 2: Address Type */}
              <div className="space-y-3" data-id="element-140">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-141">
                  Address Label *
                </p>
                <div className="grid grid-cols-3 gap-2" data-id="element-142">
                  {['home', 'business', 'billing'].map(type => <button key={type} onClick={() => setFormData({
                ...formData,
                type: type as any
              })} className={cn('flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all', formData.type === type ? 'border-trustopay-purple bg-purple-50 text-trustopay-purple' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200')} data-id="element-143">
                      {type === 'home' ? <Home size={20} className="mb-1" data-id="element-144" /> : type === 'business' ? <Building2 size={20} className="mb-1" data-id="element-145" /> : <Package size={20} className="mb-1" data-id="element-146" />}
                      <span className="text-xs font-bold capitalize" data-id="element-147">
                        {type}
                      </span>
                    </button>)}
                </div>
              </div>

              {/* Section 3: Basic Details */}
              <div className="space-y-4" data-id="element-148">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-149">
                  Basic Details
                </p>
                <Input label="Full Name / Company Name *" placeholder="Your name or registered business name" value={formData.fullName} onChange={e => setFormData({
              ...formData,
              fullName: e.target.value
            })} error={errors.fullName} data-id="element-150" />
                {(formData.businessType === 'individual' || formData.businessType === 'sole_prop') && <Input label="Professional Title (Optional)" placeholder="e.g., Graphic Designer, Consultant" value={formData.professionalTitle} onChange={e => setFormData({
              ...formData,
              professionalTitle: e.target.value
            })} data-id="element-151" />}
                <Input label="Phone Number *" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({
              ...formData,
              phone: e.target.value
            })} error={errors.phone} data-id="element-152" />
                <Input label="Email Address (Optional)" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} data-id="element-153" />
                <Input label="Website (Optional)" placeholder="https://yourwebsite.com" value={formData.website} onChange={e => setFormData({
              ...formData,
              website: e.target.value
            })} data-id="element-154" />
              </div>

              {/* Section 4: GST Details */}
              <div className="pt-2" data-id="element-155">
                <Card className="overflow-hidden border border-gray-200" data-id="element-156">
                  <button onClick={() => setShowGstSection(!showGstSection)} className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors" data-id="element-157">
                    <div className="flex flex-col items-start" data-id="element-158">
                      <div className="flex items-center gap-2" data-id="element-159">
                        <Info size={16} className="text-trustopay-purple" data-id="element-160" />
                        <span className="font-bold text-sm text-trustopay-navy" data-id="element-161">
                          Tax & Registration Details (Optional)
                        </span>
                        {showGstSection ? <ChevronUp size={16} data-id="element-162" /> : <ChevronDown size={16} data-id="element-163" />}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 text-left" data-id="element-164">
                        GST, PAN, CIN — only if applicable
                      </span>
                    </div>
                  </button>

                  <AnimatePresence data-id="element-165">
                    {showGstSection && <motion.div initial={{
                  height: 0
                }} animate={{
                  height: 'auto'
                }} exit={{
                  height: 0
                }} className="overflow-hidden bg-white" data-id="element-166">
                        <div className="p-4 space-y-4 border-t border-gray-100" data-id="element-167">
                          <div className="space-y-2" data-id="element-168">
                            <Input label="GSTIN Number" placeholder="29ABCDE1234F1Z5" value={formData.gstin} onChange={e => setFormData({
                        ...formData,
                        gstin: e.target.value.toUpperCase()
                      })} maxLength={15} disabled={noGst} error={errors.gstin} data-id="element-169" />
                            {formData.gstin && formData.gstin.length === 15 && <p className="text-[10px] text-green-600 flex items-center gap-1" data-id="element-170">
                                <Check size={10} data-id="element-171" /> Valid GSTIN format
                              </p>}
                            <label className="flex items-center gap-2 cursor-pointer" data-id="element-172">
                              <input type="checkbox" checked={noGst} onChange={e => {
                          setNoGst(e.target.checked);
                          if (e.target.checked) setFormData({
                            ...formData,
                            gstin: ''
                          });
                        }} className="rounded text-trustopay-purple focus:ring-trustopay-purple" data-id="element-173" />
                              <span className="text-xs text-gray-600" data-id="element-174">
                                I don't have GSTIN (Turnover &lt; ₹40L)
                              </span>
                            </label>
                          </div>

                          <Input label="PAN Card Number (Optional)" placeholder="ABCDE1234F" value={formData.pan} onChange={e => setFormData({
                      ...formData,
                      pan: e.target.value.toUpperCase()
                    })} maxLength={10} data-id="element-175" />
                          {formData.pan && formData.pan.length === 10 && <p className="text-[10px] text-green-600 flex items-center gap-1" data-id="element-176">
                              <Check size={10} data-id="element-177" /> Valid PAN format
                            </p>}

                          {(formData.businessType === 'pvt_ltd' || formData.businessType === 'public_ltd') && <Input label="Company Identification Number (CIN)" placeholder="U72900KA2020PTC123456" value={formData.cin} onChange={e => setFormData({
                      ...formData,
                      cin: e.target.value.toUpperCase()
                    })} maxLength={21} data-id="element-178" />}
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </Card>
              </div>

              {/* Section 5: Default */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200" data-id="element-179">
                <div data-id="element-180">
                  <p className="font-medium text-trustopay-navy" data-id="element-181">
                    Set as Default
                  </p>
                  <p className="text-xs text-gray-500" data-id="element-182">
                    Used automatically on new invoices
                  </p>
                </div>
                <button onClick={() => setFormData({
              ...formData,
              isDefault: !formData.isDefault
            })} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out', formData.isDefault ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-183">
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out', formData.isDefault ? 'translate-x-6' : 'translate-x-0')} data-id="element-184" />
                </button>
              </div>

              {/* Section 6: Invoice Preview */}
              <div className="pt-2" data-id="element-185">
                <Card className="overflow-hidden border border-gray-200" data-id="element-186">
                  <button onClick={() => setShowPreview(!showPreview)} className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors" data-id="element-187">
                    <div className="flex items-center gap-2" data-id="element-188">
                      <MapPin size={16} className="text-trustopay-purple" data-id="element-189" />
                      <span className="font-bold text-sm text-trustopay-navy" data-id="element-190">
                        Invoice Preview
                      </span>
                      {showPreview ? <ChevronUp size={16} data-id="element-191" /> : <ChevronDown size={16} data-id="element-192" />}
                    </div>
                  </button>
                  <AnimatePresence data-id="element-193">
                    {showPreview && <motion.div initial={{
                  height: 0
                }} animate={{
                  height: 'auto'
                }} exit={{
                  height: 0
                }} className="overflow-hidden" data-id="element-194">
                        <div className="p-4 border-t border-gray-100 bg-white" data-id="element-195">
                          <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-1" data-id="element-196">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-197">
                              FROM:
                            </p>
                            <p className="font-bold text-trustopay-navy" data-id="element-198">
                              {formData.fullName || 'Your Name'}
                            </p>
                            {formData.professionalTitle && <p className="text-gray-500" data-id="element-199">
                                {formData.professionalTitle}
                              </p>}
                            {formData.building && <p className="text-gray-600" data-id="element-200">
                                {formData.building}
                              </p>}
                            {formData.street && <p className="text-gray-600" data-id="element-201">{formData.street}</p>}
                            <p className="text-gray-600" data-id="element-202">
                              {[formData.city, formData.state].filter(Boolean).join(', ')}
                              {formData.pincode ? ` - ${formData.pincode}` : ''}
                            </p>
                            {formData.country && <p className="text-gray-600" data-id="element-203">
                                {formData.country}
                              </p>}
                            {formData.phone && <p className="text-gray-600" data-id="element-204">{formData.phone}</p>}
                            {formData.email && <p className="text-gray-500" data-id="element-205">{formData.email}</p>}
                            <div className="pt-2 mt-2 border-t border-gray-200 space-y-0.5" data-id="element-206">
                              {formData.gstin ? <p className="text-trustopay-purple font-medium" data-id="element-207">
                                  GSTIN: {formData.gstin}
                                </p> : <p className="text-gray-400" data-id="element-208">
                                  GST: Not Registered (Turnover &lt; ₹40 Lakhs)
                                </p>}
                              {formData.pan && <p className="text-gray-600" data-id="element-209">
                                  PAN: {formData.pan}
                                </p>}
                              {formData.cin && <p className="text-gray-600" data-id="element-210">
                                  CIN: {formData.cin}
                                </p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </Card>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Footer Action (only for form view) */}
      {view === 'form' && <div className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 z-20" data-id="element-211">
          <div className="flex gap-3" data-id="element-212">
            <Button variant="outline" className="flex-1" onClick={() => setView('list')} data-id="element-213">
              Cancel
            </Button>
            <Button className="flex-[2]" onClick={handleSave} disabled={isSaving} data-id="element-214">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-215" /> : 'Save Address'}
            </Button>
          </div>
        </div>}
    </div>;
}