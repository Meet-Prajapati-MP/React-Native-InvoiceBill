import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, AlertCircle, Loader2, FileText, Copy, Edit2, ChevronDown, X, Search, MoreVertical } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
interface TermsConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Term {
  id: string;
  title: string;
  content: string;
  category?: string;
  isDefault?: boolean;
  isCustom?: boolean;
}
const PREMADE_TEMPLATES: Term[] = [{
  id: 't1',
  title: 'Standard Payment Terms',
  content: `PAYMENT TERMS\n\nPayment is due within 30 days of the invoice date. Accepted payment methods include bank transfer, UPI, credit/debit card, and cheque.\n\nInvoice Date: [Date will be auto-filled]\nDue Date: [30 days from invoice date]\n\nFor bank transfers, please use the account details provided on this invoice.\n\nLate payments may be subject to interest charges as per our late payment policy.\n\nFor any payment-related queries, please contact us at [Your Contact].`,
  category: 'Payment',
  isCustom: false
}, {
  id: 't2',
  title: 'Late Payment Policy',
  content: `LATE PAYMENT POLICY\n\nInterest on Overdue Payments:\nAny payment not received by the due date will incur an interest charge of 2% per month (24% per annum) on the outstanding amount.\n\nGrace Period:\nA grace period of 3 business days is provided after the due date before interest charges apply.\n\nCalculation:\nInterest is calculated on a daily basis from the due date until the date of payment.\n\nMaximum Cap:\nTotal interest charges will not exceed 25% of the original invoice amount.\n\nPayment Priority:\nPartial payments will be applied first to interest charges, then to the principal amount.`,
  category: 'Policy',
  isCustom: false
}, {
  id: 't3',
  title: 'Net 15 Terms',
  content: `PAYMENT TERMS (NET 15)\n\nPayment is due within 15 days of the invoice date.\n\nQuick Payment Benefit:\nTo maintain our fast turnaround times and prioritize your projects, we require payment within 15 days.\n\nDue Date: [15 days from invoice date]\n\nAccepted payment methods: Bank transfer, UPI, cards, and online payment.\n\nFor urgent payment queries, contact us immediately.`,
  category: 'Payment',
  isCustom: false
}, {
  id: 't4',
  title: 'Net 60 Terms',
  content: `PAYMENT TERMS (NET 60)\n\nPayment is due within 60 days of the invoice date.\n\nExtended Payment Window:\nWe offer extended payment terms of 60 days to support your cash flow management.\n\nDue Date: [60 days from invoice date]\n\nPayment can be made via bank transfer, cheque, or online payment.\n\nPlease ensure payment is processed before the due date to avoid any service interruptions.`,
  category: 'Payment',
  isCustom: false
}, {
  id: 't5',
  title: 'Advance Payment Required',
  content: `ADVANCE PAYMENT TERMS\n\n50% Advance Payment:\nAn advance payment of 50% of the total invoice amount is required before commencement of work.\n\nBalance Payment:\nThe remaining 50% is due within 15 days of project completion or upon delivery, whichever is earlier.\n\nPayment Schedule:\n- Advance: 50% (₹[Amount]) - Due immediately\n- Balance: 50% (₹[Amount]) - Due on completion\n\nRefund Policy:\nAdvance payments are non-refundable once work has commenced.\n\nWork will begin only after receiving the advance payment confirmation.`,
  category: 'Payment',
  isCustom: false
}, {
  id: 't6',
  title: 'Milestone Payment Terms',
  content: `MILESTONE-BASED PAYMENT\n\nPayment Structure:\nPayments are released upon successful completion and approval of each project milestone.\n\nMilestone Payment Schedule:\n- Milestone 1: [Description] - ₹[Amount] - Due: [Date]\n- Milestone 2: [Description] - ₹[Amount] - Due: [Date]\n- Milestone 3: [Description] - ₹[Amount] - Due: [Date]\n\nApproval Process:\nEach milestone requires your written approval before payment is due. Payment must be made within 7 days of milestone approval.\n\nDelayed Payments:\nWork on subsequent milestones may be paused if payment for completed milestones is pending.`,
  category: 'Payment',
  isCustom: false
}, {
  id: 't7',
  title: 'Project Delivery Terms',
  content: `DELIVERY & PAYMENT TERMS\n\nPayment Before Delivery:\nFinal deliverables will be released only upon receipt of full payment.\n\nDelivery Timeline:\nFinal delivery will be made within 2 business days of payment confirmation.\n\nWhat You'll Receive:\n- All source files\n- Final deliverables in agreed formats\n- Documentation (if applicable)\n- Transfer of ownership rights\n\nInspection Period:\nYou have 7 days from delivery to report any issues or discrepancies. After this period, deliverables are considered accepted.`,
  category: 'Delivery',
  isCustom: false
}, {
  id: 't8',
  title: 'No Refund Policy',
  content: `REFUND POLICY\n\nAll Sales Are Final:\nAll payments made for services rendered are final and non-refundable.\n\nService Modifications:\nIf you wish to modify the scope of work, additional charges may apply. Original payment remains non-refundable.\n\nCancellation:\nIf you cancel the project after work has commenced, no refund will be provided for work completed up to that point.\n\nExceptional Circumstances:\nRefunds may be considered only in cases where we are unable to deliver the agreed services due to reasons within our control.`,
  category: 'Policy',
  isCustom: false
}, {
  id: 't9',
  title: 'Service Warranty',
  content: `SERVICE WARRANTY\n\n30-Day Warranty:\nWe provide a 30-day warranty on all services from the date of final delivery.\n\nWhat's Covered:\n- Bugs or errors in deliverables\n- Functionality issues as per agreed specifications\n- Technical defects\n\nWhat's Not Covered:\n- Changes to original scope\n- Issues arising from client modifications\n- Third-party service failures\n- Browser or platform updates (unless specified)\n\nClaiming Warranty:\nReport issues within the warranty period via email. We will address valid claims within 5 business days.`,
  category: 'Warranty',
  isCustom: false
}, {
  id: 't10',
  title: 'Cancellation Policy',
  content: `CANCELLATION POLICY\n\nCancellation Notice:\nA minimum of 48 hours' notice is required for cancellation of scheduled services or meetings.\n\nCancellation Charges:\n- More than 48 hours' notice: No charge\n- 24-48 hours' notice: 50% of invoice amount\n- Less than 24 hours' notice: 100% of invoice amount\n\nWork in Progress:\nFor ongoing projects, payment is due for all work completed up to the cancellation date.\n\nRefund Processing:\nIf any refund is applicable, it will be processed within 7-10 business days.\n\nRescheduling:\nWe offer one free reschedule if notified at least 24 hours in advance.`,
  category: 'Policy',
  isCustom: false
}];
export function TermsConditions({
  isOpen,
  onClose
}: TermsConditionsProps) {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [customTerms, setCustomTerms] = useState<Term[]>([]);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [previewTerm, setPreviewTerm] = useState<Term | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Payment Terms');
  const [formContent, setFormContent] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const handleCreateNew = () => {
    setEditingTerm(null);
    setFormTitle('');
    setFormCategory('Payment Terms');
    setFormContent('');
    setFormIsDefault(false);
    setFormErrors({});
    setView('create');
  };
  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormTitle(term.title);
    setFormCategory(term.category || 'Payment Terms');
    setFormContent(term.content);
    setFormIsDefault(term.isDefault || false);
    setFormErrors({});
    setView('edit');
  };
  const handleDuplicate = (term: Term) => {
    const newTerm: Term = {
      ...term,
      id: Date.now().toString(),
      title: `${term.title} (Copy)`,
      isCustom: true,
      isDefault: false
    };
    setCustomTerms([...customTerms, newTerm]);
    showSuccessToast('Term duplicated successfully! ✓');
  };
  const handleDelete = (id: string) => {
    setCustomTerms(customTerms.filter(t => t.id !== id));
    setDeleteConfirmId(null);
    showSuccessToast('Term deleted');
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim() || formTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!formContent.trim() || formContent.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSave = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setTimeout(() => {
      const newTerm: Term = {
        id: editingTerm ? editingTerm.id : Date.now().toString(),
        title: formTitle,
        content: formContent,
        category: formCategory,
        isDefault: formIsDefault,
        isCustom: true
      };
      if (editingTerm) {
        setCustomTerms(customTerms.map(t => t.id === editingTerm.id ? newTerm : t));
        showSuccessToast('Term updated! ✓');
      } else {
        setCustomTerms([...customTerms, newTerm]);
        showSuccessToast('Term created successfully! ✓');
      }
      setIsSaving(false);
      setView('list');
    }, 1000);
  };
  const showSuccessToast = (message: string) => {
    setShowToast({
      type: 'success',
      message
    });
    setTimeout(() => setShowToast(null), 2000);
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-3414">
      {/* Toast */}
      <AnimatePresence data-id="element-3415">
        {showToast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-3416">
            {showToast.type === 'success' ? <Check size={16} data-id="element-3417" /> : <AlertCircle size={16} data-id="element-3418" />}
            {showToast.message}
          </motion.div>}
      </AnimatePresence>

      {/* Main List View */}
      {view === 'list' && <>
          <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between" data-id="element-3419">
            <div className="flex items-center gap-3" data-id="element-3420">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-3421">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3422" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3423">
                Terms & Conditions
              </h2>
            </div>
            <button onClick={handleCreateNew} className="text-sm font-bold text-trustopay-purple flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors" data-id="element-3424">
              <Plus size={16} data-id="element-3425" /> New Term
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-24" data-id="element-3426">
            {/* Custom Terms Section */}
            <section className="space-y-4" data-id="element-3427">
              <div className="flex items-center justify-between" data-id="element-3428">
                <div data-id="element-3429">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3430">
                    MY CUSTOM TERMS
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-3431">
                    Terms you've created or customized
                  </p>
                </div>
              </div>

              {customTerms.length === 0 ? <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center" data-id="element-3432">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl" data-id="element-3433">
                    📝
                  </div>
                  <h3 className="text-sm font-bold text-trustopay-navy mb-1" data-id="element-3434">
                    No custom terms yet
                  </h3>
                  <p className="text-xs text-gray-500 mb-4" data-id="element-3435">
                    Create your own terms or customize a pre-made template to
                    get started
                  </p>
                  <Button variant="outline" size="sm" onClick={handleCreateNew} data-id="element-3436">
                    + Create New Term
                  </Button>
                </div> : <div className="space-y-3" data-id="element-3437">
                  {customTerms.map(term => <Card key={term.id} className="p-4" data-id="element-3438">
                      <div className="flex justify-between items-start mb-2" data-id="element-3439">
                        <h3 className="font-bold text-trustopay-navy" data-id="element-3440">
                          {term.title}
                        </h3>
                        {term.isDefault && <span className="text-[10px] font-bold bg-purple-100 text-trustopay-purple px-2 py-0.5 rounded-full" data-id="element-3441">
                            DEFAULT
                          </span>}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4" data-id="element-3442">
                        {term.content}
                      </p>

                      {deleteConfirmId === term.id ? <div className="bg-red-50 p-3 rounded-lg flex items-center justify-between" data-id="element-3443">
                          <span className="text-xs font-bold text-red-600" data-id="element-3444">
                            Delete this term?
                          </span>
                          <div className="flex gap-2" data-id="element-3445">
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs font-medium text-gray-600 hover:text-gray-800 px-2 py-1" data-id="element-3446">
                              Cancel
                            </button>
                            <button onClick={() => handleDelete(term.id)} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded" data-id="element-3447">
                              Delete
                            </button>
                          </div>
                        </div> : <div className="flex gap-2 border-t border-gray-100 pt-3" data-id="element-3448">
                          <button onClick={() => handleEdit(term)} className="flex-1 text-xs font-medium text-trustopay-purple hover:bg-purple-50 py-1.5 rounded transition-colors flex items-center justify-center gap-1" data-id="element-3449">
                            <Edit2 size={12} data-id="element-3450" /> Edit
                          </button>
                          <div className="w-px bg-gray-100" data-id="element-3451" />
                          <button onClick={() => handleDuplicate(term)} className="flex-1 text-xs font-medium text-gray-600 hover:bg-gray-50 py-1.5 rounded transition-colors flex items-center justify-center gap-1" data-id="element-3452">
                            <Copy size={12} data-id="element-3453" /> Duplicate
                          </button>
                          <div className="w-px bg-gray-100" data-id="element-3454" />
                          <button onClick={() => setDeleteConfirmId(term.id)} className="flex-1 text-xs font-medium text-red-500 hover:bg-red-50 py-1.5 rounded transition-colors flex items-center justify-center gap-1" data-id="element-3455">
                            <Trash2 size={12} data-id="element-3456" /> Delete
                          </button>
                        </div>}
                    </Card>)}
                </div>}
            </section>

            {/* Pre-made Templates Section */}
            <section className="space-y-4" data-id="element-3457">
              <div className="flex items-center justify-between" data-id="element-3458">
                <div data-id="element-3459">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3460">
                    PRE-MADE TEMPLATES
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-3461">
                    Ready to use - click to customize
                  </p>
                </div>
              </div>

              <div className="grid gap-3" data-id="element-3462">
                {PREMADE_TEMPLATES.map(template => <Card key={template.id} className="p-4 hover:border-trustopay-purple/30 transition-colors" data-id="element-3463">
                    <div className="flex items-start gap-3 mb-3" data-id="element-3464">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400" data-id="element-3465">
                        <FileText size={16} data-id="element-3466" />
                      </div>
                      <div data-id="element-3467">
                        <h3 className="font-bold text-trustopay-navy text-sm" data-id="element-3468">
                          {template.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1" data-id="element-3469">
                          {template.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-gray-100 pt-3" data-id="element-3470">
                      <button onClick={() => setPreviewTerm(template)} className="flex-1 text-xs font-medium text-gray-600 hover:bg-gray-50 py-1.5 rounded transition-colors border border-gray-200" data-id="element-3471">
                        Preview
                      </button>
                      <button onClick={() => {
                  handleDuplicate(template); // "Use This" effectively duplicates it to custom
                }} className="flex-1 text-xs font-bold text-trustopay-purple hover:bg-purple-50 py-1.5 rounded transition-colors border border-trustopay-purple" data-id="element-3472">
                        Use This
                      </button>
                      <button onClick={() => {
                  setEditingTerm(null); // Treat as new based on template
                  setFormTitle(template.title);
                  setFormCategory(template.category || 'Payment Terms');
                  setFormContent(template.content);
                  setFormIsDefault(false);
                  setFormErrors({});
                  setView('create');
                }} className="flex-1 text-xs font-medium text-trustopay-purple hover:bg-purple-50 py-1.5 rounded transition-colors" data-id="element-3473">
                        Customize
                      </button>
                    </div>
                  </Card>)}
              </div>
            </section>
          </div>
        </>}

      {/* Create/Edit View */}
      {(view === 'create' || view === 'edit') && <div className="flex flex-col h-full bg-gray-50" data-id="element-3474">
          <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between" data-id="element-3475">
            <div className="flex items-center gap-3" data-id="element-3476">
              <button onClick={() => setView('list')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-3477">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3478" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3479">
                {view === 'create' ? 'Create Term' : 'Edit Term'}
              </h2>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="text-sm font-bold text-trustopay-purple hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50" data-id="element-3480">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-3481">
            <div className="space-y-4" data-id="element-3482">
              <Input label="Term Name *" placeholder="e.g., My Late Payment Policy" value={formTitle} onChange={e => setFormTitle(e.target.value)} error={formErrors.title} data-id="element-3483" />

              <div data-id="element-3484">
                <label className="mb-1.5 block text-sm font-medium text-gray-700" data-id="element-3485">
                  Category
                </label>
                <div className="relative" data-id="element-3486">
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple appearance-none" data-id="element-3487">
                    <option value="Payment Terms" data-id="element-3488">Payment Terms</option>
                    <option value="Late Payment Policy" data-id="element-3489">
                      Late Payment Policy
                    </option>
                    <option value="Delivery Terms" data-id="element-3490">Delivery Terms</option>
                    <option value="Cancellation Policy" data-id="element-3491">
                      Cancellation Policy
                    </option>
                    <option value="Warranty Terms" data-id="element-3492">Warranty Terms</option>
                    <option value="Refund Policy" data-id="element-3493">Refund Policy</option>
                    <option value="Service Terms" data-id="element-3494">Service Terms</option>
                    <option value="Other" data-id="element-3495">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-3496" />
                </div>
              </div>

              <div data-id="element-3497">
                <label className="mb-1.5 block text-sm font-medium text-gray-700" data-id="element-3498">
                  Term Content *
                </label>
                <div className="relative" data-id="element-3499">
                  <textarea value={formContent} onChange={e => setFormContent(e.target.value)} className={cn('w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple min-h-[200px] resize-none', formErrors.content && 'border-red-500 focus:ring-red-500')} placeholder="Enter your terms and conditions here..." data-id="element-3500" />
                  <div className="absolute bottom-3 right-3 text-[10px] text-gray-400" data-id="element-3501">
                    {formContent.length} / 2000
                  </div>
                </div>
                {formErrors.content && <p className="mt-1 text-xs text-red-500" data-id="element-3502">
                    {formErrors.content}
                  </p>}

                {/* Simple Toolbar Hint */}
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1" data-id="element-3503">
                  {['{invoice_number}', '{due_date}', '{amount}'].map(tag => <button key={tag} onClick={() => setFormContent(prev => prev + ' ' + tag)} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border border-gray-200 whitespace-nowrap" data-id="element-3504">
                      {tag}
                    </button>)}
                </div>
              </div>

              <Card className="p-4 flex items-center justify-between" data-id="element-3505">
                <div data-id="element-3506">
                  <p className="text-sm font-medium text-trustopay-navy" data-id="element-3507">
                    Apply to new invoices
                  </p>
                  <p className="text-xs text-gray-500" data-id="element-3508">
                    Auto-add to all new invoices
                  </p>
                </div>
                <button onClick={() => setFormIsDefault(!formIsDefault)} className={cn('w-11 h-6 rounded-full p-1 transition-colors duration-200', formIsDefault ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-3509">
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', formIsDefault ? 'translate-x-5' : 'translate-x-0')} data-id="element-3510" />
                </button>
              </Card>

              <div className="pt-4" data-id="element-3511">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-3512">
                  PREVIEW
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" data-id="element-3513">
                  <h4 className="font-bold text-trustopay-navy text-sm uppercase mb-2" data-id="element-3514">
                    {formTitle || 'Term Title'}
                  </h4>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed" data-id="element-3515">
                    {formContent || 'Term content will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Preview Modal */}
      <AnimatePresence data-id="element-3516">
        {previewTerm && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} className="fixed inset-0 z-[60] bg-white flex flex-col" data-id="element-3517">
            <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between" data-id="element-3518">
              <h2 className="font-bold text-lg text-trustopay-navy truncate pr-4" data-id="element-3519">
                {previewTerm.title}
              </h2>
              <button onClick={() => setPreviewTerm(null)} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-3520">
                <X size={24} className="text-gray-500" data-id="element-3521" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50" data-id="element-3522">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm min-h-[50vh]" data-id="element-3523">
                <h3 className="font-bold text-trustopay-navy text-base uppercase mb-4 border-b border-gray-100 pb-2" data-id="element-3524">
                  {previewTerm.title}
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" data-id="element-3525">
                  {previewTerm.content}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex gap-3" data-id="element-3526">
              <Button variant="outline" className="flex-1" onClick={() => {
            setPreviewTerm(null);
            // Customize logic
            setEditingTerm(null);
            setFormTitle(previewTerm.title);
            setFormCategory(previewTerm.category || 'Payment Terms');
            setFormContent(previewTerm.content);
            setFormIsDefault(false);
            setFormErrors({});
            setView('create');
          }} data-id="element-3527">
                Customize
              </Button>
              <Button className="flex-1" onClick={() => {
            handleDuplicate(previewTerm);
            setPreviewTerm(null);
          }} data-id="element-3528">
                Use This
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}