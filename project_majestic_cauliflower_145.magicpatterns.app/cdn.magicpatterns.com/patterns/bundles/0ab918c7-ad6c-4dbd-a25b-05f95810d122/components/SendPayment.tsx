import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { formatINR } from '../lib/utils';
interface SendPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: any;
}
export function SendPayment({
  isOpen,
  onClose,
  recipient
}: SendPaymentProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const handlePay = () => {
    setStep(3); // Success
    setTimeout(() => {
      setStep(1);
      setAmount('');
      setNote('');
      onClose();
    }, 2000);
  };
  return <AnimatePresence data-id="element-3388">
      {isOpen && <motion.div initial={{
      y: '100%'
    }} animate={{
      y: 0
    }} exit={{
      y: '100%'
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-3389">
          {step === 3 ? <div className="flex-1 flex flex-col items-center justify-center text-center p-8" data-id="element-3390">
              <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6" data-id="element-3391">
                <Check size={48} strokeWidth={3} data-id="element-3392" />
              </motion.div>
              <h2 className="text-2xl font-bold text-trustopay-navy mb-2" data-id="element-3393">
                Payment Successful!
              </h2>
              <p className="text-gray-500 mb-8" data-id="element-3394">
                {formatINR(Number(amount))} sent to{' '}
                {recipient?.name || 'Recipient'}
              </p>
              <Button onClick={onClose} className="w-full max-w-xs" data-id="element-3395">
                Done
              </Button>
            </div> : <>
              {/* Header */}
              <div className="p-6 flex justify-between items-center" data-id="element-3396">
                <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-3397">
                  Send Payment
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" data-id="element-3398">
                  <X size={24} className="text-gray-500" data-id="element-3399" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col" data-id="element-3400">
                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl" data-id="element-3401">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${recipient?.color || 'bg-gray-200 text-gray-600'}`} data-id="element-3402">
                    {recipient?.initials || '?'}
                  </div>
                  <div data-id="element-3403">
                    <p className="font-bold text-trustopay-navy" data-id="element-3404">
                      {recipient?.name || 'Select Recipient'}
                    </p>
                    <p className="text-sm text-gray-500" data-id="element-3405">
                      {recipient?.phone || 'Enter UPI ID'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center mb-12" data-id="element-3406">
                  <label className="text-sm text-gray-500 mb-4" data-id="element-3407">
                    Enter Amount
                  </label>
                  <div className="relative" data-id="element-3408">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400" data-id="element-3409">
                      ₹
                    </span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="text-6xl font-bold text-trustopay-navy w-full text-center outline-none pl-10 placeholder:text-gray-200" autoFocus data-id="element-3410" />
                  </div>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" className="mt-8 text-center text-gray-600 bg-transparent border-b border-gray-200 focus:border-trustopay-purple outline-none pb-2 w-full max-w-xs" data-id="element-3411" />
                </div>

                <Button className="w-full h-14 text-lg" onClick={handlePay} disabled={!amount} data-id="element-3412">
                  Pay {amount ? formatINR(Number(amount)) : ''}
                </Button>
              </div>
            </>}
        </motion.div>}
    </AnimatePresence>;
}