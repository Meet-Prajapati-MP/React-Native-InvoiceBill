import React from 'react';
import { Home, FileText, Users, Menu, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
type Tab = 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';
interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  badges?: {
    invoices?: number;
    quotes?: number;
  };
}
export function BottomNav({
  activeTab,
  onTabChange,
  badges
}: BottomNavProps) {
  const tabs = [{
    id: 'home',
    label: 'Home',
    icon: Home
  }, {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    badge: badges?.invoices
  }, {
    id: 'quotes',
    label: 'Quotes',
    icon: ClipboardList,
    badge: badges?.quotes
  }, {
    id: 'customers',
    label: 'Customers',
    icon: Users
  }, {
    id: 'menu',
    label: 'Menu',
    icon: Menu
  }] as const;
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 z-40 max-w-[430px] mx-auto" data-id="element-216">
      <div className="flex justify-between items-center h-14" data-id="element-217">
        {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className="flex flex-col items-center justify-center w-full h-full space-y-1 relative" data-id="element-218">
              <motion.div whileTap={{
            scale: 0.9
          }} animate={{
            color: isActive ? '#7C3AED' : '#6B7280',
            scale: isActive ? 1.1 : 1
          }} className="relative" data-id="element-219">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} data-id="element-220" />
                {tab.badge ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" data-id="element-221" /> : null}
              </motion.div>
              <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-trustopay-purple' : 'text-gray-500')} data-id="element-222">
                {tab.label}
              </span>
            </button>;
      })}
      </div>
    </div>;
}