import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../src/context/DataContext';
import { TextField } from '../src/components/TextField';
import { colors, radii, shadow, NEW_CATEGORY_HUES } from '../src/constants/theme';
import { categoryColor, categorySoft } from '../src/utils/oklch';
import { fmt } from '../src/utils/format';
import { accountBalance } from '../src/utils/derived';

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accounts, categories, transactions, setAccountBalance, addCategory, removeCategory } = useData();
  const [newCatName, setNewCatName] = useState('');

  const arsAccounts = accounts.filter((a) => a.currency === 'ARS');
  const usdAccounts = accounts.filter((a) => a.currency === 'USD');

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    addCategory(name);
    setNewCatName('');
  };

  const renderAccountRow = (a: (typeof accounts)[number], isLast: boolean) => {
    const current = accountBalance(a, transactions);
    return (
      <View key={a.id} style={[styles.row, isLast && styles.rowLast]}>
        <View style={styles.rowLeft}>
          <View style={[styles.dot, { backgroundColor: categoryColor(a.hue) }]} />
          <Text style={styles.rowName}>{a.name}</Text>
        </View>
        <TextField
          value={fmt(current, a.currency)}
          onChangeText={(v) => setAccountBalance(a.id, parseInt(v.replace(/[^\d]/g, '') || '0', 10))}
          keyboardType="numeric"
          align="right"
          bg={colors.appBg}
          style={styles.rowInput}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, shadow.card]}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Cuentas y categorías</Text>
      </View>
      <Text style={styles.subtitle}>Ajustá el saldo de tus cuentas o tus categorías.</Text>

      <Text style={styles.sectionLabel}>En pesos</Text>
      <View style={[styles.card, shadow.card]}>
        {arsAccounts.map((a, i) => renderAccountRow(a, i === arsAccounts.length - 1))}
      </View>

      <Text style={styles.sectionLabel}>En dólares</Text>
      <View style={[styles.card, shadow.card]}>
        {usdAccounts.map((a, i) => renderAccountRow(a, i === usdAccounts.length - 1))}
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
          onPress={handleAddCategory}
          style={[styles.addCatButton, { backgroundColor: newCatName.trim() ? colors.ink : colors.disabled }]}
        >
          <Text style={styles.addCatButtonLabel}>Agregar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.secondary,
    marginTop: -6,
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
