import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, Edit2, Bell, MessageCircle, Mail, ChevronDown, ClipboardList } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { CustomersPage } from '../pages/CustomersPage';
import { formatINR, cn } from '../lib/utils';
interface CreateQuotationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CreateQuotationFlow({
  isOpen,
  onClose
}: CreateQuotationFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  // Quote Details
  const [quoteNumber, setQuoteNumber] = useState('QUO-007');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [includeGST, setIncludeGST] = useState(true);
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState([{
    id: 1,
    name: '',
    qty: 1,
    rate: 0
  }]);
  // Saved Items
  const [showSavedItems, setShowSavedItems] = useState(false);
  const savedItems = [{
    id: 1,
    name: 'Website Design',
    rate: 15000
  }, {
    id: 2,
    name: 'Logo Design',
    rate: 5000
  }, {
    id: 3,
    name: 'Consulting',
    rate: 8000
  }];
  // Delivery channels
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      name: '',
      qty: 1,
      rate: 0
    }]);
  };
  const addSavedItem = (savedItem: any) => {
    setItems([...items, {
      id: Date.now(),
      name: savedItem.name,
      qty: 1,
      rate: savedItem.rate
    }]);
    setShowSavedItems(false);
  };
  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };
  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? {
      ...i,
      [field]: value
    } : i));
  };
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountAmount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = includeGST ? taxableAmount * 0.18 : 0;
  const total = taxableAmount + tax;
  const handleNext = () => {
    if (step < 3) setStep(step + 1);else onClose();
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);else onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-575">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between bg-white" data-id="element-576">
        <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-577">
          <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-578" />
        </button>
        <div className="flex gap-2" data-id="element-579">
          {[1, 2, 3].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-trustopay-purple' : s < step ? 'bg-trustopay-purple/40' : 'bg-gray-200'}`} data-id="element-580" />)}
        </div>
        <div className="w-10" data-id="element-581" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50" data-id="element-582">
        <AnimatePresence mode="wait" data-id="element-583">
          {step === 1 && <motion.div key="step1" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="h-full" data-id="element-584">
              <CustomersPage mode="select" onSelectCustomer={c => {
            setSelectedCustomer(c);
            setStep(2);
          }} data-id="element-585" />
            </motion.div>}

          {step === 2 && <motion.div key="step2" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="p-5 space-y-5 pb-28" data-id="element-586">
              <div data-id="element-587">
                <h2 className="text-xl font-bold text-trustopay-navy mb-1" data-id="element-588">
                  New Quotation
                </h2>
                <p className="text-sm text-gray-500" data-id="element-589">
                  For {selectedCustomer?.name}
                </p>
              </div>

              {/* Quote Meta */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4" data-id="element-590">
                <Input label="Quote Number" value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} data-id="element-591" />
                <div className="flex gap-4" data-id="element-592">
                  <div className="flex-1" data-id="element-593">
                    <Input label="Quote Date" type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} data-id="element-594" />
                  </div>
                  <div className="flex-1" data-id="element-595">
                    <Input label="Valid Until" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} data-id="element-596" />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4" data-id="element-597">
                <div className="flex justify-between items-center" data-id="element-598">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-599">
                    Line Items
                  </p>
                  <div className="relative" data-id="element-600">
                    <button onClick={() => setShowSavedItems(!showSavedItems)} className="text-xs font-medium text-trustopay-purple flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors" data-id="element-601">
                      Saved Items <ChevronDown size={14} data-id="element-602" />
                    </button>
                    {showSavedItems && <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSavedItems(false)} data-id="element-603" />
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden" data-id="element-604">
                          {savedItems.map(item => <button key={item.id} onClick={() => addSavedItem(item)} className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 border-b border-gray-50 last:border-none" data-id="element-605">
                              <p className="font-medium" data-id="element-606">{item.name}</p>
                              <p className="text-xs text-gray-500" data-id="element-607">
                                {formatINR(item.rate)}
                              </p>
                            </button>)}
                        </div>
                      </>}
                  </div>
                </div>

                {items.map(item => <Card key={item.id} className="p-4 relative" data-id="element-608">
                    {items.length > 1 && <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" data-id="element-609">
                        <Trash2 size={16} data-id="element-610" />
                      </button>}
                    <div className="space-y-3" data-id="element-611">
                      <Input placeholder="Item name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="border-gray-200" data-id="element-612" />
                      <div className="flex gap-3" data-id="element-613">
                        <div className="w-24" data-id="element-614">
                          <Input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} data-id="element-615" />
                        </div>
                        <div className="flex-1" data-id="element-616">
                          <Input type="number" placeholder="Rate (₹)" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} data-id="element-617" />
                        </div>
                      </div>
                    </div>
                  </Card>)}

                <Button variant="outline" onClick={addItem} className="w-full border-dashed" data-id="element-618">
                  <Plus size={16} className="mr-2" data-id="element-619" /> Add Item
                </Button>
              </div>

              {/* Totals & Settings */}
              <Card className="p-4 space-y-3" data-id="element-620">
                <div className="flex justify-between text-sm" data-id="element-621">
                  <span className="text-gray-500" data-id="element-622">Subtotal</span>
                  <span data-id="element-623">{formatINR(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-sm" data-id="element-624">
                  <span className="text-gray-500" data-id="element-625">Discount</span>
                  <input type="number" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} className="w-20 text-right border-b border-gray-200 focus:border-trustopay-purple outline-none bg-transparent" data-id="element-626" />
                </div>

                <div className="flex items-center justify-between py-2" data-id="element-627">
                  <span className="text-gray-500 text-sm" data-id="element-628">GST (18%)</span>
                  <button onClick={() => setIncludeGST(!includeGST)} className={cn('w-8 h-4 rounded-full p-0.5 transition-colors duration-200', includeGST ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-629">
                    <div className={cn('w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200', includeGST ? 'translate-x-4' : 'translate-x-0')} data-id="element-630" />
                  </button>
                </div>
                {includeGST && <div className="flex justify-between text-sm" data-id="element-631">
                    <span className="text-gray-500" data-id="element-632">Tax Amount</span>
                    <span data-id="element-633">{formatINR(tax)}</span>
                  </div>}

                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-trustopay-navy" data-id="element-634">
                  <span data-id="element-635">Total</span>
                  <span data-id="element-636">{formatINR(total)}</span>
                </div>
              </Card>

              {/* Notes */}
              <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-637">
                <label className="mb-1.5 block text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-638">
                  Notes & Terms
                </label>
                <textarea className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:bg-white h-20 resize-none transition-colors" placeholder="Terms, conditions, or notes..." value={notes} onChange={e => setNotes(e.target.value)} data-id="element-639" />
              </div>
            </motion.div>}

          {step === 3 && <motion.div key="step3" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="p-5 flex flex-col pb-8" data-id="element-640">
              <div className="text-center mb-6 mt-4" data-id="element-641">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-642">
                  <ClipboardList size={32} data-id="element-643" />
                </div>
                <h2 className="text-2xl font-bold text-trustopay-navy" data-id="element-644">
                  Review Quotation
                </h2>
                <p className="text-gray-500" data-id="element-645">
                  Ready to send to {selectedCustomer?.name}
                </p>
              </div>

              <Card className="p-6 space-y-4 mb-4" data-id="element-646">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100" data-id="element-647">
                  <span className="text-gray-500" data-id="element-648">Total Amount</span>
                  <div className="flex items-center gap-2" data-id="element-649">
                    <span className="text-2xl font-bold text-trustopay-navy" data-id="element-650">
                      {formatINR(total)}
                    </span>
                    <button onClick={() => setStep(2)} className="p-1.5 hover:bg-gray-100 rounded-full text-trustopay-purple" data-id="element-651">
                      <Edit2 size={16} data-id="element-652" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm" data-id="element-653">
                  <div className="flex justify-between" data-id="element-654">
                    <span className="text-gray-500" data-id="element-655">Quote No</span>
                    <span className="font-medium" data-id="element-656">{quoteNumber}</span>
                  </div>
                  <div className="flex justify-between" data-id="element-657">
                    <span className="text-gray-500" data-id="element-658">Valid Until</span>
                    <span className="font-medium" data-id="element-659">{validUntil}</span>
                  </div>
                  <div className="flex justify-between" data-id="element-660">
                    <span className="text-gray-500" data-id="element-661">Items</span>
                    <span className="font-medium" data-id="element-662">{items.length} items</span>
                  </div>
                </div>
              </Card>

              {/* Delivery Channels */}
              <Card className="p-4 mb-4" data-id="element-663">
                <p className="font-bold text-trustopay-navy mb-3" data-id="element-664">
                  Send Quote Via
                </p>
                <div className="space-y-3" data-id="element-665">
                  <div className="flex items-center justify-between" data-id="element-666">
                    <div className="flex items-center gap-3" data-id="element-667">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" data-id="element-668">
                        <Bell size={14} className="text-trustopay-purple" data-id="element-669" />
                      </div>
                      <div data-id="element-670">
                        <p className="text-sm font-medium text-trustopay-navy" data-id="element-671">
                          App Notification
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-672">Mandatory</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded bg-trustopay-purple flex items-center justify-center" data-id="element-673">
                      <Check size={12} className="text-white" data-id="element-674" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-675">
                    <div className="flex items-center gap-3" data-id="element-676">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center" data-id="element-677">
                        <MessageCircle size={14} className="text-green-600" data-id="element-678" />
                      </div>
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-679">
                        WhatsApp
                      </p>
                    </div>
                    <button onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)} className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors', sendViaWhatsApp ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-680">
                      {sendViaWhatsApp && <Check size={12} className="text-white" data-id="element-681" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-682">
                    <div className="flex items-center gap-3" data-id="element-683">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center" data-id="element-684">
                        <Mail size={14} className="text-blue-600" data-id="element-685" />
                      </div>
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-686">
                        Email
                      </p>
                    </div>
                    <button onClick={() => setSendViaEmail(!sendViaEmail)} className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors', sendViaEmail ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-687">
                      {sendViaEmail && <Check size={12} className="text-white" data-id="element-688" />}
                    </button>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3" data-id="element-689">
                <Button variant="outline" className="flex-1" onClick={onClose} data-id="element-690">
                  Save Draft
                </Button>
                <Button className="flex-[2]" onClick={onClose} data-id="element-691">
                  Send Quote
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Footer (step 2 only) */}
      {step === 2 && <div className="p-5 border-t border-gray-100 bg-white" data-id="element-692">
          <Button className="w-full h-12" onClick={handleNext} data-id="element-693">
            Continue
          </Button>
        </div>}
    </div>;
}