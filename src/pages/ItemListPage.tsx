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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AlertDialog } from '../components/ui/AlertDialog';
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
  const [deleteConfirm, setDeleteConfirm] = useState<Item | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<(Item & { rate?: string })[]>('/items');
      const list = Array.isArray(data)
        ? data.map((i) => ({ ...i, rate: typeof i.rate === 'number' ? i.rate : parseFloat(String(i.rate || 0)) }))
        : [];
      setItems(list);
    } catch {
      setItems([]);
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

  const handleDeleteClick = (item: Item) => setDeleteConfirm(item);

  const doDeleteItem = useCallback(async () => {
    const item = deleteConfirm;
    if (!item) return;
    setDeleteConfirm(null);
    try {
      await api.delete(`/items/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setAlertDialog({ title: 'Error', message: 'Failed to delete item. Please try again.' });
    }
  }, [deleteConfirm]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
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
          {!loading && items.length === 0 && (
            <View style={styles.emptyWrap}>
              <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
              <Text style={styles.emptyTitle}>No Items Yet</Text>
              <Text style={styles.emptySub}>Tap + to add your first item</Text>
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
                  onPress={() => handleDeleteClick(item)}
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

        <ConfirmDialog
          visible={!!deleteConfirm}
          title="Delete Item"
          message={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.name}"? This cannot be undone.` : ''}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive
          onConfirm={doDeleteItem}
          onCancel={() => setDeleteConfirm(null)}
        />

        <AlertDialog
          visible={!!alertDialog}
          title={alertDialog?.title ?? ''}
          message={alertDialog?.message ?? ''}
          onOK={() => setAlertDialog(null)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyImage: { width: 220, height: 220, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  emptySub: { fontSize: 15, color: colors.gray500 },
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
