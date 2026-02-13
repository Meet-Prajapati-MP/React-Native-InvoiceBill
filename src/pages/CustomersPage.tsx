import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { colors } from '../theme/colors';

interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
  color: string;
}

const initialCustomers: Customer[] = [
  { id: '1', name: 'Aditya Roy', phone: '+91 98765 43210', initials: 'AR', color: 'blue' },
  { id: '2', name: 'Amit Kumar', phone: '+91 98765 12345', initials: 'AK', color: 'green' },
  { id: '3', name: 'Deepak Singh', phone: '+91 91234 56789', initials: 'DS', color: 'purple' },
  { id: '4', name: 'Karan Malhotra', phone: '+91 99887 76655', initials: 'KM', color: 'orange' },
  { id: '5', name: 'Manish Gupta', phone: '+91 88776 65544', initials: 'MG', color: 'teal' },
  { id: '6', name: 'Neha Patel', phone: '+91 77665 54433', initials: 'NP', color: 'pink' },
  { id: '7', name: 'Priya Sharma', phone: '+91 66554 43322', initials: 'PS', color: 'indigo' },
  { id: '8', name: 'Rahul Verma', phone: '+91 55443 32211', initials: 'RV', color: 'red' },
  { id: '9', name: 'Sanjay Mehta', phone: '+91 99988 87776', initials: 'SM', color: 'yellow' },
  { id: '10', name: 'Vikram Singh', phone: '+91 88877 76665', initials: 'VS', color: 'cyan' },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: colors.blue100, text: colors.blue600 },
  green: { bg: colors.green100, text: colors.green600 },
  purple: { bg: colors.purple100, text: colors.purple },
  orange: { bg: colors.orange50, text: '#EA580C' },
  teal: { bg: '#CCFBF1', text: '#0D9488' },
  pink: { bg: '#FCE7F3', text: '#DB2777' },
  indigo: { bg: '#E0E7FF', text: '#4F46E5' },
  red: { bg: colors.red50, text: colors.red500 },
  yellow: { bg: '#FEF9C3', text: '#CA8A04' },
  cyan: { bg: '#CFFAFE', text: '#0891B2' },
};

interface CustomersPageProps {
  onSelectCustomer: (customer: Customer) => void;
  mode?: 'default' | 'select';
}

export function CustomersPage({ onSelectCustomer, mode = 'default' }: CustomersPageProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = customers.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  const grouped = filtered.reduce((acc, c) => {
    const letter = c.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {} as Record<string, Customer[]>);
  const sortedLetters = Object.keys(grouped).sort();

  const handleAddCustomer = () => {
    if (!newCustomerName || !newCustomerPhone) return;
    setIsAdding(true);
    setTimeout(() => {
      const initials = newCustomerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const colors_list = ['blue', 'green', 'purple', 'orange'];
      const color = colors_list[Math.floor(Math.random() * colors_list.length)];
      setCustomers([...customers, { id: Date.now().toString(), name: newCustomerName, phone: newCustomerPhone, initials, color }]);
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

  return (
    <View style={styles.container}>
      {mode !== 'select' && (
        <View style={styles.header}>
          <Text style={styles.title}>Customers</Text>
          <TouchableOpacity onPress={() => setShowAddCustomer(true)} style={styles.addBtn}>
            <Ionicons name="person-add-outline" size={24} color={colors.purple} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.searchWrap, mode === 'select' && styles.searchWrapSelect]}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={20} color={colors.gray400} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name, email, or phone"
            placeholderTextColor={colors.gray400}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sortedLetters.map(letter => (
          <View key={letter} style={styles.group}>
            <Text style={styles.letter}>{letter}</Text>
            {grouped[letter].map(customer => {
              const c = colorMap[customer.color] || colorMap.blue;
              return (
                <TouchableOpacity
                  key={customer.id}
                  onPress={() => onSelectCustomer(customer)}
                  style={styles.customerRow}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: c.bg }]}>
                    <Text style={[styles.avatarText, { color: c.text }]}>{customer.initials}</Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.customerPhone}>{customer.phone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>No customers found</Text>
        )}
      </ScrollView>
      <View style={{ height: 100 }} />

      <Modal visible={showAddCustomer} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddCustomer(false)}>
              <Ionicons name="chevron-back" size={24} color={colors.navy} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Customer</Text>
          </View>
          {showSuccess ? (
            <View style={styles.successView}>
              <View style={styles.successIcon}>
                <Text style={styles.successCheck}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Customer Added!</Text>
              <Text style={styles.successDesc}>You can now send invoices and payments to {newCustomerName}.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Input label="Customer Name" placeholder="Enter full name" value={newCustomerName} onChangeText={setNewCustomerName} />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={newCustomerPhone} onChangeText={setNewCustomerPhone} />
              <Input label="Email Address (Optional)" placeholder="name@example.com" value={newCustomerEmail} onChangeText={setNewCustomerEmail} />
              <Button onPress={handleAddCustomer} disabled={!newCustomerName || !newCustomerPhone || isAdding} style={styles.submitBtn}>
                {isAdding ? 'Adding...' : 'Add Customer'}
              </Button>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  searchWrapSelect: { paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy },
  addBtn: { padding: 8 },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    backgroundColor: colors.gray50,
    paddingLeft: 12,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    paddingRight: 12,
    fontSize: 16,
    color: colors.navy,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  group: { marginBottom: 24 },
  letter: { fontSize: 14, fontWeight: '700', color: colors.gray400, marginBottom: 12, marginLeft: 4 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 14, fontWeight: '700' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '600', color: colors.navy },
  customerPhone: { fontSize: 14, color: colors.gray500 },
  empty: { textAlign: 'center', paddingVertical: 48, color: colors.gray500 },
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  successView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCheck: { fontSize: 40, fontWeight: '700', color: colors.green600 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  successDesc: { fontSize: 16, color: colors.gray500, textAlign: 'center' },
  form: { flex: 1, padding: 20 },
  submitBtn: { marginTop: 24, height: 48 },
});
