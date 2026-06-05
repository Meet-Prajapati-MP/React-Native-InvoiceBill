import React from 'react';
import { ArrowLeft, Share2, AlertCircle, CheckCircle2, Copy, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatINR } from '../lib/utils';
interface TransactionDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}
export function TransactionDetail({
  isOpen,
  onClose,
  transaction
}: TransactionDetailProps) {
  if (!transaction) return null;
  return <AnimatePresence data-id="element-3529">
      {isOpen && <motion.div initial={{
      x: '100%'
    }} animate={{
      x: 0
    }} exit={{
      x: '100%'
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-3530">
          {/* Header */}
          <div className="p-5 flex items-center bg-white" data-id="element-3531">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3532">
              <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3533" />
            </button>
            <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-3534">
              Transaction Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5" data-id="element-3535">
            {/* Status & Amount */}
            <div className="flex flex-col items-center mb-8 mt-4" data-id="element-3536">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4" data-id="element-3537">
                <CheckCircle2 size={32} strokeWidth={3} data-id="element-3538" />
              </div>
              <h1 className="text-3xl font-bold text-trustopay-navy mb-1" data-id="element-3539">
                {formatINR(transaction.amount)}
              </h1>
              <p className="text-green-600 font-medium flex items-center gap-1" data-id="element-3540">
                <CheckCircle2 size={14} data-id="element-3541" />
                Payment Successful
              </p>
              <p className="text-sm text-gray-500 mt-1" data-id="element-3542">{transaction.date}</p>
            </div>

            {/* Details Card */}
            <Card className="p-0 overflow-hidden mb-6" data-id="element-3543">
              <div className="p-4 border-b border-gray-100" data-id="element-3544">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4" data-id="element-3545">
                  Paid To
                </p>
                <div className="flex items-center gap-4" data-id="element-3546">
                  <div className="w-12 h-12 rounded-full bg-trustopay-purple text-white flex items-center justify-center font-bold text-lg" data-id="element-3547">
                    {transaction.name.charAt(0)}
                  </div>
                  <div data-id="element-3548">
                    <h3 className="font-bold text-trustopay-navy" data-id="element-3549">
                      {transaction.name}
                    </h3>
                    <p className="text-sm text-gray-500" data-id="element-3550">+91 98765 43210</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4" data-id="element-3551">
                {transaction.invoiceRef && <div className="flex justify-between items-start" data-id="element-3552">
                    <span className="text-sm text-gray-500" data-id="element-3553">
                      Invoice Reference
                    </span>
                    <div className="text-right" data-id="element-3554">
                      <p className="text-sm font-medium text-trustopay-purple flex items-center justify-end gap-1" data-id="element-3555">
                        <FileText size={14} data-id="element-3556" />#{transaction.invoiceRef}
                      </p>
                      <p className="text-xs text-gray-400" data-id="element-3557">
                        {transaction.note}
                      </p>
                    </div>
                  </div>}

                {transaction.milestone && <div className="flex justify-between items-start" data-id="element-3558">
                    <span className="text-sm text-gray-500" data-id="element-3559">Milestone</span>
                    <div className="text-right" data-id="element-3560">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-3561">
                        Milestone {transaction.milestone.current} of{' '}
                        {transaction.milestone.total}
                      </p>
                      <div className="flex gap-1 justify-end mt-1" data-id="element-3562">
                        {Array.from({
                    length: transaction.milestone.total
                  }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < transaction.milestone.current ? 'bg-trustopay-purple' : 'bg-gray-200'}`} data-id="element-3563" />)}
                      </div>
                    </div>
                  </div>}

                <div className="flex justify-between items-start" data-id="element-3564">
                  <span className="text-sm text-gray-500" data-id="element-3565">Payment Method</span>
                  <div className="text-right" data-id="element-3566">
                    <p className="text-sm font-medium text-trustopay-navy" data-id="element-3567">
                      Trustopay Wallet
                    </p>
                    <p className="text-xs text-gray-400" data-id="element-3568">
                      Transaction ID: TXN-2024-8392
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start" data-id="element-3569">
                  <span className="text-sm text-gray-500" data-id="element-3570">UPI Ref. No</span>
                  <div className="flex items-center gap-2" data-id="element-3571">
                    <p className="text-sm font-medium text-trustopay-navy" data-id="element-3572">
                      430129384756
                    </p>
                    <Copy size={14} className="text-gray-400" data-id="element-3573" />
                  </div>
                </div>

                <div className="flex justify-between items-start" data-id="element-3574">
                  <span className="text-sm text-gray-500" data-id="element-3575">Note</span>
                  <p className="text-sm font-medium text-trustopay-navy" data-id="element-3576">
                    {transaction.note || 'Invoice payment'}
                  </p>
                </div>
              </div>
            </Card>

            <Button variant="outline" className="w-full gap-2 mb-6" data-id="element-3577">
              <Share2 size={18} data-id="element-3578" />
              Share Receipt
            </Button>

            <div className="flex justify-center" data-id="element-3579">
              <button className="text-trustopay-purple text-sm font-medium flex items-center gap-2" data-id="element-3580">
                <AlertCircle size={16} data-id="element-3581" />
                Report an issue
              </button>
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
}