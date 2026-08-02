import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData, DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from '../src/context/DataContext';
import { TextField } from '../src/components/TextField';
import { PrimaryButton } from '../src/components/Buttons';
import { colors, radii, shadow, DEFAULT_CATEGORY_LIMIT, NEW_CATEGORY_HUES } from '../src/constants/theme';
import { categoryColor, categorySoft } from '../src/utils/oklch';
import type { Account, Category } from '../src/types';

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const { completeSetup } = useData();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const arsAccounts = DEFAULT_ACCOUNTS.filter((a) => a.currency === 'ARS');
  const usdAccounts = DEFAULT_ACCOUNTS.filter((a) => a.currency === 'USD');

  const setVal = (id: string, raw: string) => {
    setVals((prev) => ({ ...prev, [id]: raw.replace(/[^\d]/g, '') }));
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const hue = NEW_CATEGORY_HUES[categories.length % NEW_CATEGORY_HUES.length];
    setCategories((prev) => [...prev, { id: 'c' + Date.now(), name, hue }]);
    setNewCatName('');
  };

  const handleStart = async () => {
    setSubmitting(true);
    try {
      const accounts: Account[] = DEFAULT_ACCOUNTS.map((a) => ({
        ...a,
        baseBalance: parseInt(vals[a.id] || '0', 10) || 0,
      }));
      const limits = Object.fromEntries(categories.map((c) => [c.id, DEFAULT_CATEGORY_LIMIT]));
      await completeSetup(accounts, categories, limits);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
    >
      <Text style={styles.title}>¡Hola!</Text>
      <Text style={styles.subtitle}>Antes de empezar, contanos cuánta plata tenés en cada cuenta.</Text>

      <Text style={styles.sectionLabel}>En pesos</Text>
      <View style={styles.card}>
        {arsAccounts.map((a, i) => (
          <View key={a.id} style={[styles.row, i === arsAccounts.length - 1 && styles.rowLast]}>
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.rowName}>{a.name}</Text>
            </View>
            <TextField
              value={vals[a.id] ?? ''}
              onChangeText={(v) => setVal(a.id, v)}
              placeholder="$ 0"
              keyboardType="numeric"
              align="right"
              bg={colors.appBg}
              style={styles.rowInput}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>En dólares</Text>
      <View style={styles.card}>
        {usdAccounts.map((a, i) => (
          <View key={a.id} style={[styles.row, i === usdAccounts.length - 1 && styles.rowLast]}>
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.rowName}>{a.name}</Text>
            </View>
            <TextField
              value={vals[a.id] ?? ''}
              onChangeText={(v) => setVal(a.id, v)}
              placeholder="US$ 0"
              keyboardType="numeric"
              align="right"
              bg={colors.appBg}
              style={styles.rowInput}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Tus categorías</Text>
      <View style={styles.chipsWrap}>
        {categories.map((c) => (
          <View key={c.id} style={[styles.catChip, { backgroundColor: categorySoft(c.hue) }]}>
            <Text style={[styles.catChipLabel, { color: categoryColor(c.hue) }]}>{c.name}</Text>
            <Pressable onPress={() => removeCategory(c.id)} style={styles.catChipRemove}>
              <Text style={styles.catChipRemoveLabel}>✕</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.addCatRow}>
        <TextField
          value={newCatName}
          onChangeText={setNewCatName}
          placeholder="Nueva categoría (ej: Mascotas)"
          style={styles.addCatInput}
        />
        <Pressable
          onPress={addCategory}
          style={[styles.addCatButton, { backgroundColor: newCatName.trim() ? colors.ink : colors.disabled }]}
        >
          <Text style={styles.addCatButtonLabel}>Agregar</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 4 }}>
        <PrimaryButton label="Empezar" onPress={handleStart} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: colors.secondary,
    marginTop: -8,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  rowName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: colors.ink,
  },
  rowInput: {
    width: 110,
    fontSize: 13.5,
    fontFamily: 'Nunito_800ExtraBold',
    paddingVertical: 9,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingLeft: 13,
    paddingRight: 7,
    borderRadius: radii.pill,
  },
  catChipLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
  },
  catChipRemove: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChipRemoveLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  addCatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addCatInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    ...shadow.card,
  },
  addCatButton: {
    borderRadius: radii.input,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCatButtonLabel: {
    color: '#fff',
    fontSize: 13.5,
    fontFamily: 'Nunito_900Black',
  },
});
