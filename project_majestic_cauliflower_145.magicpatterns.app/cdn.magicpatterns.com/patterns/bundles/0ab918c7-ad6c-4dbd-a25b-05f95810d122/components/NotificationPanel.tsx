import React from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Building2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'invoice' | 'payment' | 'alert' | 'bank' | 'user';
  read: boolean;
}
const notifications: Notification[] = [{
  id: '1',
  title: 'Invoice Received',
  description: 'Invoice #INV-004 received from Alpha Corp — ₹12,500',
  time: '2 hours ago',
  type: 'invoice',
  read: false
}, {
  id: '2',
  title: 'Payment Received',
  description: 'Payment of ₹15,000 received from Priya Sharma',
  time: '5 hours ago',
  type: 'payment',
  read: false
}, {
  id: '3',
  title: 'Invoice Overdue',
  description: 'Invoice #INV-001 is overdue — Tech Solutions Ltd',
  time: '1 day ago',
  type: 'alert',
  read: true
}, {
  id: '4',
  title: 'Withdrawal Successful',
  description: '₹45,000 withdrawn to HDFC Bank ****1234',
  time: '2 days ago',
  type: 'bank',
  read: true
}, {
  id: '5',
  title: 'New Customer',
  description: 'New customer Vikram Singh added',
  time: '3 days ago',
  type: 'user',
  read: true
}];
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
export function NotificationPanel({
  isOpen,
  onClose
}: NotificationPanelProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invoice':
        return <FileText size={18} className="text-trustopay-purple" data-id="element-1476" />;
      case 'payment':
        return <CheckCircle2 size={18} className="text-green-600" data-id="element-1477" />;
      case 'alert':
        return <AlertCircle size={18} className="text-red-600" data-id="element-1478" />;
      case 'bank':
        return <Building2 size={18} className="text-blue-600" data-id="element-1479" />;
      case 'user':
        return <UserPlus size={18} className="text-trustopay-purple" data-id="element-1480" />;
    }
  };
  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'invoice':
        return 'bg-purple-100';
      case 'payment':
        return 'bg-green-100';
      case 'alert':
        return 'bg-red-100';
      case 'bank':
        return 'bg-blue-100';
      case 'user':
        return 'bg-purple-100';
    }
  };
  return <AnimatePresence data-id="element-1481">
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" data-id="element-1482" />

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
      }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-[430px] mx-auto overflow-hidden h-[80vh] flex flex-col" data-id="element-1483">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10" data-id="element-1484">
              <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-1485">
                Notifications
              </h2>
              <div className="flex items-center gap-4" data-id="element-1486">
                <button className="text-xs font-medium text-trustopay-purple hover:underline" data-id="element-1487">
                  Mark all read
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" data-id="element-1488">
                  <X size={24} className="text-gray-500" data-id="element-1489" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2" data-id="element-1490">
              {notifications.map(notification => <div key={notification.id} className={cn('p-4 rounded-xl flex gap-4 transition-colors', !notification.read ? 'bg-purple-50/50' : 'bg-white')} data-id="element-1491">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', getBgColor(notification.type))} data-id="element-1492">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1" data-id="element-1493">
                    <div className="flex justify-between items-start mb-1" data-id="element-1494">
                      <h3 className={cn('font-semibold text-sm', !notification.read ? 'text-trustopay-navy' : 'text-gray-600')} data-id="element-1495">
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-gray-400" data-id="element-1496">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed" data-id="element-1497">
                      {notification.description}
                    </p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 rounded-full bg-trustopay-purple mt-2" data-id="element-1498" />}
                </div>)}
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}