import React from 'react';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatINR } from '../lib/utils';
interface InvoiceDiscountingProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceAmount: number;
}
export function InvoiceDiscounting({
  isOpen,
  onClose,
  invoiceAmount
}: InvoiceDiscountingProps) {
  const offerAmount = invoiceAmount * 0.95; // 5% discount
  const fee = invoiceAmount - offerAmount;
  return <AnimatePresence data-id="element-1312">
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" data-id="element-1313" />

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
      }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-[430px] mx-auto overflow-hidden" data-id="element-1314">
            <div className="p-6" data-id="element-1315">
              <div className="flex justify-between items-center mb-6" data-id="element-1316">
                <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-1317">
                  Get Instant Cash
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" data-id="element-1318">
                  <X size={24} className="text-gray-500" data-id="element-1319" />
                </button>
              </div>

              <div className="space-y-6" data-id="element-1320">
                <div className="text-center" data-id="element-1321">
                  <p className="text-gray-500 mb-1" data-id="element-1322">Original Invoice Amount</p>
                  <p className="text-xl font-semibold text-gray-900 line-through decoration-gray-400" data-id="element-1323">
                    {formatINR(invoiceAmount)}
                  </p>
                </div>

                <Card className="bg-gradient-to-br from-trustopay-purple/10 to-purple-50 border-trustopay-purple/20 p-6 text-center relative overflow-hidden" data-id="element-1324">
                  <div className="relative z-10" data-id="element-1325">
                    <p className="text-trustopay-purple font-bold mb-1" data-id="element-1326">
                      YOU RECEIVE
                    </p>
                    <h3 className="text-4xl font-bold text-trustopay-navy mb-2" data-id="element-1327">
                      {formatINR(offerAmount)}
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full text-xs font-medium text-gray-600" data-id="element-1328">
                      <span data-id="element-1329">Fee: {formatINR(fee)} (5%)</span>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4" data-id="element-1330">
                  <div className="flex items-start gap-3" data-id="element-1331">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mt-0.5" data-id="element-1332">
                      <Clock size={16} data-id="element-1333" />
                    </div>
                    <div data-id="element-1334">
                      <p className="font-semibold text-trustopay-navy" data-id="element-1335">
                        Money in 2 hours
                      </p>
                      <p className="text-sm text-gray-500" data-id="element-1336">
                        Funds transferred directly to your primary bank account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3" data-id="element-1337">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mt-0.5" data-id="element-1338">
                      <CheckCircle2 size={16} data-id="element-1339" />
                    </div>
                    <div data-id="element-1340">
                      <p className="font-semibold text-trustopay-navy" data-id="element-1341">
                        No Hidden Charges
                      </p>
                      <p className="text-sm text-gray-500" data-id="element-1342">
                        One-time flat fee. No interest or late fees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4" data-id="element-1343">
                  <Button className="w-full h-14 text-lg" onClick={onClose} data-id="element-1344">
                    Accept Offer
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-3" data-id="element-1345">
                    By accepting, you agree to the Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}