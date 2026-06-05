import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Share2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Calendar, ArrowRight, FileBarChart, Receipt, FileDown, Printer, Clock, Mail, FileText, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatINR, cn } from '../lib/utils';
interface ReportsAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}
// Data sets per filter period
const dataByPeriod: Record<string, {
  totalInvoiced: number;
  totalChange: number;
  invoicesSent: number;
  received: number;
  receivedChange: number;
  invoicesPaid: number;
  pending: number;
  pendingCount: number;
  overdue: number;
  overdueCount: number;
  months: {
    month: string;
    amount: number;
  }[];
  avgMonthly: number;
  avgPayDays: number;
  onTimePct: number;
}> = {
  'This Month': {
    totalInvoiced: 125000,
    totalChange: 12,
    invoicesSent: 22,
    received: 80000,
    receivedChange: 8,
    invoicesPaid: 15,
    pending: 30000,
    pendingCount: 5,
    overdue: 15000,
    overdueCount: 2,
    months: [{
      month: 'Sep',
      amount: 85000
    }, {
      month: 'Oct',
      amount: 92000
    }, {
      month: 'Nov',
      amount: 105000
    }, {
      month: 'Dec',
      amount: 125000
    }, {
      month: 'Jan',
      amount: 45000
    }, {
      month: 'Feb',
      amount: 52000
    }],
    avgMonthly: 84000,
    avgPayDays: 18,
    onTimePct: 65
  },
  'Last 30 Days': {
    totalInvoiced: 98000,
    totalChange: 5,
    invoicesSent: 18,
    received: 72000,
    receivedChange: 3,
    invoicesPaid: 13,
    pending: 18000,
    pendingCount: 3,
    overdue: 8000,
    overdueCount: 2,
    months: [{
      month: 'Oct',
      amount: 92000
    }, {
      month: 'Nov',
      amount: 105000
    }, {
      month: 'Dec',
      amount: 125000
    }, {
      month: 'Jan',
      amount: 45000
    }, {
      month: 'Feb',
      amount: 52000
    }, {
      month: 'Mar',
      amount: 98000
    }],
    avgMonthly: 86000,
    avgPayDays: 15,
    onTimePct: 72
  },
  'This Quarter': {
    totalInvoiced: 345000,
    totalChange: 18,
    invoicesSent: 48,
    received: 280000,
    receivedChange: 15,
    invoicesPaid: 40,
    pending: 42000,
    pendingCount: 5,
    overdue: 23000,
    overdueCount: 3,
    months: [{
      month: 'Oct',
      amount: 92000
    }, {
      month: 'Nov',
      amount: 105000
    }, {
      month: 'Dec',
      amount: 125000
    }, {
      month: 'Jan',
      amount: 45000
    }, {
      month: 'Feb',
      amount: 52000
    }, {
      month: 'Mar',
      amount: 98000
    }],
    avgMonthly: 95000,
    avgPayDays: 20,
    onTimePct: 60
  },
  Custom: {
    totalInvoiced: 520000,
    totalChange: 22,
    invoicesSent: 65,
    received: 410000,
    receivedChange: 19,
    invoicesPaid: 55,
    pending: 68000,
    pendingCount: 7,
    overdue: 42000,
    overdueCount: 3,
    months: [{
      month: 'Sep',
      amount: 85000
    }, {
      month: 'Oct',
      amount: 92000
    }, {
      month: 'Nov',
      amount: 105000
    }, {
      month: 'Dec',
      amount: 125000
    }, {
      month: 'Jan',
      amount: 45000
    }, {
      month: 'Feb',
      amount: 52000
    }],
    avgMonthly: 87000,
    avgPayDays: 18,
    onTimePct: 65
  }
};
const topClients = [{
  name: 'Tech Solutions Ltd',
  amount: 85000,
  invoices: 3
}, {
  name: 'Creative Studio',
  amount: 45000,
  invoices: 2
}, {
  name: 'Global Services',
  amount: 25000,
  invoices: 1
}, {
  name: 'Alpha Corp',
  amount: 12000,
  invoices: 1
}, {
  name: 'Beta Systems',
  amount: 8000,
  invoices: 1
}];
export function ReportsAnalytics({
  isOpen,
  onClose
}: ReportsAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showDownloadFormat, setShowDownloadFormat] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  // Custom date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2023-10-01');
  const [customEndDate, setCustomEndDate] = useState('2023-12-31');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const handleFilterClick = (filter: string) => {
    if (filter === 'Custom') {
      setShowDatePicker(true);
    } else {
      setTimeFilter(filter);
    }
  };
  const handleApplyCustomDates = () => {
    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
    setTimeFilter('Custom');
    setShowDatePicker(false);
  };
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const data = useMemo(() => dataByPeriod[timeFilter] || dataByPeriod['This Month'], [timeFilter]);
  const outstanding = data.pending + data.overdue;
  const totalInvoices = data.invoicesPaid + data.pendingCount + data.overdueCount;
  const paidPct = Math.round(data.invoicesPaid / totalInvoices * 100);
  const pendingPct = Math.round(data.pendingCount / totalInvoices * 100);
  const overduePct = Math.round(data.overdueCount / totalInvoices * 100);
  const maxRevenue = Math.max(...data.months.map(m => m.amount));
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-2638">
      {/* Fixed Header + Filters */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0" data-id="element-2639">
        <div className="px-4 pt-12 pb-3 flex items-center justify-between" data-id="element-2640">
          <div className="flex items-center gap-2" data-id="element-2641">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-2642">
              <ArrowLeft size={22} className="text-trustopay-navy" data-id="element-2643" />
            </button>
            <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-2644">
              Reports & Analytics
            </h2>
          </div>
          <button onClick={() => setShowExportSheet(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2645">
            <Download size={20} data-id="element-2646" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3" data-id="element-2647">
          <div className="flex gap-2 overflow-x-auto no-scrollbar" data-id="element-2648">
            {['This Month', 'Last 30 Days', 'This Quarter', 'Custom'].map(filter => <button key={filter} onClick={() => handleFilterClick(filter)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1', timeFilter === filter ? 'bg-trustopay-purple text-white shadow-sm' : 'bg-gray-100 text-gray-600')} data-id="element-2649">
                  {filter === 'Custom' && <Calendar size={11} data-id="element-2650" />}
                  {filter}
                </button>)}
          </div>

          {/* Custom date range label */}
          {timeFilter === 'Custom' && appliedStartDate && appliedEndDate && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} className="mt-2 flex items-center gap-2" data-id="element-2651">
              <div className="flex-1 flex items-center gap-1.5 bg-purple-50 rounded-lg px-3 py-1.5" data-id="element-2652">
                <Calendar size={12} className="text-trustopay-purple" data-id="element-2653" />
                <span className="text-[11px] font-medium text-trustopay-purple" data-id="element-2654">
                  {formatDateLabel(appliedStartDate)} —{' '}
                  {formatDateLabel(appliedEndDate)}
                </span>
              </div>
              <button onClick={() => setShowDatePicker(true)} className="text-[11px] font-medium text-trustopay-purple hover:underline" data-id="element-2655">
                Edit
              </button>
            </motion.div>}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" data-id="element-2656">
        <AnimatePresence mode="wait" data-id="element-2657">
          <motion.div key={timeFilter} initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -8
        }} transition={{
          duration: 0.2
        }} className="p-4 space-y-6 pb-8" data-id="element-2658">
            {/* Section 1: Money Overview */}
            <div className="space-y-3" data-id="element-2659">
              {/* Total Invoiced */}
              <Card className="p-4" data-id="element-2660">
                <div className="flex justify-between items-center mb-1" data-id="element-2661">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2662">
                    Total Invoiced
                  </p>
                  <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', data.totalChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50')} data-id="element-2663">
                    {data.totalChange >= 0 ? <TrendingUp size={10} data-id="element-2664" /> : <TrendingDown size={10} data-id="element-2665" />}
                    {data.totalChange >= 0 ? '+' : ''}
                    {data.totalChange}%
                  </div>
                </div>
                <p className="text-[28px] font-bold text-trustopay-navy leading-tight" data-id="element-2666">
                  {formatINR(data.totalInvoiced)}
                </p>
                <p className="text-xs text-gray-500 mt-1" data-id="element-2667">
                  {data.invoicesSent} invoices sent
                </p>
              </Card>

              {/* Money Received */}
              <Card className="p-4" data-id="element-2668">
                <div className="flex justify-between items-center mb-1" data-id="element-2669">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2670">
                    Money Received
                  </p>
                  <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', data.receivedChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50')} data-id="element-2671">
                    {data.receivedChange >= 0 ? <TrendingUp size={10} data-id="element-2672" /> : <TrendingDown size={10} data-id="element-2673" />}
                    {data.receivedChange >= 0 ? '+' : ''}
                    {data.receivedChange}%
                  </div>
                </div>
                <p className="text-[28px] font-bold text-trustopay-navy leading-tight" data-id="element-2674">
                  {formatINR(data.received)}
                </p>
                <p className="text-xs text-gray-500 mt-1" data-id="element-2675">
                  {data.invoicesPaid} invoices paid
                </p>
              </Card>

              {/* Outstanding */}
              <Card className={cn('p-4', data.overdueCount > 0 && 'bg-red-50/40 border-red-100')} data-id="element-2676">
                <div className="flex justify-between items-center mb-1" data-id="element-2677">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2678">
                    Outstanding
                  </p>
                  {data.overdueCount > 0 && <AlertCircle size={16} className="text-red-500" data-id="element-2679" />}
                </div>
                <p className="text-[28px] font-bold text-trustopay-navy leading-tight" data-id="element-2680">
                  {formatINR(outstanding)}
                </p>
                <div className="mt-3 space-y-1.5" data-id="element-2681">
                  <div className="flex items-center gap-2 text-xs text-gray-600" data-id="element-2682">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" data-id="element-2683" />
                    Pending: {formatINR(data.pending)} ({data.pendingCount}{' '}
                    invoices)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-600 font-medium" data-id="element-2684">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" data-id="element-2685" />
                    Overdue: {formatINR(data.overdue)} ({data.overdueCount}{' '}
                    invoices)
                  </div>
                </div>
                {data.overdueCount > 0 && <Button className="w-full mt-4 h-9 text-xs" data-id="element-2686">
                    Send Reminders to All Overdue
                  </Button>}
              </Card>
            </div>

            {/* Section 2: Payment Status */}
            <div data-id="element-2687">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-2688">
                Payment Status
              </p>
              <Card className="p-5" data-id="element-2689">
                <div className="flex items-center gap-5" data-id="element-2690">
                  {/* Donut */}
                  <div className="w-24 h-24 flex-shrink-0 relative" data-id="element-2691">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" data-id="element-2692">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="5" data-id="element-2693" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray={`${paidPct * 0.88} ${88 - paidPct * 0.88}`} strokeDashoffset="0" strokeLinecap="round" data-id="element-2694" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray={`${pendingPct * 0.88} ${88 - pendingPct * 0.88}`} strokeDashoffset={`${-(paidPct * 0.88)}`} strokeLinecap="round" data-id="element-2695" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="5" strokeDasharray={`${overduePct * 0.88} ${88 - overduePct * 0.88}`} strokeDashoffset={`${-((paidPct + pendingPct) * 0.88)}`} strokeLinecap="round" data-id="element-2696" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center" data-id="element-2697">
                      <span className="text-lg font-bold text-trustopay-navy leading-none" data-id="element-2698">
                        {totalInvoices}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5" data-id="element-2699">
                        Total
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-3" data-id="element-2700">
                    <div className="flex items-center justify-between" data-id="element-2701">
                      <div className="flex items-center gap-2" data-id="element-2702">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" data-id="element-2703" />
                        <span className="text-xs text-gray-600" data-id="element-2704">Paid</span>
                      </div>
                      <span className="text-xs font-bold text-trustopay-navy" data-id="element-2705">
                        {data.invoicesPaid}{' '}
                        <span className="font-normal text-gray-400" data-id="element-2706">
                          ({formatINR(data.received)})
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between" data-id="element-2707">
                      <div className="flex items-center gap-2" data-id="element-2708">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" data-id="element-2709" />
                        <span className="text-xs text-gray-600" data-id="element-2710">Pending</span>
                      </div>
                      <span className="text-xs font-bold text-trustopay-navy" data-id="element-2711">
                        {data.pendingCount}{' '}
                        <span className="font-normal text-gray-400" data-id="element-2712">
                          ({formatINR(data.pending)})
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between" data-id="element-2713">
                      <div className="flex items-center gap-2" data-id="element-2714">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" data-id="element-2715" />
                        <span className="text-xs text-gray-600" data-id="element-2716">Overdue</span>
                      </div>
                      <span className="text-xs font-bold text-trustopay-navy" data-id="element-2717">
                        {data.overdueCount}{' '}
                        <span className="font-normal text-gray-400" data-id="element-2718">
                          ({formatINR(data.overdue)})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Section 3: Revenue Trend */}
            <div data-id="element-2719">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-2720">
                Revenue Trend (Last 6 Months)
              </p>
              <Card className="p-4" data-id="element-2721">
                <div className="flex gap-3 h-36" data-id="element-2722">
                  {/* Y-axis */}
                  <div className="flex flex-col justify-between items-end text-[9px] text-gray-400 py-1 w-8 flex-shrink-0" data-id="element-2723">
                    <span data-id="element-2724">{formatINR(maxRevenue).replace('₹', '₹')}</span>
                    <span data-id="element-2725">
                      {formatINR(Math.round(maxRevenue * 0.5)).replace('₹', '₹')}
                    </span>
                    <span data-id="element-2726">₹0</span>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 flex items-end gap-2 border-l border-b border-gray-100 pl-2 pb-0" data-id="element-2727">
                    {data.months.map((d, i) => {
                    const pct = d.amount / maxRevenue * 100;
                    return <div key={`${timeFilter}-${i}`} className="flex-1 flex flex-col items-center gap-1 min-w-0" data-id="element-2728">
                          <motion.div initial={{
                        height: 0
                      }} animate={{
                        height: `${pct}%`
                      }} transition={{
                        duration: 0.4,
                        delay: i * 0.06,
                        ease: 'easeOut'
                      }} className="w-full max-w-[28px] bg-trustopay-purple rounded-t relative group cursor-pointer hover:bg-purple-700 transition-colors" data-id="element-2729">
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity" data-id="element-2730">
                              {formatINR(d.amount)}
                            </div>
                          </motion.div>
                          <span className="text-[9px] text-gray-400 leading-none" data-id="element-2731">
                            {d.month}
                          </span>
                        </div>;
                  })}
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-3 pt-3 border-t border-gray-100" data-id="element-2732">
                  Average:{' '}
                  <span className="font-semibold text-trustopay-navy" data-id="element-2733">
                    {formatINR(data.avgMonthly)}/month
                  </span>
                </p>
              </Card>
            </div>

            {/* Section 4: Top Clients */}
            <div data-id="element-2734">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-2735">
                Top Clients (By Revenue)
              </p>
              <Card className="overflow-hidden" data-id="element-2736">
                {topClients.map((client, i) => <div key={i} className={cn('px-4 py-3 flex items-center justify-between', i < topClients.length - 1 && 'border-b border-gray-50')} data-id="element-2737">
                    <div className="flex items-start gap-2.5 min-w-0" data-id="element-2738">
                      <span className="text-xs font-bold text-gray-400 w-4 pt-0.5 flex-shrink-0" data-id="element-2739">
                        {i + 1}.
                      </span>
                      <div className="min-w-0" data-id="element-2740">
                        <p className="text-sm font-semibold text-trustopay-navy truncate" data-id="element-2741">
                          {client.name}
                        </p>
                        <p className="text-[11px] text-gray-400" data-id="element-2742">
                          {client.invoices} invoice
                          {client.invoices > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-trustopay-navy flex-shrink-0 ml-3" data-id="element-2743">
                      {formatINR(client.amount)}
                    </p>
                  </div>)}
                <button className="w-full py-3 text-xs font-bold text-trustopay-purple border-t border-gray-100 flex items-center justify-center gap-1 hover:bg-purple-50 transition-colors" data-id="element-2744">
                  View All Clients <ArrowRight size={12} data-id="element-2745" />
                </button>
              </Card>
            </div>

            {/* Section 5: Quick Insights */}
            <div data-id="element-2746">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-2747">
                Quick Insights
              </p>
              <div className="bg-white rounded-xl p-4 space-y-3.5 border border-gray-100 shadow-sm" data-id="element-2748">
                <div className="flex items-start gap-3" data-id="element-2749">
                  <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" data-id="element-2750" />
                  <p className="text-sm text-gray-600" data-id="element-2751">
                    Customers pay in{' '}
                    <span className="font-semibold text-trustopay-navy" data-id="element-2752">
                      {data.avgPayDays} days
                    </span>{' '}
                    on average
                  </p>
                </div>
                <div className="flex items-start gap-3" data-id="element-2753">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" data-id="element-2754" />
                  <p className="text-sm text-gray-600" data-id="element-2755">
                    <span className="font-semibold text-trustopay-navy" data-id="element-2756">
                      {data.onTimePct}%
                    </span>{' '}
                    of invoices are paid on time
                  </p>
                </div>
                <div className="flex items-start gap-3" data-id="element-2757">
                  <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" data-id="element-2758" />
                  <p className="text-sm text-gray-600" data-id="element-2759">
                    Best payment:{' '}
                    <span className="font-semibold text-trustopay-navy" data-id="element-2760">
                      Within first 10 days
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6: Download Reports */}
            <div data-id="element-2761">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-2762">
                Download Reports
              </p>
              <div className="grid grid-cols-2 gap-3" data-id="element-2763">
                {[{
                label: 'Sales Summary',
                key: 'sales',
                icon: '📊'
              }, {
                label: 'Outstanding Report',
                key: 'outstanding',
                icon: '⚠️'
              }, {
                label: 'Tax Report',
                key: 'tax',
                icon: '🧾'
              }, {
                label: 'Client Statement',
                key: 'client',
                icon: '👤'
              }].map(report => <Card key={report.key} className="p-4 flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport(report.key)} data-id="element-2764">
                    <span className="text-2xl mb-2" data-id="element-2765">{report.icon}</span>
                    <p className="font-semibold text-trustopay-navy text-sm mb-3 flex-1" data-id="element-2766">
                      {report.label}
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-trustopay-purple border-trustopay-purple hover:bg-purple-50 h-8 text-xs" onClick={e => {
                  e.stopPropagation();
                  setShowDownloadFormat(report.label);
                }} data-id="element-2767">
                      Download
                    </Button>
                  </Card>)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Date Picker Bottom Sheet */}
      <AnimatePresence data-id="element-2768">
        {showDatePicker && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowDatePicker(false)} data-id="element-2769">
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
        }} className="bg-white w-full max-w-[430px] rounded-t-3xl p-6" onClick={e => e.stopPropagation()} data-id="element-2770">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" data-id="element-2771" />

              <div className="flex items-center justify-between mb-1" data-id="element-2772">
                <h3 className="text-lg font-bold text-trustopay-navy" data-id="element-2773">
                  Custom Date Range
                </h3>
                <button onClick={() => setShowDatePicker(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400" data-id="element-2774">
                  <X size={18} data-id="element-2775" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-5" data-id="element-2776">
                Select start and end dates for your report
              </p>

              <div className="space-y-4" data-id="element-2777">
                {/* From Date */}
                <div data-id="element-2778">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block" data-id="element-2779">
                    From Date
                  </label>
                  <div className="relative" data-id="element-2780">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" data-id="element-2781" />
                    <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full h-12 pl-10 pr-3 rounded-xl border border-gray-200 text-sm text-trustopay-navy font-medium focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:border-transparent bg-gray-50" data-id="element-2782" />
                  </div>
                </div>

                {/* To Date */}
                <div data-id="element-2783">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block" data-id="element-2784">
                    To Date
                  </label>
                  <div className="relative" data-id="element-2785">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" data-id="element-2786" />
                    <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} min={customStartDate} className="w-full h-12 pl-10 pr-3 rounded-xl border border-gray-200 text-sm text-trustopay-navy font-medium focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:border-transparent bg-gray-50" data-id="element-2787" />
                  </div>
                </div>

                {/* Quick Presets */}
                <div data-id="element-2788">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2" data-id="element-2789">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-2" data-id="element-2790">
                    {[{
                  label: 'Last 7 Days',
                  start: '2023-10-24',
                  end: '2023-10-31'
                }, {
                  label: 'Last 3 Months',
                  start: '2023-08-01',
                  end: '2023-10-31'
                }, {
                  label: 'Last 6 Months',
                  start: '2023-05-01',
                  end: '2023-10-31'
                }, {
                  label: 'This Year',
                  start: '2023-01-01',
                  end: '2023-12-31'
                }].map(preset => <button key={preset.label} onClick={() => {
                  setCustomStartDate(preset.start);
                  setCustomEndDate(preset.end);
                }} className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border', customStartDate === preset.start && customEndDate === preset.end ? 'bg-purple-50 border-trustopay-purple text-trustopay-purple' : 'border-gray-200 text-gray-600 hover:bg-gray-50')} data-id="element-2791">
                        {preset.label}
                      </button>)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6" data-id="element-2792">
                <Button variant="outline" className="flex-1" onClick={() => setShowDatePicker(false)} data-id="element-2793">
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleApplyCustomDates} data-id="element-2794">
                  Apply Dates
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Export Bottom Sheet */}
      <AnimatePresence data-id="element-2795">
        {showExportSheet && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowExportSheet(false)} data-id="element-2796">
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
        }} className="bg-white w-full max-w-[430px] rounded-t-3xl p-6" onClick={e => e.stopPropagation()} data-id="element-2797">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" data-id="element-2798" />
              <h3 className="text-lg font-bold text-trustopay-navy mb-1" data-id="element-2799">
                Export Complete Report
              </h3>
              <p className="text-sm text-gray-500 mb-5" data-id="element-2800">
                Export all analytics for {timeFilter}
              </p>
              <div className="space-y-3" data-id="element-2801">
                <button className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" data-id="element-2802">
                  <FileText size={20} className="text-red-500" data-id="element-2803" />
                  <span className="text-sm font-medium text-gray-800" data-id="element-2804">
                    Download as PDF
                  </span>
                </button>
                <button className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" data-id="element-2805">
                  <FileBarChart size={20} className="text-green-600" data-id="element-2806" />
                  <span className="text-sm font-medium text-gray-800" data-id="element-2807">
                    Download as Excel
                  </span>
                </button>
                <button className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" data-id="element-2808">
                  <Mail size={20} className="text-blue-500" data-id="element-2809" />
                  <span className="text-sm font-medium text-gray-800" data-id="element-2810">
                    Email Report
                  </span>
                </button>
              </div>
              <button className="w-full text-center text-sm text-gray-500 font-medium mt-4 py-2" onClick={() => setShowExportSheet(false)} data-id="element-2811">
                Cancel
              </button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Download Format Bottom Sheet */}
      <AnimatePresence data-id="element-2812">
        {showDownloadFormat && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowDownloadFormat(null)} data-id="element-2813">
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
        }} className="bg-white w-full max-w-[430px] rounded-t-3xl p-6" onClick={e => e.stopPropagation()} data-id="element-2814">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" data-id="element-2815" />
              <h3 className="text-lg font-bold text-trustopay-navy mb-1" data-id="element-2816">
                Download {showDownloadFormat}
              </h3>
              <p className="text-sm text-gray-500 mb-5" data-id="element-2817">Select format</p>
              <div className="space-y-3" data-id="element-2818">
                <button className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" data-id="element-2819">
                  <FileText size={20} className="text-red-500" data-id="element-2820" />
                  <span className="text-sm font-medium text-gray-800" data-id="element-2821">
                    PDF Document
                  </span>
                </button>
                <button className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" data-id="element-2822">
                  <FileBarChart size={20} className="text-green-600" data-id="element-2823" />
                  <span className="text-sm font-medium text-gray-800" data-id="element-2824">
                    Excel Spreadsheet
                  </span>
                </button>
              </div>
              <button className="w-full text-center text-sm text-gray-500 font-medium mt-4 py-2" onClick={() => setShowDownloadFormat(null)} data-id="element-2825">
                Cancel
              </button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Report Preview Overlay */}
      <AnimatePresence data-id="element-2826">
        {activeReport && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-[70] bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-2827">
            <div className="px-4 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0" data-id="element-2828">
              <div className="flex items-center gap-2" data-id="element-2829">
                <button onClick={() => setActiveReport(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-2830">
                  <ArrowLeft size={22} className="text-trustopay-navy" data-id="element-2831" />
                </button>
                <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-2832">
                  {activeReport === 'sales' && 'Sales Report'}
                  {activeReport === 'outstanding' && 'Outstanding Report'}
                  {activeReport === 'tax' && 'Tax Report'}
                  {activeReport === 'client' && 'Client Statement'}
                </h2>
              </div>
              <div className="flex gap-1" data-id="element-2833">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2834">
                  <Printer size={20} data-id="element-2835" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2836">
                  <Share2 size={20} data-id="element-2837" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-gray-50" data-id="element-2838">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" data-id="element-2839">
                <div className="p-5" data-id="element-2840">
                  {/* Document Header */}
                  <div className="flex justify-between items-start mb-6" data-id="element-2841">
                    <div className="flex items-center gap-2" data-id="element-2842">
                      <div className="w-9 h-9 bg-trustopay-purple rounded-lg flex items-center justify-center" data-id="element-2843">
                        <span className="text-white font-bold text-xs" data-id="element-2844">TP</span>
                      </div>
                      <div data-id="element-2845">
                        <p className="font-bold text-trustopay-navy text-sm" data-id="element-2846">
                          Trustopay
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-2847">
                          trustopay.com
                        </p>
                      </div>
                    </div>
                    <div className="text-right" data-id="element-2848">
                      <h3 className="text-base font-bold text-trustopay-navy uppercase" data-id="element-2849">
                        {activeReport === 'sales' && 'Sales Report'}
                        {activeReport === 'outstanding' && 'Outstanding'}
                        {activeReport === 'tax' && 'Tax Report'}
                        {activeReport === 'client' && 'Client Statement'}
                      </h3>
                      <p className="text-[11px] text-gray-400" data-id="element-2850">{timeFilter}</p>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex gap-3 mb-5" data-id="element-2851">
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5" data-id="element-2852">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-2853">
                        From
                      </p>
                      <p className="text-xs font-medium text-trustopay-navy mt-0.5" data-id="element-2854">
                        Oct 1, 2023
                      </p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5" data-id="element-2855">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-2856">
                        To
                      </p>
                      <p className="text-xs font-medium text-trustopay-navy mt-0.5" data-id="element-2857">
                        Oct 31, 2023
                      </p>
                    </div>
                  </div>

                  {/* Sales Report */}
                  {activeReport === 'sales' && <div className="space-y-4" data-id="element-2858">
                      <div className="bg-purple-50 rounded-lg p-4 text-center" data-id="element-2859">
                        <p className="text-[11px] text-gray-500 mb-1" data-id="element-2860">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-trustopay-navy" data-id="element-2861">
                          {formatINR(data.totalInvoiced)}
                        </p>
                        <p className="text-[11px] text-green-600 font-medium mt-1" data-id="element-2862">
                          +{data.totalChange}% from last period
                        </p>
                      </div>
                      <div data-id="element-2863">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-2864">
                          Revenue by Category
                        </p>
                        {[{
                    name: 'Web Design',
                    amount: 52000,
                    pct: 42
                  }, {
                    name: 'Consulting',
                    amount: 38000,
                    pct: 30
                  }, {
                    name: 'Logo Design',
                    amount: 20000,
                    pct: 16
                  }, {
                    name: 'Other',
                    amount: 15000,
                    pct: 12
                  }].map((cat, i) => <div key={i} className="mb-2" data-id="element-2865">
                            <div className="flex justify-between text-[11px] mb-1" data-id="element-2866">
                              <span className="text-gray-600" data-id="element-2867">{cat.name}</span>
                              <span className="font-medium text-trustopay-navy" data-id="element-2868">
                                {formatINR(cat.amount)} ({cat.pct}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden" data-id="element-2869">
                              <div className="h-full bg-trustopay-purple rounded-full" style={{
                        width: `${cat.pct}%`
                      }} data-id="element-2870" />
                            </div>
                          </div>)}
                      </div>
                    </div>}

                  {/* Outstanding Report */}
                  {activeReport === 'outstanding' && <div className="space-y-4" data-id="element-2871">
                      <div className="bg-red-50 rounded-lg p-4 text-center" data-id="element-2872">
                        <p className="text-[11px] text-gray-500 mb-1" data-id="element-2873">
                          Total Outstanding
                        </p>
                        <p className="text-2xl font-bold text-red-600" data-id="element-2874">
                          {formatINR(outstanding)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2" data-id="element-2875">
                        <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100" data-id="element-2876">
                          <p className="text-[10px] text-yellow-700 font-medium" data-id="element-2877">
                            Pending
                          </p>
                          <p className="text-base font-bold text-yellow-700" data-id="element-2878">
                            {formatINR(data.pending)}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100" data-id="element-2879">
                          <p className="text-[10px] text-red-700 font-medium" data-id="element-2880">
                            Overdue
                          </p>
                          <p className="text-base font-bold text-red-700" data-id="element-2881">
                            {formatINR(data.overdue)}
                          </p>
                        </div>
                      </div>
                      <div data-id="element-2882">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-2883">
                          Aging Analysis
                        </p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px]" data-id="element-2884">
                          <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 border-b border-gray-200 font-bold text-gray-400 uppercase text-[9px]" data-id="element-2885">
                            <span data-id="element-2886">Period</span>
                            <span className="text-right" data-id="element-2887">Amount</span>
                            <span className="text-right" data-id="element-2888">Count</span>
                          </div>
                          {[{
                      period: '0-30 days',
                      amount: 15000,
                      count: 2
                    }, {
                      period: '31-60 days',
                      amount: 12000,
                      count: 1
                    }, {
                      period: '61-90 days',
                      amount: 8000,
                      count: 1
                    }, {
                      period: '90+ days',
                      amount: 10000,
                      count: 1
                    }].map((r, i) => <div key={i} className="grid grid-cols-3 px-3 py-2 border-b border-gray-100 last:border-none" data-id="element-2889">
                              <span className="text-trustopay-navy font-medium" data-id="element-2890">
                                {r.period}
                              </span>
                              <span className="text-right text-trustopay-navy" data-id="element-2891">
                                {formatINR(r.amount)}
                              </span>
                              <span className="text-right text-gray-500" data-id="element-2892">
                                {r.count}
                              </span>
                            </div>)}
                        </div>
                      </div>
                    </div>}

                  {/* Tax Report */}
                  {activeReport === 'tax' && <div className="space-y-4" data-id="element-2893">
                      <div className="bg-orange-50 rounded-lg p-4 text-center" data-id="element-2894">
                        <p className="text-[11px] text-gray-500 mb-1" data-id="element-2895">
                          Total GST Collected
                        </p>
                        <p className="text-2xl font-bold text-orange-700" data-id="element-2896">
                          {formatINR(22500)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2" data-id="element-2897">
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200" data-id="element-2898">
                          <p className="text-[10px] text-gray-500 font-medium" data-id="element-2899">
                            CGST
                          </p>
                          <p className="text-base font-bold text-trustopay-navy" data-id="element-2900">
                            {formatINR(11250)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200" data-id="element-2901">
                          <p className="text-[10px] text-gray-500 font-medium" data-id="element-2902">
                            SGST
                          </p>
                          <p className="text-base font-bold text-trustopay-navy" data-id="element-2903">
                            {formatINR(11250)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg flex gap-2 items-start" data-id="element-2904">
                        <Receipt size={14} className="text-blue-600 mt-0.5 flex-shrink-0" data-id="element-2905" />
                        <p className="text-[11px] text-blue-700" data-id="element-2906">
                          This report can be used for GST filing.
                        </p>
                      </div>
                    </div>}

                  {/* Client Statement */}
                  {activeReport === 'client' && <div className="space-y-4" data-id="element-2907">
                      <div className="bg-purple-50 rounded-lg p-4" data-id="element-2908">
                        <div className="flex items-center gap-3 mb-3" data-id="element-2909">
                          <div className="w-9 h-9 rounded-full bg-trustopay-purple text-white flex items-center justify-center font-bold text-sm" data-id="element-2910">
                            T
                          </div>
                          <div data-id="element-2911">
                            <p className="font-bold text-trustopay-navy text-sm" data-id="element-2912">
                              Tech Solutions Ltd
                            </p>
                            <p className="text-[10px] text-gray-500" data-id="element-2913">
                              client@techsolutions.com
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center" data-id="element-2914">
                          <div data-id="element-2915">
                            <p className="text-[10px] text-gray-500" data-id="element-2916">Billed</p>
                            <p className="text-sm font-bold text-trustopay-navy" data-id="element-2917">
                              {formatINR(85000)}
                            </p>
                          </div>
                          <div data-id="element-2918">
                            <p className="text-[10px] text-gray-500" data-id="element-2919">
                              Received
                            </p>
                            <p className="text-sm font-bold text-green-600" data-id="element-2920">
                              {formatINR(70000)}
                            </p>
                          </div>
                          <div data-id="element-2921">
                            <p className="text-[10px] text-gray-500" data-id="element-2922">Due</p>
                            <p className="text-sm font-bold text-red-600" data-id="element-2923">
                              {formatINR(15000)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div data-id="element-2924">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-2925">
                          Transaction History
                        </p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px]" data-id="element-2926">
                          <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 border-b border-gray-200 font-bold text-gray-400 uppercase text-[9px]" data-id="element-2927">
                            <span data-id="element-2928">Date</span>
                            <span data-id="element-2929">Invoice</span>
                            <span className="text-right" data-id="element-2930">Amount</span>
                            <span className="text-right" data-id="element-2931">Status</span>
                          </div>
                          {[{
                      date: 'Oct 20',
                      inv: 'INV-006',
                      amount: 25000,
                      status: 'Paid',
                      color: 'text-green-600'
                    }, {
                      date: 'Oct 10',
                      inv: 'INV-004',
                      amount: 15000,
                      status: 'Pending',
                      color: 'text-yellow-600'
                    }, {
                      date: 'Sep 15',
                      inv: 'INV-003',
                      amount: 20000,
                      status: 'Paid',
                      color: 'text-green-600'
                    }].map((r, i) => <div key={i} className="grid grid-cols-4 px-3 py-2 border-b border-gray-100 last:border-none items-center" data-id="element-2932">
                              <span className="text-gray-500" data-id="element-2933">{r.date}</span>
                              <span className="text-trustopay-navy font-medium" data-id="element-2934">
                                {r.inv}
                              </span>
                              <span className="text-right text-trustopay-navy" data-id="element-2935">
                                {formatINR(r.amount)}
                              </span>
                              <span className={cn('text-right font-bold text-[10px]', r.color)} data-id="element-2936">
                                {r.status}
                              </span>
                            </div>)}
                        </div>
                      </div>
                    </div>}

                  <div className="mt-5 pt-3 border-t border-gray-100" data-id="element-2937">
                    <p className="text-[9px] text-gray-400 text-center" data-id="element-2938">
                      Generated on {new Date().toLocaleDateString()} • Trustopay
                      India
                    </p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-trustopay-purple via-purple-400 to-trustopay-purple" data-id="element-2939" />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0" data-id="element-2940">
              <div className="flex gap-3" data-id="element-2941">
                <Button variant="outline" className="flex-1 gap-2" data-id="element-2942">
                  <FileDown size={16} data-id="element-2943" /> PDF
                </Button>
                <Button className="flex-1 gap-2" data-id="element-2944">
                  <Share2 size={16} data-id="element-2945" /> Share
                </Button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}