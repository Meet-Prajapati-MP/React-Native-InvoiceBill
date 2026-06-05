import React, { useState } from 'react';
import { Search, ChevronRight, UserPlus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
  color: string;
}
const initialCustomers: Customer[] = [{
  id: '1',
  name: 'Aditya Roy',
  phone: '+91 98765 43210',
  initials: 'AR',
  color: 'bg-blue-100 text-blue-700'
}, {
  id: '2',
  name: 'Amit Kumar',
  phone: '+91 98765 12345',
  initials: 'AK',
  color: 'bg-green-100 text-green-700'
}, {
  id: '3',
  name: 'Deepak Singh',
  phone: '+91 91234 56789',
  initials: 'DS',
  color: 'bg-purple-100 text-purple-700'
}, {
  id: '4',
  name: 'Karan Malhotra',
  phone: '+91 99887 76655',
  initials: 'KM',
  color: 'bg-orange-100 text-orange-700'
}, {
  id: '5',
  name: 'Manish Gupta',
  phone: '+91 88776 65544',
  initials: 'MG',
  color: 'bg-teal-100 text-teal-700'
}, {
  id: '6',
  name: 'Neha Patel',
  phone: '+91 77665 54433',
  initials: 'NP',
  color: 'bg-pink-100 text-pink-700'
}, {
  id: '7',
  name: 'Priya Sharma',
  phone: '+91 66554 43322',
  initials: 'PS',
  color: 'bg-indigo-100 text-indigo-700'
}, {
  id: '8',
  name: 'Rahul Verma',
  phone: '+91 55443 32211',
  initials: 'RV',
  color: 'bg-red-100 text-red-700'
}, {
  id: '9',
  name: 'Sanjay Mehta',
  phone: '+91 99988 87776',
  initials: 'SM',
  color: 'bg-yellow-100 text-yellow-700'
}, {
  id: '10',
  name: 'Vikram Singh',
  phone: '+91 88877 76665',
  initials: 'VS',
  color: 'bg-cyan-100 text-cyan-700'
}];
interface CustomersPageProps {
  onSelectCustomer: (customer: Customer) => void;
  mode?: 'view' | 'select';
}
export function CustomersPage({
  onSelectCustomer,
  mode = 'view'
}: CustomersPageProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  // Add Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  // Group by first letter
  const groupedCustomers = filteredCustomers.reduce((acc, customer) => {
    const letter = customer.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(customer);
    return acc;
  }, {} as Record<string, Customer[]>);
  const sortedLetters = Object.keys(groupedCustomers).sort();
  const handleAddCustomer = () => {
    if (!newCustomerName || !newCustomerPhone) return;
    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      const initials = newCustomerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: newCustomerName,
        phone: newCustomerPhone,
        initials,
        color: randomColor
      };
      setCustomers([...customers, newCustomer]);
      setIsAdding(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowAddCustomer(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
      }, 1500);
    }, 1000);
  };
  return <div className="flex flex-col min-h-screen bg-white pb-24" data-id="element-3758">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100" data-id="element-3759">
        <div className="flex justify-between items-center mb-4" data-id="element-3760">
          <h1 className="text-2xl font-bold text-trustopay-navy" data-id="element-3761">
            {mode === 'select' ? 'Select Customer' : 'Customers'}
          </h1>
          {mode === 'view' && <button className="text-trustopay-purple p-2 hover:bg-purple-50 rounded-full transition-colors" onClick={() => setShowAddCustomer(true)} data-id="element-3762">
              <UserPlus size={24} data-id="element-3763" />
            </button>}
        </div>
        <div className="relative" data-id="element-3764">
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" data-id="element-3765" />
          <Input placeholder="Search by name, email, or phone" className="pl-10 bg-gray-50 border-none" value={search} onChange={e => setSearch(e.target.value)} data-id="element-3766" />
        </div>
      </div>

      {/* List */}
      <div className="px-5 py-2" data-id="element-3767">
        {sortedLetters.map(letter => <div key={letter} className="mb-6" data-id="element-3768">
            <h3 className="text-sm font-bold text-gray-400 mb-3 ml-1" data-id="element-3769">
              {letter}
            </h3>
            <div className="space-y-4" data-id="element-3770">
              {groupedCustomers[letter].map(customer => <motion.div key={customer.id} initial={{
            opacity: 0,
            y: 5
          }} animate={{
            opacity: 1,
            y: 0
          }} whileTap={{
            scale: 0.98
          }} onClick={() => onSelectCustomer(customer)} className="flex items-center justify-between cursor-pointer group" data-id="element-3771">
                  <div className="flex items-center gap-4" data-id="element-3772">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${customer.color}`} data-id="element-3773">
                      {customer.initials}
                    </div>
                    <div data-id="element-3774">
                      <p className="font-semibold text-trustopay-navy" data-id="element-3775">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-500" data-id="element-3776">{customer.phone}</p>
                    </div>
                  </div>
                  {mode === 'view' && <ChevronRight className="text-gray-300 group-hover:text-trustopay-purple transition-colors" size={20} data-id="element-3777" />}
                </motion.div>)}
            </div>
          </div>)}

        {filteredCustomers.length === 0 && <div className="text-center py-12 text-gray-500" data-id="element-3778">
            No customers found
          </div>}
      </div>

      {/* Add Customer Overlay */}
      <AnimatePresence data-id="element-3779">
        {showAddCustomer && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto" data-id="element-3780">
            <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-3781">
              <button onClick={() => setShowAddCustomer(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3782">
                <ChevronRight size={24} className="text-trustopay-navy rotate-180" data-id="element-3783" />
              </button>
              <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-3784">
                Add New Customer
              </h2>
            </div>

            {showSuccess ? <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" data-id="element-3785">
                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6" data-id="element-3786">
                  <Check size={40} strokeWidth={3} data-id="element-3787" />
                </motion.div>
                <h3 className="text-2xl font-bold text-trustopay-navy mb-2" data-id="element-3788">
                  Customer Added!
                </h3>
                <p className="text-gray-500" data-id="element-3789">
                  You can now send invoices and payments to {newCustomerName}.
                </p>
              </div> : <div className="flex-1 p-5 space-y-6" data-id="element-3790">
                <div className="space-y-4" data-id="element-3791">
                  <Input label="Customer Name" placeholder="Enter full name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} data-id="element-3792" />
                  <Input label="Phone Number" placeholder="+91 98765 43210" type="tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} data-id="element-3793" />
                  <Input label="Email Address (Optional)" placeholder="name@example.com" type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} data-id="element-3794" />
                </div>

                <Button className="w-full h-12 text-lg mt-8" onClick={handleAddCustomer} disabled={!newCustomerName || !newCustomerPhone || isAdding} data-id="element-3795">
                  {isAdding ? 'Adding...' : 'Add Customer'}
                </Button>
              </div>}
          </motion.div>}
      </AnimatePresence>
    </div>;
}