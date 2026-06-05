import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatINR, cn } from '../lib/utils';
interface ConvertToInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  onConfirm: () => void;
}
export function ConvertToInvoiceModal({
  isOpen,
  onClose,
  quote,
  onConfirm
}: ConvertToInvoiceModalProps) {
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [markCompleted, setMarkCompleted] = useState(true);
  if (!isOpen || !quote) return null;
  return <AnimatePresence data-id="element-548">
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={onClose} data-id="element-549">
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
      }} className="bg-white w-full max-w-[430px] rounded-t-3xl p-6" onClick={e => e.stopPropagation()} data-id="element-550">
            <div className="flex justify-between items-center mb-6" data-id="element-551">
              <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-552">
                Convert to Invoice
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full" data-id="element-553">
                <X size={20} data-id="element-554" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex items-center justify-between" data-id="element-555">
              <div data-id="element-556">
                <p className="text-xs text-gray-500 mb-1" data-id="element-557">From Quote</p>
                <p className="font-bold text-trustopay-navy" data-id="element-558">{quote.id}</p>
              </div>
              <ArrowRight size={20} className="text-gray-400" data-id="element-559" />
              <div className="text-right" data-id="element-560">
                <p className="text-xs text-gray-500 mb-1" data-id="element-561">To Invoice</p>
                <p className="font-bold text-trustopay-purple" data-id="element-562">INV-NEW</p>
              </div>
            </div>

            <div className="space-y-4 mb-6" data-id="element-563">
              <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl" data-id="element-564">
                <span className="text-gray-500" data-id="element-565">Total Amount</span>
                <span className="text-xl font-bold text-trustopay-navy" data-id="element-566">
                  {formatINR(quote.amount)}
                </span>
              </div>

              <Input label="Invoice Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} data-id="element-567" />

              <div className="flex items-center justify-between py-2" data-id="element-568">
                <div data-id="element-569">
                  <p className="text-sm font-medium text-trustopay-navy" data-id="element-570">
                    Mark quote as completed
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-571">
                    Update quote status to 'Converted'
                  </p>
                </div>
                <button onClick={() => setMarkCompleted(!markCompleted)} className={cn('w-10 h-5 rounded-full p-0.5 transition-colors duration-200', markCompleted ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-572">
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', markCompleted ? 'translate-x-5' : 'translate-x-0')} data-id="element-573" />
                </button>
              </div>
            </div>

            <Button className="w-full h-12 text-lg" onClick={onConfirm} data-id="element-574">
              Create Invoice
            </Button>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}