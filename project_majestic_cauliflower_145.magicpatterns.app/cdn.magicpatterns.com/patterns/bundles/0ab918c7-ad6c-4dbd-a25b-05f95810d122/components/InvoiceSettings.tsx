import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Plus, Trash2, AlertCircle, Loader2, Settings, Edit2, GripVertical } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
interface InvoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}
type FormatComponentType = 'prefix' | 'year' | 'year_short' | 'month' | 'month_name' | 'day' | 'fy' | 'separator' | 'number' | 'suffix';
interface FormatComponent {
  id: string;
  type: FormatComponentType;
  value?: string;
  label: string;
}
export function InvoiceSettings({
  isOpen,
  onClose
}: InvoiceSettingsProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotes'>('invoices');
  const [formatType, setFormatType] = useState<'preset' | 'custom'>('preset');
  const [selectedTemplate, setSelectedTemplate] = useState('year-seq');
  const [startingNumber, setStartingNumber] = useState('001');
  const [resetOption, setResetOption] = useState('never');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);
  // Advanced Settings
  const [duplicateCheck, setDuplicateCheck] = useState('error');
  const [manualOverride, setManualOverride] = useState(false);
  const [padding, setPadding] = useState(3);
  const [skipDeleted, setSkipDeleted] = useState(true);
  // Custom Format Builder State
  const [customComponents, setCustomComponents] = useState<FormatComponent[]>([{
    id: '1',
    type: 'prefix',
    value: 'INV',
    label: 'Prefix'
  }, {
    id: '2',
    type: 'separator',
    value: '-',
    label: 'Separator'
  }, {
    id: '3',
    type: 'year',
    label: 'Year (YYYY)'
  }, {
    id: '4',
    type: 'separator',
    value: '-',
    label: 'Separator'
  }, {
    id: '5',
    type: 'number',
    label: 'Number'
  }]);
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  // Templates Definition
  const templates = [{
    id: 'seq',
    name: 'Sequential',
    example: 'INV-001, INV-002...'
  }, {
    id: 'year-seq',
    name: 'Year + Sequential',
    example: 'INV-2026-001, INV-2026-002...'
  }, {
    id: 'month-year-seq',
    name: 'Month-Year + Sequential',
    example: 'INV-FEB26-001, INV-FEB26-002...'
  }, {
    id: 'fy-seq',
    name: 'Financial Year + Sequential',
    example: 'INV-FY26-001, INV-FY26-002...'
  }, {
    id: 'date-seq',
    name: 'Date + Sequential',
    example: 'INV-20260210-001, INV-20260210-002...'
  }];
  // Helper to generate preview string
  const generatePreview = (offset = 0) => {
    const num = parseInt(startingNumber) + offset;
    const paddedNum = num.toString().padStart(padding, '0');
    const date = new Date();
    const year = date.getFullYear();
    const yearShort = year.toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', {
      month: 'short'
    }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    // Calculate FY (assuming April 1 start)
    const fy = date.getMonth() >= 3 ? `FY${yearShort}-${(parseInt(yearShort) + 1).toString()}` : `FY${(parseInt(yearShort) - 1).toString()}-${yearShort}`;
    const fyShort = date.getMonth() >= 3 ? `FY${parseInt(yearShort) + 1}` : `FY${yearShort}`;
    let prefix = activeTab === 'invoices' ? 'INV' : 'QUO';
    if (formatType === 'preset') {
      switch (selectedTemplate) {
        case 'seq':
          return `${prefix}-${paddedNum}`;
        case 'year-seq':
          return `${prefix}-${year}-${paddedNum}`;
        case 'month-year-seq':
          return `${prefix}-${monthName}${yearShort}-${paddedNum}`;
        case 'fy-seq':
          return `${prefix}-${fyShort}-${paddedNum}`;
        case 'date-seq':
          return `${prefix}-${year}${month}${day}-${paddedNum}`;
        default:
          return `${prefix}-${paddedNum}`;
      }
    } else {
      return customComponents.map(c => {
        switch (c.type) {
          case 'prefix':
            return c.value;
          case 'separator':
            return c.value;
          case 'year':
            return year;
          case 'year_short':
            return yearShort;
          case 'month':
            return month;
          case 'month_name':
            return monthName;
          case 'day':
            return day;
          case 'fy':
            return fyShort;
          case 'number':
            return paddedNum;
          case 'suffix':
            return c.value;
          default:
            return '';
        }
      }).join('');
    }
  };
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast({
        type: 'success',
        message: 'Invoice settings saved! ✓'
      });
      setTimeout(() => {
        setShowToast(null);
        onClose();
      }, 2000);
    }, 1500);
  };
  const addCustomComponent = (type: FormatComponentType, label: string, defaultValue?: string) => {
    setCustomComponents([...customComponents, {
      id: Date.now().toString(),
      type,
      label,
      value: defaultValue
    }]);
    setShowComponentPicker(false);
  };
  const removeCustomComponent = (id: string) => {
    setCustomComponents(customComponents.filter(c => c.id !== id));
  };
  const updateCustomComponent = (id: string, value: string) => {
    setCustomComponents(customComponents.map(c => c.id === id ? {
      ...c,
      value
    } : c));
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-1346">
      {/* Toast */}
      <AnimatePresence data-id="element-1347">
        {showToast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', showToast.type === 'success' ? 'bg-green-600' : 'bg-yellow-600')} data-id="element-1348">
            {showToast.type === 'success' ? <Check size={16} data-id="element-1349" /> : <AlertCircle size={16} data-id="element-1350" />}
            {showToast.message}
          </motion.div>}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-0 border-b border-gray-100 sticky top-0 z-10" data-id="element-1351">
        <div className="flex items-center gap-3 mb-4" data-id="element-1352">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-1353">
            <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-1354" />
          </button>
          <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-1355">
            Invoice Settings
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-8" data-id="element-1356">
          <button onClick={() => setActiveTab('invoices')} className={cn('pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'invoices' ? 'text-trustopay-purple border-trustopay-purple' : 'text-gray-500 border-transparent hover:text-gray-700')} data-id="element-1357">
            Invoices
          </button>
          <button onClick={() => setActiveTab('quotes')} className={cn('pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'quotes' ? 'text-trustopay-purple border-trustopay-purple' : 'text-gray-500 border-transparent hover:text-gray-700')} data-id="element-1358">
            Quotes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32" data-id="element-1359">
        {/* Section 1: Numbering Format */}
        <section className="space-y-4" data-id="element-1360">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1361">
            NUMBERING FORMAT
          </p>

          <div className="space-y-3" data-id="element-1362">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white cursor-pointer" data-id="element-1363">
              <input type="radio" name="formatType" checked={formatType === 'preset'} onChange={() => setFormatType('preset')} className="text-trustopay-purple focus:ring-trustopay-purple w-4 h-4" data-id="element-1364" />
              <span className="font-medium text-trustopay-navy" data-id="element-1365">
                Use Preset Template
              </span>
            </label>

            {formatType === 'preset' && <div className="pl-7" data-id="element-1366">
                <div className="relative" data-id="element-1367">
                  <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full h-12 pl-3 pr-10 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-trustopay-purple text-sm" data-id="element-1368">
                    {templates.map(t => <option key={t.id} value={t.id} data-id="element-1369">
                        {t.name} ({t.example.split(',')[0]})
                      </option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} data-id="element-1370" />
                </div>
                <p className="text-xs text-gray-500 mt-2" data-id="element-1371">
                  Example:{' '}
                  {templates.find(t => t.id === selectedTemplate)?.example}
                </p>
              </div>}

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white cursor-pointer" data-id="element-1372">
              <input type="radio" name="formatType" checked={formatType === 'custom'} onChange={() => setFormatType('custom')} className="text-trustopay-purple focus:ring-trustopay-purple w-4 h-4" data-id="element-1373" />
              <span className="font-medium text-trustopay-navy" data-id="element-1374">
                Custom Format
              </span>
            </label>

            {formatType === 'custom' && <div className="pl-7 space-y-3" data-id="element-1375">
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4" data-id="element-1376">
                  <div className="flex justify-between items-center" data-id="element-1377">
                    <p className="text-xs font-bold text-gray-500 uppercase" data-id="element-1378">
                      Build Format
                    </p>
                    <div className="relative" data-id="element-1379">
                      <button onClick={() => setShowComponentPicker(!showComponentPicker)} className="text-xs font-bold text-trustopay-purple flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded" data-id="element-1380">
                        <Plus size={12} data-id="element-1381" /> Add
                      </button>
                      {showComponentPicker && <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowComponentPicker(false)} data-id="element-1382" />
                          <div className="absolute right-0 top-8 w-48 bg-white shadow-xl rounded-lg border border-gray-100 z-20 py-1 max-h-60 overflow-y-auto" data-id="element-1383">
                            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase" data-id="element-1384">
                              Text
                            </p>
                            <button onClick={() => addCustomComponent('prefix', 'Prefix', 'INV')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1385">
                              Prefix Text
                            </button>
                            <button onClick={() => addCustomComponent('separator', 'Separator', '-')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1386">
                              Separator
                            </button>
                            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase border-t border-gray-50 mt-1" data-id="element-1387">
                              Dates
                            </p>
                            <button onClick={() => addCustomComponent('year', 'Year (YYYY)')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1388">
                              Year (2026)
                            </button>
                            <button onClick={() => addCustomComponent('year_short', 'Year Short (YY)')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1389">
                              Year Short (26)
                            </button>
                            <button onClick={() => addCustomComponent('month_name', 'Month (MMM)')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1390">
                              Month (FEB)
                            </button>
                            <button onClick={() => addCustomComponent('fy', 'Financial Year')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" data-id="element-1391">
                              Financial Year
                            </button>
                          </div>
                        </>}
                    </div>
                  </div>

                  <div className="space-y-2" data-id="element-1392">
                    {customComponents.map((comp, idx) => <div key={comp.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200" data-id="element-1393">
                        <GripVertical size={14} className="text-gray-400 cursor-move" data-id="element-1394" />
                        <div className="flex-1" data-id="element-1395">
                          <p className="text-xs font-medium text-gray-700" data-id="element-1396">
                            {comp.label}
                          </p>
                          {(comp.type === 'prefix' || comp.type === 'separator' || comp.type === 'suffix') && <input type="text" value={comp.value} onChange={e => updateCustomComponent(comp.id, e.target.value)} className="w-full mt-1 text-xs border-b border-gray-300 bg-transparent focus:outline-none focus:border-trustopay-purple" data-id="element-1397" />}
                        </div>
                        {comp.type !== 'number' && <button onClick={() => removeCustomComponent(comp.id)} className="text-gray-400 hover:text-red-500" data-id="element-1398">
                            <Trash2 size={14} data-id="element-1399" />
                          </button>}
                      </div>)}
                  </div>
                </div>
              </div>}
          </div>
        </section>

        {/* Section 2: Starting Number */}
        <section className="space-y-4" data-id="element-1400">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1401">
            STARTING NUMBER
          </p>
          <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-1402">
            <label className="block text-sm font-medium text-trustopay-navy mb-2" data-id="element-1403">
              Start Numbering From
            </label>
            <Input type="number" value={startingNumber} onChange={e => setStartingNumber(e.target.value)} className="font-mono text-lg" data-id="element-1404" />
            <p className="text-sm mt-3 text-gray-600" data-id="element-1405">
              Your next invoice will be:{' '}
              <span className="font-bold text-trustopay-purple" data-id="element-1406">
                {generatePreview()}
              </span>
            </p>
            <p className="text-[11px] text-gray-400 italic mt-2" data-id="element-1407">
              Set this to continue from your last invoice number if migrating
              from another system
            </p>
          </div>
        </section>

        {/* Section 3: Auto-Reset */}
        <section className="space-y-4" data-id="element-1408">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1409">
            AUTO-RESET
          </p>
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3" data-id="element-1410">
            <p className="text-sm font-medium text-trustopay-navy mb-2" data-id="element-1411">
              Automatically reset numbering:
            </p>
            {[{
            id: 'never',
            label: 'Never (Continuous numbering)'
          }, {
            id: 'fy',
            label: 'Every Financial Year (April 1)'
          }, {
            id: 'year',
            label: 'Every Calendar Year (January 1)'
          }, {
            id: 'month',
            label: 'Every Month'
          }].map(opt => <label key={opt.id} className="flex items-center gap-3 cursor-pointer" data-id="element-1412">
                <input type="radio" name="resetOption" checked={resetOption === opt.id} onChange={() => setResetOption(opt.id)} className="text-trustopay-purple focus:ring-trustopay-purple w-4 h-4" data-id="element-1413" />
                <span className="text-sm text-gray-700" data-id="element-1414">{opt.label}</span>
              </label>)}
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2" data-id="element-1415">
              {resetOption === 'never' ? 'Numbering will continue indefinitely (e.g., 001, 002, 003...)' : 'Numbering will reset to 001 at the start of each period.'}
            </p>
          </div>
        </section>

        {/* Section 4: Preview */}
        <section className="space-y-4" data-id="element-1416">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1417">
            PREVIEW
          </p>
          <Card className="p-5 bg-white border-trustopay-purple/20 shadow-sm" data-id="element-1418">
            <p className="text-sm text-gray-500 mb-4" data-id="element-1419">
              Your invoices will be numbered as:
            </p>
            <div className="space-y-3 font-mono" data-id="element-1420">
              <div className="flex justify-between items-center" data-id="element-1421">
                <span className="text-sm text-gray-400" data-id="element-1422">Current</span>
                <span className="text-base text-gray-500" data-id="element-1423">
                  {generatePreview(-1)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-purple-50 p-2 rounded-lg -mx-2" data-id="element-1424">
                <span className="text-sm font-bold text-trustopay-purple" data-id="element-1425">
                  Next
                </span>
                <span className="text-lg font-bold text-trustopay-purple" data-id="element-1426">
                  {generatePreview(0)}
                </span>
              </div>
              <div className="flex justify-between items-center" data-id="element-1427">
                <span className="text-sm text-gray-400" data-id="element-1428">Future</span>
                <span className="text-base text-gray-400" data-id="element-1429">
                  {generatePreview(1)}
                </span>
              </div>
              <div className="flex justify-between items-center" data-id="element-1430">
                <span className="text-sm text-gray-400" data-id="element-1431"></span>
                <span className="text-base text-gray-400" data-id="element-1432">
                  {generatePreview(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100" data-id="element-1433">
              <p className="text-xs text-gray-400" data-id="element-1434">
                Last invoice created:{' '}
                <span className="font-medium text-gray-600" data-id="element-1435">
                  {generatePreview(-1)}
                </span>{' '}
                on Feb 10, 2026
              </p>
            </div>
          </Card>
        </section>

        {/* Section 5: Advanced Settings */}
        <section className="space-y-4" data-id="element-1436">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-trustopay-purple transition-colors" data-id="element-1437">
            ADVANCED SETTINGS
            {showAdvanced ? <ChevronUp size={14} data-id="element-1438" /> : <ChevronDown size={14} data-id="element-1439" />}
          </button>

          <AnimatePresence data-id="element-1440">
            {showAdvanced && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} className="overflow-hidden" data-id="element-1441">
                <Card className="p-4 space-y-5" data-id="element-1442">
                  <div data-id="element-1443">
                    <label className="block text-sm font-medium text-trustopay-navy mb-2" data-id="element-1444">
                      If duplicate number detected:
                    </label>
                    <div className="space-y-2" data-id="element-1445">
                      <label className="flex items-center gap-3 cursor-pointer" data-id="element-1446">
                        <input type="radio" checked={duplicateCheck === 'error'} onChange={() => setDuplicateCheck('error')} className="text-trustopay-purple w-4 h-4" data-id="element-1447" />
                        <span className="text-sm text-gray-700" data-id="element-1448">
                          Show error (Recommended)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer" data-id="element-1449">
                        <input type="radio" checked={duplicateCheck === 'auto'} onChange={() => setDuplicateCheck('auto')} className="text-trustopay-purple w-4 h-4" data-id="element-1450" />
                        <span className="text-sm text-gray-700" data-id="element-1451">
                          Auto-increment to next available
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-1452">
                    <div data-id="element-1453">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1454">
                        Allow manual override
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1455">
                        Edit invoice number when creating
                      </p>
                    </div>
                    <button onClick={() => setManualOverride(!manualOverride)} className={cn('w-11 h-6 rounded-full p-1 transition-colors duration-200', manualOverride ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1456">
                      <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', manualOverride ? 'translate-x-5' : 'translate-x-0')} data-id="element-1457" />
                    </button>
                  </div>

                  <div data-id="element-1458">
                    <div className="flex justify-between items-center mb-2" data-id="element-1459">
                      <label className="text-sm font-medium text-trustopay-navy" data-id="element-1460">
                        Number Padding
                      </label>
                      <select value={padding} onChange={e => setPadding(parseInt(e.target.value))} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-trustopay-purple" data-id="element-1461">
                        <option value="2" data-id="element-1462">2 digits (01)</option>
                        <option value="3" data-id="element-1463">3 digits (001)</option>
                        <option value="4" data-id="element-1464">4 digits (0001)</option>
                        <option value="5" data-id="element-1465">5 digits (00001)</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500" data-id="element-1466">
                      Minimum number of digits for the sequence number
                    </p>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-1467">
                    <div data-id="element-1468">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1469">
                        Skip deleted numbers
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1470">
                        Keep gaps for deleted invoices
                      </p>
                    </div>
                    <button onClick={() => setSkipDeleted(!skipDeleted)} className={cn('w-11 h-6 rounded-full p-1 transition-colors duration-200', skipDeleted ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1471">
                      <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', skipDeleted ? 'translate-x-5' : 'translate-x-0')} data-id="element-1472" />
                    </button>
                  </div>
                </Card>
              </motion.div>}
          </AnimatePresence>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 z-20" data-id="element-1473">
        <Button className="w-full h-12 text-base font-bold shadow-md" onClick={handleSave} disabled={isSaving} data-id="element-1474">
          {isSaving ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-1475" />
              Saving...
            </> : 'Save Invoice Settings'}
        </Button>
      </div>
    </div>;
}