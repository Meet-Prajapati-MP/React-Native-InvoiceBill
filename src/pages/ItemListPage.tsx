import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { AnimatedSection } from '../components/AnimatedSection';

interface Item {
  id: string;
  name: string;
  rate: number;
  description?: string;
}

/** Dummy items for review when API returns empty */
const DUMMY_ITEMS: Item[] = [
  { id: 'di1', name: 'Web Design - Landing Page', rate: 15000, description: 'Responsive landing page design' },
  { id: 'di2', name: 'Logo Design', rate: 5000, description: 'Brand logo and variations' },
  { id: 'di3', name: 'Consulting - Hourly', rate: 2500, description: 'Per hour consulting rate' },
  { id: 'di4', name: 'Mobile App Development', rate: 85000, description: 'Full-stack mobile app' },
  { id: 'di5', name: 'Content Writing', rate: 1500, description: 'Per 1000 words' },
  { id: 'di6', name: 'SEO Audit', rate: 8000, description: 'Full website audit' },
];

interface ItemListPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBeforeAddItem?: () => boolean;
}

export function ItemListPage({ isOpen, onClose, onBeforeAddItem }: ItemListPageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<(Item & { rate?: string })[]>('/items');
      const list = Array.isArray(data)
        ? data.map((i) => ({ ...i, rate: typeof i.rate === 'number' ? i.rate : parseFloat(String(i.rate || 0)) }))
        : [];
      setItems(list.length > 0 ? list : DUMMY_ITEMS);
    } catch {
      setItems(DUMMY_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchItems();
  }, [isOpen, fetchItems]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setRate('');
    setDescription('');
  };

  const handleAddNew = () => {
    if (onBeforeAddItem && !onBeforeAddItem()) return;
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

  const handleSave = async () => {
    const rateNum = parseFloat(rate.replace(/[^0-9.]/g, '')) || parseInt(rate.replace(/[^0-9]/g, ''), 10) || 0;
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.patch<Item>(`/items/${editingId}`, {
          name: name.trim(),
          rate: rateNum,
          description: description.trim() || undefined,
        });
        setItems((prev) => prev.map((i) => (i.id === editingId ? { ...data, rate: rateNum } : i)));
      } else {
        const { data } = await api.post<Item>('/items', {
          name: name.trim(),
          rate: rateNum,
          description: description.trim() || undefined,
        });
        setItems((prev) => [{ ...data, rate: rateNum }, ...prev]);
      }
      resetForm();
    } catch {
      /* show error in UI if needed */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
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
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.purple} />
            </View>
          )}
          {!loading && items.map((item, i) => (
            <AnimatedSection key={item.id} index={i} delay={0}>
            <Card style={styles.itemCard}>
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
            </AnimatedSection>
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
                <Button onPress={handleSave} style={styles.formBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Item'}
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
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
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
