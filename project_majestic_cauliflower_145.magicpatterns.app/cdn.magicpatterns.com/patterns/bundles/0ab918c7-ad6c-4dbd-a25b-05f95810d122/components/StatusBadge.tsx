import React from 'react';
import { cn } from '../lib/utils';
type StatusType = 'paid' | 'pending' | 'overdue' | 'completed' | 'sent' | 'received' | 'active' | 'paused' | 'draft' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'voided';
interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}
export function StatusBadge({
  status,
  className
}: StatusBadgeProps) {
  const styles = {
    paid: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    sent: 'bg-gray-100 text-gray-700',
    received: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
    converted: 'bg-purple-100 text-purple-700',
    voided: 'bg-red-50 text-red-600 line-through'
  };
  const labels = {
    paid: 'Paid',
    completed: 'Completed',
    pending: 'Pending',
    overdue: 'Overdue',
    sent: 'Sent',
    received: 'Received',
    active: 'Active',
    paused: 'Paused',
    draft: 'Draft',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
    converted: 'Converted',
    voided: 'Voided'
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[status], className)} data-id="element-3413">
      {labels[status]}
    </span>;
}