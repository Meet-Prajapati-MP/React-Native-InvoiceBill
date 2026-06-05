import React, { useState } from 'react';
import { X, Wallet, Check, Building2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatINR, cn } from '../lib/utils';
interface AddMoneyProps {
  isOpen: boolean;
  onClose: () => void;
}
export function AddMoney({
  isOpen,
  onClose
}: AddMoneyProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'netbanking'>('upi');
  const [success, setSuccess] = useState(false);
  const handleAdd = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      onClose();
    }, 2000);
  };
  return <AnimatePresence data-id="element-33">
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" data-id="element-34" />

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
      }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-[430px] mx-auto overflow-hidden" data-id="element-35">
            {success ? <div className="p-12 flex flex-col items-center justify-center text-center space-y-6" data-id="element-36">
                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600" data-id="element-37">
                  <Check size={40} strokeWidth={3} data-id="element-38" />
                </motion.div>
                <div data-id="element-39">
                  <h2 className="text-2xl font-bold text-trustopay-navy mb-2" data-id="element-40">
                    Money Added!
                  </h2>
                  <p className="text-gray-500" data-id="element-41">
                    {formatINR(Number(amount))} has been added to your wallet.
                  </p>
                </div>
              </div> : <div className="p-6" data-id="element-42">
                <div className="flex justify-between items-center mb-8" data-id="element-43">
                  <h2 className="text-xl font-bold text-trustopay-navy flex items-center gap-2" data-id="element-44">
                    <Wallet className="text-trustopay-purple" size={24} data-id="element-45" />
                    Add Money
                  </h2>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" data-id="element-46">
                    <X size={24} className="text-gray-500" data-id="element-47" />
                  </button>
                </div>

                <div className="space-y-8" data-id="element-48">
                  <div className="text-center" data-id="element-49">
                    <label className="text-sm text-gray-500 mb-2 block" data-id="element-50">
                      Enter Amount
                    </label>
                    <div className="relative inline-block" data-id="element-51">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400" data-id="element-52">
                        ₹
                      </span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="text-5xl font-bold text-trustopay-navy w-full text-center outline-none pl-8 placeholder:text-gray-200" autoFocus data-id="element-53" />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center" data-id="element-54">
                    {[500, 1000, 5000].map(val => <button key={val} onClick={() => setAmount(val.toString())} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-trustopay-purple hover:text-trustopay-purple transition-colors" data-id="element-55">
                        + {formatINR(val)}
                      </button>)}
                  </div>

                  <div className="space-y-3" data-id="element-56">
                    <p className="text-sm font-medium text-gray-700" data-id="element-57">
                      Payment Method
                    </p>
                    <div onClick={() => setMethod('upi')} className={cn('p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all', method === 'upi' ? 'border-trustopay-purple bg-purple-50' : 'border-gray-100')} data-id="element-58">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100" data-id="element-59">
                        <span className="font-bold text-xs" data-id="element-60">UPI</span>
                      </div>
                      <div className="flex-1" data-id="element-61">
                        <p className="font-semibold text-trustopay-navy" data-id="element-62">
                          UPI Apps
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-63">
                          Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                      {method === 'upi' && <Check size={20} className="text-trustopay-purple" data-id="element-64" />}
                    </div>

                    <div onClick={() => setMethod('netbanking')} className={cn('p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all', method === 'netbanking' ? 'border-trustopay-purple bg-purple-50' : 'border-gray-100')} data-id="element-65">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100" data-id="element-66">
                        <ArrowUpRight size={18} className="text-gray-600" data-id="element-67" />
                      </div>
                      <div className="flex-1" data-id="element-68">
                        <p className="font-semibold text-trustopay-navy" data-id="element-69">
                          IMPS Transfer
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-70">
                          Instant bank transfer via IMPS
                        </p>
                      </div>
                      {method === 'netbanking' && <Check size={20} className="text-trustopay-purple" data-id="element-71" />}
                    </div>
                  </div>

                  <Button className="w-full h-14 text-lg" onClick={handleAdd} disabled={!amount} data-id="element-72">
                    Add {amount ? formatINR(Number(amount)) : ''}
                  </Button>
                </div>
              </div>}
          </motion.div>
        </>}
    </AnimatePresence>;
}