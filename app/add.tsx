import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../src/context/DataContext';
import { useToast } from '../src/context/ToastContext';
import { NumericKeypad } from '../src/components/NumericKeypad';
import { PrimaryButton } from '../src/components/Buttons';
import { colors, radii } from '../src/constants/theme';
import { categoryColor, categorySoft } from '../src/utils/oklch';
import { fmt, fmtArs, monthKey as monthKeyOf } from '../src/utils/format';
import { spentByCategory } from '../src/utils/derived';
import type { Currency, TxType } from '../src/types';

const DISCOUNTS = [0, 10, 20, 30, 50];

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, accounts, limits, transactions, addTransaction } = useData();
  const { showToast } = useToast();

  const [type, setType] = useState<TxType>('gasto');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [amountStr, setAmountStr] = useState('');

  const accountsForCurrency = useMemo(() => accounts.filter((a) => a.currency === currency), [accounts, currency]);

  useEffect(() => {
    if (!accountsForCurrency.some((a) => a.id === selectedAccountId)) {
      setSelectedAccountId(accountsForCurrency[0]?.id ?? null);
    }
  }, [accountsForCurrency, selectedAccountId]);

  const goHome = () => router.replace('/(tabs)');

  const isGasto = type === 'gasto';
  const isUsd = currency === 'USD';
  const showCats = isGasto && !isUsd;
  const amount = parseInt(amountStr || '0', 10);
  const finalAmount = showCats ? Math.round(amount * (1 - discount / 100)) : amount;
  const selectedCategory = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId) ?? null : null;

  const currentMonth = useMemo(() => monthKeyOf(new Date()), []);
  const spent = useMemo(() => spentByCategory(transactions, currentMonth), [transactions, currentMonth]);

  let warnText = '';
  if (showCats && selectedCategory && finalAmount > 0) {
    const remaining = (limits[selectedCategory.id] ?? 0) - (spent[selectedCategory.id] || 0);
    if (finalAmount > remaining) {
      warnText =
        remaining > 0
          ? `Ojo: esto supera lo que te queda en ${selectedCategory.name} (${fmtArs(remaining)}).`
          : `Ya estás pasada del límite de ${selectedCategory.name}.`;
    }
  }

  const canConfirm = amount > 0 && (!isGasto || isUsd || !!selectedCategory) && !!selectedAccountId;

  const handleKey = (k: string) => {
    setAmountStr((prev) => {
      if (k === '⌫') return prev.slice(0, -1);
      if (prev.length >= 8) return prev;
      return (prev + k).replace(/^0+(?=\d)/, '');
    });
  };

  const handleConfirm = async () => {
    if (!canConfirm || !selectedAccountId) return;
    const note = isUsd
      ? isGasto
        ? 'Gasto en dólares'
        : 'Ingreso en dólares'
      : isGasto
      ? discount > 0
        ? `${selectedCategory!.name} (${discount}% off)`
        : selectedCategory!.name
      : 'Ingreso';

    await addTransaction({
      type,
      currency,
      categoryId: isUsd ? null : selectedCategoryId,
      accountId: selectedAccountId,
      amount: finalAmount,
      note,
      discount: showCats && discount > 0 ? discount : undefined,
      createdAt: Date.now(),
    });

    const amtTxt = fmt(finalAmount, currency);
    showToast(
      isGasto
        ? isUsd
          ? `Gasto de ${amtTxt} anotado.`
          : `Gasto de ${amtTxt} en ${selectedCategory!.name} anotado.`
        : `Ingreso de ${amtTxt} registrado.`
    );
    goHome();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={goHome} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <Text style={styles.title}>Nuevo movimiento</Text>
          </View>
          <Pressable onPress={goHome}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>

        <View style={styles.segmented}>
          <Pressable onPress={() => setType('gasto')} style={[styles.segment, isGasto && styles.segmentActive]}>
            <Text style={[styles.segmentLabel, { color: isGasto ? colors.ink : colors.secondary }]}>Gasto</Text>
          </Pressable>
          <Pressable onPress={() => setType('ingreso')} style={[styles.segment, !isGasto && styles.segmentActive]}>
            <Text style={[styles.segmentLabel, { color: !isGasto ? colors.green : colors.secondary }]}>Ingreso</Text>
          </Pressable>
        </View>

        <View style={styles.currencyRow}>
          <Pressable
            onPress={() => setCurrency('ARS')}
            style={[styles.currencyChip, { backgroundColor: !isUsd ? colors.ink : colors.pageBg }]}
          >
            <Text style={[styles.currencyLabel, { color: !isUsd ? '#fff' : '#5c574d' }]}>$ Pesos</Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrency('USD')}
            style={[styles.currencyChip, { backgroundColor: isUsd ? colors.violet : colors.pageBg }]}
          >
            <Text style={[styles.currencyLabel, { color: isUsd ? '#fff' : '#5c574d' }]}>US$ Dólares</Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.amount,
            { color: isUsd ? colors.violet : isGasto ? colors.ink : colors.green },
          ]}
        >
          {fmt(amount, currency)}
        </Text>

        {showCats && (
          <View style={styles.chipsWrap}>
            {categories.map((c) => {
              const sel = selectedCategoryId === c.id;
              const color = categoryColor(c.hue);
              const soft = categorySoft(c.hue);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                  style={[
                    styles.catChip,
                    { backgroundColor: sel ? color : soft, borderColor: sel ? color : 'transparent' },
                  ]}
                >
                  <Text style={[styles.catChipLabel, { color: sel ? '#fff' : color }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {showCats && (
          <View style={styles.discountBlock}>
            <Text style={styles.discountTitle}>Descuento</Text>
            <View style={styles.chipsWrap}>
              {DISCOUNTS.map((d) => {
                const sel = discount === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDiscount(d)}
                    style={[
                      styles.discChip,
                      { backgroundColor: sel ? colors.green : colors.greenSoft },
                    ]}
                  >
                    <Text style={[styles.discChipLabel, { color: sel ? '#fff' : colors.greenSoftSub }]}>
                      {d === 0 ? 'Sin desc.' : `${d}%`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {discount > 0 && amount > 0 && (
              <Text style={styles.discLine}>Con {discount}% off pagás {fmtArs(finalAmount)}</Text>
            )}
          </View>
        )}

        <View style={styles.chipsWrap}>
          {accountsForCurrency.map((a) => {
            const sel = selectedAccountId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setSelectedAccountId(a.id)}
                style={[styles.accChip, { backgroundColor: sel ? colors.ink : colors.pageBg }]}
              >
                <Text style={[styles.accChipLabel, { color: sel ? '#fff' : '#5c574d' }]}>{a.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {warnText ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>{warnText}</Text>
          </View>
        ) : null}

        <View style={styles.bottomBlock}>
          <NumericKeypad onKeyPress={handleKey} />
          <PrimaryButton
            label={isGasto ? 'Agregar gasto' : 'Agregar ingreso'}
            onPress={handleConfirm}
            disabled={!canConfirm}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBg,
    paddingHorizontal: 20,
  },
  scrollContent: {
    gap: 12,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  backIcon: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  cancel: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
    padding: 6,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.pageBg,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  currencyChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  currencyLabel: {
    fontSize: 12.5,
    fontFamily: 'Nunito_800ExtraBold',
  },
  amount: {
    textAlign: 'center',
    fontSize: 44,
    fontFamily: 'Nunito_900Black',
    letterSpacing: -1,
    paddingVertical: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 2,
  },
  catChipLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
  },
  discountBlock: {
    alignItems: 'center',
    gap: 6,
  },
  discountTitle: {
    fontSize: 11.5,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  discChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  discChipLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  discLine: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.green,
  },
  accChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  accChipLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  warnBox: {
    backgroundColor: colors.redSoft,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  warnText: {
    color: colors.redSoftText,
    fontSize: 12.5,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  bottomBlock: {
    marginTop: 'auto',
    gap: 10,
    paddingTop: 12,
  },
});
