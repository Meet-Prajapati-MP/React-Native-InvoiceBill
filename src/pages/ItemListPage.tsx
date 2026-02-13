import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

interface Item {
  id: string;
  name: string;
  rate: number;
  description?: string;
}

interface ItemListPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Website Design', rate: 15000, description: 'Full website design and development' },
  { id: '2', name: 'Logo Design', rate: 5000, description: 'Professional logo with brand guidelines' },
];

export function ItemListPage({ isOpen, onClose }: ItemListPageProps) {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setRate('');
    setDescription('');
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setRate(String(item.rate));
    setDescription(item.description || '');
    setShowForm(true);
  };

  const handleCancel = () => resetForm();

  const handleSave = () => {
    const rateNum = parseInt(rate.replace(/[^0-9]/g, ''), 10) || 0;
    if (!name.trim()) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId ? { ...i, name: name.trim(), rate: rateNum, description: description.trim() || undefined } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now().toString(), name: name.trim(), rate: rateNum, description: description.trim() || undefined },
      ]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item List</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {items.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <TouchableOpacity style={styles.itemContent} onPress={() => handleEdit(item)} activeOpacity={0.7}>
                <View style={styles.itemText}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemRate}>{formatINR(item.rate)}</Text>
                  {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.red500} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Card>
          ))}

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>
              <Input value={name} onChangeText={setName} placeholder="Item Name" />
              <Input value={rate} onChangeText={setRate} placeholder="Rate (₹)" keyboardType="numeric" />
              <Input value={description} onChangeText={setDescription} placeholder="Description (Optional)" />
              <View style={styles.formActions}>
                <Button variant="outline" onPress={handleCancel} style={styles.formBtn}>
                  Cancel
                </Button>
                <Button onPress={handleSave} style={styles.formBtn}>
                  Save Item
                </Button>
              </View>
            </View>
          )}

          {!showForm && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAddNew} activeOpacity={0.7}>
              <Ionicons name="add-outline" size={20} color={colors.purple} />
              <Text style={styles.addBtnText}>Add New Item</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  itemCard: { marginBottom: 12 },
  itemContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  itemText: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  itemRate: { fontSize: 16, fontWeight: '600', color: colors.purple, marginTop: 4 },
  itemDesc: { fontSize: 13, color: colors.gray500, marginTop: 4 },
  deleteBtn: { padding: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.purple,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: colors.purple },
  formCard: {
    marginTop: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.purple,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formBtn: { flex: 1 },
});
