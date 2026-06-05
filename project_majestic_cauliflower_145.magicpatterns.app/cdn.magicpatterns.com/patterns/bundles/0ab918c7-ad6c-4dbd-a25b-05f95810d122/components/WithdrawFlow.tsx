import React, { useState } from 'react';
import { X, Building2, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { formatINR } from '../lib/utils';
interface WithdrawFlowProps {
  isOpen: boolean;
  onClose: () => void;
}
export function WithdrawFlow({
  isOpen,
  onClose
}: WithdrawFlowProps) {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const balance = 124500;
  const handleWithdraw = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      onClose();
    }, 2000);
  };
  return <AnimatePresence data-id="element-3725">
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" data-id="element-3726" />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-[430px] mx-auto overflow-hidden" data-id="element-3727">
            {success ? <div className="p-12 flex flex-col items-center justify-center text-center space-y-6" data-id="element-3728">
                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600" data-id="element-3729">
                  <Check size={40} strokeWidth={3} data-id="element-3730" />
                </motion.div>
                <div data-id="element-3731">
                  <h2 className="text-2xl font-bold text-trustopay-navy mb-2" data-id="element-3732">
                    Withdrawal Initiated
                  </h2>
                  <p className="text-gray-500" data-id="element-3733">
                    {formatINR(Number(amount))} will be credited to your bank
                    account within 2 hours.
                  </p>
                </div>
              </div> : <div className="p-6" data-id="element-3734">
                <div className="flex justify-between items-center mb-8" data-id="element-3735">
                  <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-3736">
                    Withdraw to Bank
                  </h2>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" data-id="element-3737">
                    <X size={24} className="text-gray-500" data-id="element-3738" />
                  </button>
                </div>

                <div className="space-y-8" data-id="element-3739">
                  <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center" data-id="element-3740">
                    <span className="text-sm text-gray-500" data-id="element-3741">
                      Available Balance
                    </span>
                    <span className="font-bold text-trustopay-navy" data-id="element-3742">
                      {formatINR(balance)}
                    </span>
                  </div>

                  <div className="text-center" data-id="element-3743">
                    <label className="text-sm text-gray-500 mb-2 block" data-id="element-3744">
                      Amount to Withdraw
                    </label>
                    <div className="relative inline-block" data-id="element-3745">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400" data-id="element-3746">
                        ₹
                      </span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="text-5xl font-bold text-trustopay-navy w-full text-center outline-none pl-8 placeholder:text-gray-200" autoFocus data-id="element-3747" />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4" data-id="element-3748">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600" data-id="element-3749">
                      <Building2 size={20} data-id="element-3750" />
                    </div>
                    <div className="flex-1" data-id="element-3751">
                      <p className="font-semibold text-trustopay-navy" data-id="element-3752">
                        HDFC Bank
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-3753">
                        **** 1234 • Primary Account
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600" data-id="element-3754">
                      <Check size={14} data-id="element-3755" />
                    </div>
                  </div>

                  <Button className="w-full h-14 text-lg" onClick={handleWithdraw} disabled={!amount || Number(amount) > balance} data-id="element-3756">
                    Withdraw {amount ? formatINR(Number(amount)) : ''}
                  </Button>
                </div>
              </div>}
          </motion.div>
        </>}
    </AnimatePresence>;
}