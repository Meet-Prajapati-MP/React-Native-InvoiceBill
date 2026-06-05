import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Building2, ChevronDown, ChevronUp, Upload, Image as ImageIcon, MapPin, Landmark, Check, AlertCircle, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { formatINR } from '../lib/utils';
interface BusinessProfileProps {
  isOpen: boolean;
  onClose: () => void;
}
export function BusinessProfile({
  isOpen,
  onClose
}: BusinessProfileProps) {
  const [accountType, setAccountType] = useState<'individual' | 'business' | null>(null);
  const [showLogoSection, setShowLogoSection] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  // Form State
  const [formData, setFormData] = useState({
    fullName: 'Ankit Shah',
    professionalTitle: '',
    pan: '',
    companyName: '',
    role: 'Owner',
    businessType: '',
    industry: '',
    registrationNumber: '',
    gstin: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    accountHolder: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: '',
    branchName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Validation Logic
  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required';
        break;
      case 'companyName':
        if (accountType === 'business' && !value.trim()) error = 'Company Name is required';
        break;
      case 'pan':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) error = 'Invalid PAN format (e.g., ABCDE1234F)';
        break;
      case 'gstin':
        if (value && value.length !== 15) error = 'GSTIN must be 15 characters';
        break;
      case 'pincode':
        if (value && !/^\d{6}$/.test(value)) error = 'PIN Code must be 6 digits';
        break;
      case 'ifsc':
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = 'Invalid IFSC format (e.g., SBIN0001234)';
        break;
      case 'accountNumber':
        if (value && !/^\d{9,18}$/.test(value)) error = 'Account Number must be 9-18 digits';
        break;
      case 'confirmAccountNumber':
        if (value !== formData.accountNumber) error = 'Account numbers do not match';
        break;
      case 'addressLine1':
        if (!value.trim()) error = 'Address Line 1 is required';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
    }
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return error;
  };
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    // Auto-format uppercase for PAN, IFSC, GSTIN
    if (['pan', 'ifsc', 'gstin'].includes(field)) {
      formattedValue = value.toUpperCase();
    }
    // Numeric only for Pincode, Account Number
    if (['pincode', 'accountNumber', 'confirmAccountNumber'].includes(field)) {
      formattedValue = value.replace(/\D/g, '');
    }
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    // Validate on change (or blur, but change is more responsive for some fields)
    if (errors[field]) {
      validateField(field, formattedValue);
    }
    // Auto-fill Bank Name based on IFSC (Mock)
    if (field === 'ifsc' && formattedValue.length === 11) {
      if (formattedValue.startsWith('SBIN')) {
        setFormData(prev => ({
          ...prev,
          bankName: 'State Bank of India',
          branchName: 'Main Branch'
        }));
      } else if (formattedValue.startsWith('HDFC')) {
        setFormData(prev => ({
          ...prev,
          bankName: 'HDFC Bank',
          branchName: 'City Branch'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          bankName: 'Bank Name Found',
          branchName: 'Branch Found'
        }));
      }
    }
  };
  const handleBlur = (field: string) => {
    validateField(field, (formData as any)[field]);
  };
  const isFormValid = () => {
    const requiredFields = accountType === 'individual' ? ['fullName', 'addressLine1', 'city', 'state', 'pincode'] : ['companyName', 'fullName', 'addressLine1', 'city', 'state', 'pincode'];
    // Check required fields
    for (const field of requiredFields) {
      if (!(formData as any)[field]) return false;
    }
    // Check existing errors
    for (const key in errors) {
      if (errors[key]) return false;
    }
    return true;
  };
  const handleSave = () => {
    if (!isFormValid()) {
      setShowToast({
        type: 'error',
        message: 'Please fix errors before saving.'
      });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast({
        type: 'success',
        message: 'Business profile updated! ✓'
      });
      setTimeout(() => {
        setShowToast(null);
        onClose();
      }, 2000);
    }, 1500);
  };
  const handleLogoUpload = () => {
    // Mock upload
    setLogo('https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=7C3AED&textColor=ffffff');
  };
  const handleUseCurrentLocation = () => {
    // Mock location
    setFormData(prev => ({
      ...prev,
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390001',
      country: 'India'
    }));
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-223">
      {/* Toast Notification */}
      <AnimatePresence data-id="element-224">
        {showToast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-225">
            {showToast.type === 'success' ? <Check size={16} data-id="element-226" /> : <AlertCircle size={16} data-id="element-227" />}
            {showToast.message}
          </motion.div>}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center gap-3" data-id="element-228">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-229">
          <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-230" />
        </button>
        <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-231">
          Business Profile
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32" data-id="element-232">
        {/* Account Type Selection */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm" data-id="element-233">
          <p className="text-base font-semibold text-trustopay-navy mb-4" data-id="element-234">
            I am a:
          </p>
          <div className="space-y-4" data-id="element-235">
            <label className="flex items-center gap-4 cursor-pointer group" data-id="element-236">
              <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', accountType === 'individual' ? 'border-trustopay-purple bg-trustopay-purple' : 'border-gray-300 group-hover:border-gray-400')} data-id="element-237">
                {accountType === 'individual' && <div className="w-2.5 h-2.5 bg-white rounded-full" data-id="element-238" />}
              </div>
              <input type="radio" name="accountType" className="hidden" checked={accountType === 'individual'} onChange={() => setAccountType('individual')} data-id="element-239" />
              <span className={cn('text-base', accountType === 'individual' ? 'text-trustopay-navy font-medium' : 'text-gray-600')} data-id="element-240">
                Individual / Freelancer
              </span>
            </label>

            <label className="flex items-center gap-4 cursor-pointer group" data-id="element-241">
              <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', accountType === 'business' ? 'border-trustopay-purple bg-trustopay-purple' : 'border-gray-300 group-hover:border-gray-400')} data-id="element-242">
                {accountType === 'business' && <div className="w-2.5 h-2.5 bg-white rounded-full" data-id="element-243" />}
              </div>
              <input type="radio" name="accountType" className="hidden" checked={accountType === 'business'} onChange={() => setAccountType('business')} data-id="element-244" />
              <span className={cn('text-base', accountType === 'business' ? 'text-trustopay-navy font-medium' : 'text-gray-600')} data-id="element-245">
                Company / Business
              </span>
            </label>
          </div>
        </div>

        {/* Basic Information */}
        {accountType && <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-5" data-id="element-246">
            {/* Form Fields */}
            {accountType === 'individual' ? <>
                <Input label="Full Name *" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} onBlur={() => handleBlur('fullName')} error={errors.fullName} placeholder="Enter your full name" data-id="element-247" />
                <div data-id="element-248">
                  <Input label="Professional Title" placeholder="e.g., Freelance Designer, Consultant" value={formData.professionalTitle} onChange={e => handleInputChange('professionalTitle', e.target.value)} data-id="element-249" />
                  <p className="text-xs text-gray-500 mt-1 italic" data-id="element-250">
                    This appears on your invoices
                  </p>
                </div>
                <div data-id="element-251">
                  <Input label="PAN Card Number" placeholder="ABCDE1234F" value={formData.pan} onChange={e => handleInputChange('pan', e.target.value)} onBlur={() => handleBlur('pan')} error={errors.pan} className="uppercase" maxLength={10} data-id="element-252" />
                  <p className="text-xs text-gray-500 mt-1 italic" data-id="element-253">
                    Optional - Add now or verify later
                  </p>
                </div>
              </> : <>
                <Input label="Company/Business Name *" placeholder="Enter your company name" value={formData.companyName} onChange={e => handleInputChange('companyName', e.target.value)} onBlur={() => handleBlur('companyName')} error={errors.companyName} data-id="element-254" />
                <Input label="Your Name *" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} onBlur={() => handleBlur('fullName')} error={errors.fullName} data-id="element-255" />

                <div className="space-y-1.5" data-id="element-256">
                  <label className="block text-sm font-semibold text-black" data-id="element-257">
                    Your Role
                  </label>
                  <div className="relative" data-id="element-258">
                    <select className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none" value={formData.role} onChange={e => handleInputChange('role', e.target.value)} data-id="element-259">
                      <option value="Owner" data-id="element-260">Owner</option>
                      <option value="Director" data-id="element-261">Director</option>
                      <option value="Manager" data-id="element-262">Manager</option>
                      <option value="Accountant" data-id="element-263">Accountant</option>
                      <option value="Finance Manager" data-id="element-264">Finance Manager</option>
                      <option value="Other" data-id="element-265">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-266" />
                  </div>
                </div>

                <div className="space-y-1.5" data-id="element-267">
                  <label className="block text-sm font-semibold text-black" data-id="element-268">
                    Business Type
                  </label>
                  <div className="relative" data-id="element-269">
                    <select className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none" value={formData.businessType} onChange={e => handleInputChange('businessType', e.target.value)} data-id="element-270">
                      <option value="" data-id="element-271">Select Type</option>
                      <option value="Sole Proprietorship" data-id="element-272">
                        Sole Proprietorship
                      </option>
                      <option value="Partnership" data-id="element-273">Partnership</option>
                      <option value="Private Limited (Pvt Ltd)" data-id="element-274">
                        Private Limited (Pvt Ltd)
                      </option>
                      <option value="Limited Liability Partnership (LLP)" data-id="element-275">
                        Limited Liability Partnership (LLP)
                      </option>
                      <option value="Public Limited" data-id="element-276">Public Limited</option>
                      <option value="One Person Company (OPC)" data-id="element-277">
                        One Person Company (OPC)
                      </option>
                      <option value="Other" data-id="element-278">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-279" />
                  </div>
                </div>

                <div className="space-y-1.5" data-id="element-280">
                  <label className="block text-sm font-semibold text-black" data-id="element-281">
                    Industry
                  </label>
                  <div className="relative" data-id="element-282">
                    <select className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none" value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} data-id="element-283">
                      <option value="" data-id="element-284">Select Industry</option>
                      <option value="Technology / IT Services" data-id="element-285">
                        Technology / IT Services
                      </option>
                      <option value="Design & Creative" data-id="element-286">
                        Design & Creative
                      </option>
                      <option value="Marketing & Advertising" data-id="element-287">
                        Marketing & Advertising
                      </option>
                      <option value="Consulting" data-id="element-288">Consulting</option>
                      <option value="Manufacturing" data-id="element-289">Manufacturing</option>
                      <option value="Retail & E-commerce" data-id="element-290">
                        Retail & E-commerce
                      </option>
                      <option value="Real Estate" data-id="element-291">Real Estate</option>
                      <option value="Healthcare" data-id="element-292">Healthcare</option>
                      <option value="Education" data-id="element-293">Education</option>
                      <option value="Financial Services" data-id="element-294">
                        Financial Services
                      </option>
                      <option value="Legal Services" data-id="element-295">Legal Services</option>
                      <option value="Construction" data-id="element-296">Construction</option>
                      <option value="Hospitality" data-id="element-297">Hospitality</option>
                      <option value="Entertainment" data-id="element-298">Entertainment</option>
                      <option value="Other" data-id="element-299">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-300" />
                  </div>
                </div>

                <div data-id="element-301">
                  <Input label="Company Registration Number" placeholder="CIN/Registration Number" value={formData.registrationNumber} onChange={e => handleInputChange('registrationNumber', e.target.value)} data-id="element-302" />
                  <p className="text-xs text-gray-500 mt-1 italic" data-id="element-303">
                    Optional - Add now or later
                  </p>
                </div>

                <div data-id="element-304">
                  <Input label="GSTIN (GST Number)" placeholder="24ABCDE1234F1Z5" value={formData.gstin} onChange={e => handleInputChange('gstin', e.target.value)} onBlur={() => handleBlur('gstin')} error={errors.gstin} className="uppercase" maxLength={15} data-id="element-305" />
                  <p className="text-xs text-gray-500 mt-1 italic" data-id="element-306">
                    Optional - We'll help you verify this later
                  </p>
                </div>

                <Input label="Company PAN Card" placeholder="ABCDE1234F" value={formData.pan} onChange={e => handleInputChange('pan', e.target.value)} onBlur={() => handleBlur('pan')} error={errors.pan} className="uppercase" maxLength={10} data-id="element-307" />
              </>}

            {/* Logo Section - Only for Business */}
            {accountType === 'business' && <div className="pt-8" data-id="element-308">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4" data-id="element-309">
                  BRANDING
                </p>
                <Card className="p-4" data-id="element-310">
                  <div className="flex items-center justify-between mb-4" data-id="element-311">
                    <p className="font-bold text-trustopay-navy text-sm" data-id="element-312">
                      Show logo on invoices?
                    </p>
                    <button onClick={() => setShowLogoSection(!showLogoSection)} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center', showLogoSection ? 'bg-trustopay-purple justify-end' : 'bg-gray-200 justify-start')} data-id="element-313">
                      <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" data-id="element-314" />
                    </button>
                  </div>

                  <AnimatePresence data-id="element-315">
                    {showLogoSection && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} className="overflow-hidden" data-id="element-316">
                        <div className="pt-4 border-t border-gray-100" data-id="element-317">
                          {logo ? <div className="space-y-4" data-id="element-318">
                              <div className="w-full h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4" data-id="element-319">
                                <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" data-id="element-320" />
                              </div>
                              <div className="grid grid-cols-2 gap-3" data-id="element-321">
                                <Button variant="outline" size="sm" onClick={handleLogoUpload} className="text-trustopay-purple border-trustopay-purple" data-id="element-322">
                                  Change Logo
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setLogo(null)} className="text-red-500 border-red-200 hover:bg-red-50" data-id="element-323">
                                  Remove Logo
                                </Button>
                              </div>
                            </div> : <button onClick={handleLogoUpload} className="w-full h-32 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors" data-id="element-324">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-trustopay-purple" data-id="element-325">
                                <Upload size={16} data-id="element-326" />
                              </div>
                              <span className="text-sm font-medium text-trustopay-purple" data-id="element-327">
                                Upload Logo
                              </span>
                              <span className="text-xs text-gray-400" data-id="element-328">
                                Recommended: 200x200px • Max 2MB
                              </span>
                            </button>}
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </Card>
              </div>}

            {/* Address Section */}
            <div className="pt-8 space-y-5" data-id="element-329">
              <div className="flex justify-between items-center" data-id="element-330">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider" data-id="element-331">
                  BUSINESS ADDRESS
                </p>
              </div>

              <Input label="Address Line 1 *" placeholder="Building No., Street Name" value={formData.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} onBlur={() => handleBlur('addressLine1')} error={errors.addressLine1} data-id="element-332" />
              <Input label="Address Line 2" placeholder="Area, Landmark" value={formData.addressLine2} onChange={e => handleInputChange('addressLine2', e.target.value)} data-id="element-333" />
              <Input label="City *" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} onBlur={() => handleBlur('city')} error={errors.city} data-id="element-334" />

              <div className="space-y-1.5" data-id="element-335">
                <label className="block text-sm font-semibold text-black" data-id="element-336">
                  State *
                </label>
                <div className="relative" data-id="element-337">
                  <select className={cn('flex h-12 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none', errors.state ? 'border-red-500' : 'border-gray-300')} value={formData.state} onChange={e => handleInputChange('state', e.target.value)} onBlur={() => handleBlur('state')} data-id="element-338">
                    <option value="" data-id="element-339">Select State</option>
                    <option value="Andhra Pradesh" data-id="element-340">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh" data-id="element-341">Arunachal Pradesh</option>
                    <option value="Assam" data-id="element-342">Assam</option>
                    <option value="Bihar" data-id="element-343">Bihar</option>
                    <option value="Chhattisgarh" data-id="element-344">Chhattisgarh</option>
                    <option value="Goa" data-id="element-345">Goa</option>
                    <option value="Gujarat" data-id="element-346">Gujarat</option>
                    <option value="Haryana" data-id="element-347">Haryana</option>
                    <option value="Himachal Pradesh" data-id="element-348">Himachal Pradesh</option>
                    <option value="Jharkhand" data-id="element-349">Jharkhand</option>
                    <option value="Karnataka" data-id="element-350">Karnataka</option>
                    <option value="Kerala" data-id="element-351">Kerala</option>
                    <option value="Madhya Pradesh" data-id="element-352">Madhya Pradesh</option>
                    <option value="Maharashtra" data-id="element-353">Maharashtra</option>
                    <option value="Manipur" data-id="element-354">Manipur</option>
                    <option value="Meghalaya" data-id="element-355">Meghalaya</option>
                    <option value="Mizoram" data-id="element-356">Mizoram</option>
                    <option value="Nagaland" data-id="element-357">Nagaland</option>
                    <option value="Odisha" data-id="element-358">Odisha</option>
                    <option value="Punjab" data-id="element-359">Punjab</option>
                    <option value="Rajasthan" data-id="element-360">Rajasthan</option>
                    <option value="Sikkim" data-id="element-361">Sikkim</option>
                    <option value="Tamil Nadu" data-id="element-362">Tamil Nadu</option>
                    <option value="Telangana" data-id="element-363">Telangana</option>
                    <option value="Tripura" data-id="element-364">Tripura</option>
                    <option value="Uttar Pradesh" data-id="element-365">Uttar Pradesh</option>
                    <option value="Uttarakhand" data-id="element-366">Uttarakhand</option>
                    <option value="West Bengal" data-id="element-367">West Bengal</option>
                    <option value="Delhi" data-id="element-368">Delhi</option>
                    <option value="Other Country" data-id="element-369">Other Country</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-370" />
                </div>
                {errors.state && <p className="mt-1 text-xs text-red-500" data-id="element-371">{errors.state}</p>}
              </div>

              <Input label="PIN Code *" value={formData.pincode} onChange={e => handleInputChange('pincode', e.target.value)} onBlur={() => handleBlur('pincode')} error={errors.pincode} maxLength={6} data-id="element-372" />

              <div className="space-y-1.5" data-id="element-373">
                <label className="block text-sm font-semibold text-black" data-id="element-374">
                  Country
                </label>
                <div className="relative" data-id="element-375">
                  <select className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} data-id="element-376">
                    <option value="India" data-id="element-377">India</option>
                    <option value="United States" data-id="element-378">United States</option>
                    <option value="United Kingdom" data-id="element-379">United Kingdom</option>
                    <option value="UAE" data-id="element-380">UAE</option>
                    <option value="Singapore" data-id="element-381">Singapore</option>
                    <option disabled data-id="element-382">──────────</option>
                    <option value="Other" data-id="element-383">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-384" />
                </div>
              </div>

              <Button variant="outline" className="w-full text-trustopay-purple border-trustopay-purple hover:bg-purple-50 gap-2" onClick={handleUseCurrentLocation} data-id="element-385">
                <MapPin size={16} data-id="element-386" /> Use Current Location
              </Button>
            </div>

            {/* Bank Details (Collapsible) */}
            <div className="pt-8" data-id="element-387">
              <Card className="overflow-hidden border border-gray-200" data-id="element-388">
                <button onClick={() => setShowBankDetails(!showBankDetails)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gray-50" data-id="element-389">
                  <div className="flex flex-col items-start" data-id="element-390">
                    <div className="flex items-center gap-2" data-id="element-391">
                      <span className="font-bold text-sm text-trustopay-navy" data-id="element-392">
                        Bank Details (Optional)
                      </span>
                      {showBankDetails ? <ChevronUp size={16} data-id="element-393" /> : <ChevronDown size={16} data-id="element-394" />}
                    </div>
                    <span className="text-xs text-gray-500 mt-1" data-id="element-395">
                      Add bank details for receiving payments
                    </span>
                  </div>
                </button>

                <AnimatePresence data-id="element-396">
                  {showBankDetails && <motion.div initial={{
                height: 0
              }} animate={{
                height: 'auto'
              }} exit={{
                height: 0
              }} className="overflow-hidden bg-white" data-id="element-397">
                      <div className="p-4 space-y-5 border-t border-gray-100" data-id="element-398">
                        <Input label="Account Holder Name" value={formData.accountHolder} onChange={e => handleInputChange('accountHolder', e.target.value)} data-id="element-399" />

                        <div className="relative" data-id="element-400">
                          <Input label="Account Number" type={showAccountNumber ? 'text' : 'password'} value={formData.accountNumber} onChange={e => handleInputChange('accountNumber', e.target.value)} onBlur={() => handleBlur('accountNumber')} error={errors.accountNumber} data-id="element-401" />
                          <button className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600" onClick={() => setShowAccountNumber(!showAccountNumber)} data-id="element-402">
                            {showAccountNumber ? <EyeOff size={18} data-id="element-403" /> : <Eye size={18} data-id="element-404" />}
                          </button>
                        </div>

                        <Input label="Confirm Account Number" value={formData.confirmAccountNumber} onChange={e => handleInputChange('confirmAccountNumber', e.target.value)} onBlur={() => handleBlur('confirmAccountNumber')} error={errors.confirmAccountNumber} data-id="element-405" />

                        <Input label="IFSC Code" value={formData.ifsc} onChange={e => handleInputChange('ifsc', e.target.value)} onBlur={() => handleBlur('ifsc')} error={errors.ifsc} className="uppercase" maxLength={11} data-id="element-406" />

                        <Input label="Bank Name" value={formData.bankName} disabled className="bg-gray-50 text-gray-500" data-id="element-407" />

                        <Input label="Branch Name" value={formData.branchName} onChange={e => handleInputChange('branchName', e.target.value)} data-id="element-408" />

                        <p className="text-xs text-gray-400 italic" data-id="element-409">
                          You can add this later when you want to receive
                          payments
                        </p>
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </Card>
            </div>

            {/* Invoice Preview */}
            <div className="pt-8 pb-4" data-id="element-410">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4" data-id="element-411">
                PREVIEW ON INVOICE
              </p>
              <button onClick={() => setShowFullPreview(true)} className="w-full text-left bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-trustopay-purple/30 transition-all group" data-id="element-412">
                <div className="flex justify-between items-start mb-6" data-id="element-413">
                  {accountType === 'business' && showLogoSection && logo ? <img src={logo} alt="Logo" className="h-12 w-auto object-contain" data-id="element-414" /> : accountType === 'business' ? <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400" data-id="element-415">
                      <ImageIcon size={24} data-id="element-416" />
                    </div> : null}
                  <div className={cn('text-right', accountType === 'individual' && 'ml-auto')} data-id="element-417">
                    <p className="text-sm font-bold text-gray-300" data-id="element-418">INVOICE</p>
                    <p className="text-xs text-gray-300" data-id="element-419">#INV-001</p>
                  </div>
                </div>

                <div className="space-y-1" data-id="element-420">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1" data-id="element-421">
                    From
                  </p>
                  <p className="text-base font-bold text-trustopay-navy" data-id="element-422">
                    {accountType === 'business' ? formData.companyName || 'Your Company Name' : formData.fullName || 'Your Name'}
                  </p>
                  <p className="text-sm text-gray-500" data-id="element-423">
                    {accountType === 'business' ? formData.fullName + (formData.role ? ` (${formData.role})` : '') : formData.professionalTitle || 'Freelancer'}
                  </p>
                  <p className="text-sm text-gray-500" data-id="element-424">
                    {formData.addressLine1 ? `${formData.addressLine1}, ` : ''}
                    {formData.city}
                    {formData.pincode ? ` - ${formData.pincode}` : ''}
                  </p>
                  {accountType === 'business' && formData.gstin && <p className="text-sm text-gray-500 mt-1" data-id="element-425">
                      GSTIN: {formData.gstin}
                    </p>}
                  {accountType === 'individual' && formData.pan && <p className="text-sm text-gray-500 mt-1" data-id="element-426">
                      PAN: {formData.pan}
                    </p>}
                </div>
                <p className="text-xs text-trustopay-purple font-medium mt-4 group-hover:underline flex items-center gap-1" data-id="element-427">
                  <Eye size={12} data-id="element-428" /> Tap to see full invoice preview
                </p>
              </button>
            </div>
          </motion.div>}
      </div>

      {/* Full Invoice Preview Overlay */}
      <AnimatePresence data-id="element-429">
        {showFullPreview && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-[70] bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-430">
            {/* Preview Header */}
            <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0" data-id="element-431">
              <div className="flex items-center gap-3" data-id="element-432">
                <button onClick={() => setShowFullPreview(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-433">
                  <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-434" />
                </button>
                <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-435">
                  Invoice Preview
                </h2>
              </div>
              <span className="text-[10px] font-bold text-trustopay-purple bg-purple-50 px-2 py-1 rounded-full" data-id="element-436">
                SAMPLE
              </span>
            </div>

            {/* Scrollable Invoice */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50" data-id="element-437">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" data-id="element-438">
                {/* Purple accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-trustopay-purple via-purple-400 to-trustopay-purple" data-id="element-439" />

                <div className="p-6" data-id="element-440">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8" data-id="element-441">
                    <div className="flex items-center gap-3" data-id="element-442">
                      {accountType === 'business' && showLogoSection && logo ? <img src={logo} alt="Logo" className="h-12 w-auto object-contain" data-id="element-443" /> : accountType === 'business' ? <div className="w-12 h-12 bg-trustopay-purple rounded-xl flex items-center justify-center" data-id="element-444">
                          <span className="text-white font-bold text-lg" data-id="element-445">
                            {(formData.companyName || 'C')[0].toUpperCase()}
                          </span>
                        </div> : <div className="w-12 h-12 bg-trustopay-navy rounded-xl flex items-center justify-center" data-id="element-446">
                          <span className="text-white font-bold text-lg" data-id="element-447">
                            {(formData.fullName || 'A')[0].toUpperCase()}
                          </span>
                        </div>}
                      <div data-id="element-448">
                        <p className="font-bold text-trustopay-navy text-sm" data-id="element-449">
                          {accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name'}
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-450">
                          {accountType === 'business' ? formData.fullName : formData.professionalTitle || 'Freelancer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right" data-id="element-451">
                      <h3 className="text-xl font-bold text-trustopay-navy tracking-tight" data-id="element-452">
                        INVOICE
                      </h3>
                      <p className="text-xs text-gray-400 font-medium" data-id="element-453">
                        #INV-001
                      </p>
                    </div>
                  </div>

                  {/* From / Bill To */}
                  <div className="grid grid-cols-2 gap-4 mb-6" data-id="element-454">
                    <div data-id="element-455">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5" data-id="element-456">
                        From
                      </p>
                      <p className="text-xs font-bold text-trustopay-navy" data-id="element-457">
                        {accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name'}
                      </p>
                      {accountType === 'business' && <p className="text-[11px] text-gray-500" data-id="element-458">
                          {formData.fullName}
                          {formData.role ? ` (${formData.role})` : ''}
                        </p>}
                      {accountType === 'individual' && formData.professionalTitle && <p className="text-[11px] text-gray-500" data-id="element-459">
                            {formData.professionalTitle}
                          </p>}
                      <p className="text-[11px] text-gray-500" data-id="element-460">
                        {formData.addressLine1 || '123, MG Road'}
                        {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-461">
                        {formData.city || 'Vadodara'},{' '}
                        {formData.state || 'Gujarat'} -{' '}
                        {formData.pincode || '390001'}
                      </p>
                      {accountType === 'business' && <p className="text-[11px] text-gray-500" data-id="element-462">
                          GSTIN: {formData.gstin || '24ABCDE1234F1Z5'}
                        </p>}
                      {accountType === 'individual' && <p className="text-[11px] text-gray-500" data-id="element-463">
                          PAN: {formData.pan || 'ABCDE1234F'}
                        </p>}
                    </div>
                    <div data-id="element-464">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5" data-id="element-465">
                        Bill To
                      </p>
                      <p className="text-xs font-bold text-trustopay-navy" data-id="element-466">
                        Priya Sharma
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-467">
                        Creative Studio Pvt Ltd
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-468">
                        45, Park Avenue
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-469">
                        Mumbai, Maharashtra - 400001
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-470">
                        GSTIN: 27BBBBB5678B1Z9
                      </p>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="grid grid-cols-3 gap-3 mb-6" data-id="element-471">
                    <div className="bg-gray-50 rounded-lg p-2.5" data-id="element-472">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-473">
                        Date
                      </p>
                      <p className="text-xs font-medium text-trustopay-navy mt-0.5" data-id="element-474">
                        Oct 25, 2024
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5" data-id="element-475">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-476">
                        Due Date
                      </p>
                      <p className="text-xs font-medium text-trustopay-navy mt-0.5" data-id="element-477">
                        Nov 10, 2024
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5" data-id="element-478">
                      <p className="text-[9px] font-bold text-trustopay-purple uppercase tracking-widest" data-id="element-479">
                        Status
                      </p>
                      <p className="text-xs font-bold text-trustopay-purple mt-0.5" data-id="element-480">
                        Unpaid
                      </p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-6" data-id="element-481">
                    <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 border-b border-gray-200" data-id="element-482">
                      <span className="col-span-5 text-[9px] font-bold text-gray-400 uppercase" data-id="element-483">
                        Item
                      </span>
                      <span className="col-span-2 text-[9px] font-bold text-gray-400 uppercase text-center" data-id="element-484">
                        Qty
                      </span>
                      <span className="col-span-2 text-[9px] font-bold text-gray-400 uppercase text-right" data-id="element-485">
                        Rate
                      </span>
                      <span className="col-span-3 text-[9px] font-bold text-gray-400 uppercase text-right" data-id="element-486">
                        Amount
                      </span>
                    </div>
                    {[{
                  item: 'Website Design',
                  desc: 'Full responsive website',
                  qty: 1,
                  rate: 45000
                }, {
                  item: 'Logo Design',
                  desc: 'Brand identity package',
                  qty: 1,
                  rate: 15000
                }, {
                  item: 'SEO Setup',
                  desc: 'On-page optimization',
                  qty: 1,
                  rate: 8000
                }].map((row, i) => <div key={i} className="grid grid-cols-12 px-3 py-2.5 border-b border-gray-100 last:border-none items-center" data-id="element-487">
                        <div className="col-span-5" data-id="element-488">
                          <p className="text-xs font-medium text-trustopay-navy" data-id="element-489">
                            {row.item}
                          </p>
                          <p className="text-[10px] text-gray-400" data-id="element-490">
                            {row.desc}
                          </p>
                        </div>
                        <span className="col-span-2 text-xs text-gray-600 text-center" data-id="element-491">
                          {row.qty}
                        </span>
                        <span className="col-span-2 text-xs text-gray-600 text-right" data-id="element-492">
                          {formatINR(row.rate)}
                        </span>
                        <span className="col-span-3 text-xs font-medium text-trustopay-navy text-right" data-id="element-493">
                          {formatINR(row.qty * row.rate)}
                        </span>
                      </div>)}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-6" data-id="element-494">
                    <div className="w-48 space-y-1.5" data-id="element-495">
                      <div className="flex justify-between text-xs" data-id="element-496">
                        <span className="text-gray-500" data-id="element-497">Subtotal</span>
                        <span className="text-trustopay-navy font-medium" data-id="element-498">
                          {formatINR(68000)}
                        </span>
                      </div>
                      {accountType === 'business' && <>
                          <div className="flex justify-between text-xs" data-id="element-499">
                            <span className="text-gray-500" data-id="element-500">CGST (9%)</span>
                            <span className="text-trustopay-navy" data-id="element-501">
                              {formatINR(6120)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs" data-id="element-502">
                            <span className="text-gray-500" data-id="element-503">SGST (9%)</span>
                            <span className="text-trustopay-navy" data-id="element-504">
                              {formatINR(6120)}
                            </span>
                          </div>
                        </>}
                      <div className="border-t border-gray-200 pt-1.5 flex justify-between" data-id="element-505">
                        <span className="text-sm font-bold text-trustopay-navy" data-id="element-506">
                          Total
                        </span>
                        <span className="text-sm font-bold text-trustopay-purple" data-id="element-507">
                          {formatINR(accountType === 'business' ? 80240 : 68000)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount in Words */}
                  <div className="bg-purple-50 rounded-lg p-3 mb-6" data-id="element-508">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-509">
                      Amount in Words
                    </p>
                    <p className="text-xs font-medium text-trustopay-navy" data-id="element-510">
                      {accountType === 'business' ? 'Eighty Thousand Two Hundred and Forty Rupees Only' : 'Sixty Eight Thousand Rupees Only'}
                    </p>
                  </div>

                  {/* Bank Details */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-6" data-id="element-511">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-512">
                      Bank Details
                    </p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4" data-id="element-513">
                      <div data-id="element-514">
                        <p className="text-[10px] text-gray-400" data-id="element-515">
                          Account Holder
                        </p>
                        <p className="text-xs font-medium text-trustopay-navy" data-id="element-516">
                          {formData.accountHolder || (accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name')}
                        </p>
                      </div>
                      <div data-id="element-517">
                        <p className="text-[10px] text-gray-400" data-id="element-518">Bank Name</p>
                        <p className="text-xs font-medium text-trustopay-navy" data-id="element-519">
                          {formData.bankName || 'HDFC Bank'}
                        </p>
                      </div>
                      <div data-id="element-520">
                        <p className="text-[10px] text-gray-400" data-id="element-521">
                          Account Number
                        </p>
                        <p className="text-xs font-medium text-trustopay-navy" data-id="element-522">
                          {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '****5678'}
                        </p>
                      </div>
                      <div data-id="element-523">
                        <p className="text-[10px] text-gray-400" data-id="element-524">IFSC Code</p>
                        <p className="text-xs font-medium text-trustopay-navy" data-id="element-525">
                          {formData.ifsc || 'HDFC0001234'}
                        </p>
                      </div>
                      {formData.branchName && <div data-id="element-526">
                          <p className="text-[10px] text-gray-400" data-id="element-527">Branch</p>
                          <p className="text-xs font-medium text-trustopay-navy" data-id="element-528">
                            {formData.branchName}
                          </p>
                        </div>}
                    </div>
                  </div>

                  {/* Notes & Terms */}
                  <div className="space-y-3 mb-4" data-id="element-529">
                    <div data-id="element-530">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1" data-id="element-531">
                        Notes
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-532">
                        Thank you for your business! Payment is due within 15
                        days of the invoice date.
                      </p>
                    </div>
                    <div data-id="element-533">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1" data-id="element-534">
                        Terms & Conditions
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-535">
                        1. Late payments may attract interest at 2% per month.
                      </p>
                      <p className="text-[11px] text-gray-500" data-id="element-536">
                        2. All disputes are subject to Vadodara jurisdiction.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-3" data-id="element-537">
                    <p className="text-[9px] text-gray-400 text-center" data-id="element-538">
                      Generated via Trustopay • trustopay.com
                    </p>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-trustopay-purple via-purple-400 to-trustopay-purple" data-id="element-539" />
              </div>

              {/* Demo notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2" data-id="element-540">
                <AlertCircle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" data-id="element-541" />
                <p className="text-[11px] text-yellow-700" data-id="element-542">
                  This is a sample invoice preview. Client details, line items,
                  and bank details shown are demo data. Your actual business
                  information from the form above is used in the "From" section.
                </p>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0" data-id="element-543">
              <Button className="w-full" onClick={() => setShowFullPreview(false)} data-id="element-544">
                Close Preview
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Sticky Footer */}
      <div className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 z-20" data-id="element-545">
        <Button className="w-full h-12 text-base font-bold shadow-md" onClick={handleSave} disabled={!accountType || isSaving} data-id="element-546">
          {isSaving ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-547" />
              Saving...
            </> : 'Save Business Profile'}
        </Button>
      </div>
    </div>;
}