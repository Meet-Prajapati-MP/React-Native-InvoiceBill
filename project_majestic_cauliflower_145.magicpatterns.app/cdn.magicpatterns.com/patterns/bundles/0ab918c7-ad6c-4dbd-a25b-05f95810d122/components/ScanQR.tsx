import React, { useState } from 'react';
import { X, Flashlight, Image, QrCode, Search, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
interface ScanQRProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ScanQR({
  isOpen,
  onClose
}: ScanQRProps) {
  const [flash, setFlash] = useState(false);
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState('');
  return <AnimatePresence data-id="element-2946">
      {isOpen && <motion.div initial={{
      opacity: 0,
      y: '100%'
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: '100%'
    }} className="fixed inset-0 z-50 bg-black flex flex-col max-w-[430px] mx-auto" data-id="element-2947">
          {/* Header */}
          <div className="p-6 flex justify-between items-center z-10" data-id="element-2948">
            <h2 className="text-white font-bold text-lg" data-id="element-2949">
              {mode === 'scan' ? 'Scan QR Code' : 'Enter Details'}
            </h2>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md" data-id="element-2950">
              <X size={24} className="text-white" data-id="element-2951" />
            </button>
          </div>

          {mode === 'scan' ? <>
              {/* Camera Viewfinder */}
              <div className="flex-1 relative flex items-center justify-center" data-id="element-2952">
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" data-id="element-2953" />

                {/* Cutout */}
                <div className="relative w-64 h-64 z-10" data-id="element-2954">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-trustopay-purple rounded-tl-xl" data-id="element-2955" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-trustopay-purple rounded-tr-xl" data-id="element-2956" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-trustopay-purple rounded-bl-xl" data-id="element-2957" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-trustopay-purple rounded-br-xl" data-id="element-2958" />

                  {/* Scanning Line Animation */}
                  <motion.div animate={{
              top: ['0%', '100%', '0%']
            }} transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }} className="absolute left-0 right-0 h-0.5 bg-trustopay-purple shadow-[0_0_15px_rgba(124,58,237,0.8)]" data-id="element-2959" />
                </div>

                <p className="absolute bottom-24 text-white/80 text-sm font-medium z-10" data-id="element-2960">
                  Align QR code within the frame to pay
                </p>
              </div>

              {/* Controls */}
              <div className="p-8 bg-black z-10" data-id="element-2961">
                <div className="flex justify-center gap-12 mb-8" data-id="element-2962">
                  <button onClick={() => setFlash(!flash)} className="flex flex-col items-center gap-2 text-white/80 hover:text-white" data-id="element-2963">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${flash ? 'bg-white text-black border-white' : 'border-white/30'}`} data-id="element-2964">
                      <Flashlight size={20} data-id="element-2965" />
                    </div>
                    <span className="text-xs" data-id="element-2966">Flash</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white" data-id="element-2967">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/30" data-id="element-2968">
                      <Image size={20} data-id="element-2969" />
                    </div>
                    <span className="text-xs" data-id="element-2970">Gallery</span>
                  </button>
                </div>

                <button onClick={() => setMode('manual')} className="w-full py-4 rounded-xl bg-white/10 text-white font-medium backdrop-blur-md border border-white/10 flex items-center justify-center gap-2" data-id="element-2971">
                  <QrCode size={18} data-id="element-2972" />
                  Enter UPI ID Manually
                </button>
              </div>
            </> : <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} className="flex-1 bg-white rounded-t-3xl p-6 flex flex-col" data-id="element-2973">
              <div className="mb-6" data-id="element-2974">
                <label className="text-sm font-medium text-gray-700 mb-2 block" data-id="element-2975">
                  Enter UPI ID or Phone Number
                </label>
                <div className="relative" data-id="element-2976">
                  <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" data-id="element-2977" />
                  <Input placeholder="name@upi or +91..." className="pl-10" value={manualInput} onChange={e => setManualInput(e.target.value)} autoFocus data-id="element-2978" />
                </div>
              </div>

              <div className="flex-1" data-id="element-2979">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4" data-id="element-2980">
                  Recent
                </h3>
                <div className="space-y-4" data-id="element-2981">
                  {[{
              name: 'Priya Sharma',
              id: 'priya@upi',
              color: 'bg-blue-100 text-blue-700'
            }, {
              name: 'Rahul Verma',
              id: 'rahul@upi',
              color: 'bg-green-100 text-green-700'
            }, {
              name: 'Design Studio',
              id: 'design@hdfc',
              color: 'bg-purple-100 text-purple-700'
            }].map((contact, i) => <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" data-id="element-2982">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${contact.color}`} data-id="element-2983">
                        {contact.name.charAt(0)}
                      </div>
                      <div data-id="element-2984">
                        <p className="font-medium text-trustopay-navy" data-id="element-2985">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-2986">{contact.id}</p>
                      </div>
                    </div>)}
                </div>
              </div>

              <div className="flex gap-3 mt-4" data-id="element-2987">
                <Button variant="outline" className="flex-1" onClick={() => setMode('scan')} data-id="element-2988">
                  Back to Scan
                </Button>
                <Button className="flex-1" disabled={!manualInput} data-id="element-2989">
                  Proceed
                </Button>
              </div>
            </motion.div>}
        </motion.div>}
    </AnimatePresence>;
}