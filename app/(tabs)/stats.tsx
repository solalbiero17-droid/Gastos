import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/context/DataContext';
import { CategoryAvatar } from '../../src/components/CategoryAvatar';
import { ProgressBar } from '../../src/components/ProgressBar';
import { colors, radii, shadow } from '../../src/constants/theme';
import { categoryColor, categorySoft } from '../../src/utils/oklch';
import { fmtArs, fmt, fmtSigned, monthKey as monthKeyOf, monthLabel, endOfMonthTimestamp } from '../../src/utils/format';
import { allMonthKeys, accountBalanceAsOf, categoryInitial, incomeForMonth, spentByCategory, spentTotalForMonth } from '../../src/utils/derived';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, categories, accounts } = useData();
  const currentMonth = useMemo(() => monthKeyOf(new Date()), []);
  const months = useMemo(() => allMonthKeys(transactions, currentMonth), [transactions, currentMonth]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const spent = useMemo(() => spentByCategory(transactions, selectedMonth), [transactions, selectedMonth]);
  const totalSpent = useMemo(() => spentTotalForMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const income = useMemo(() => incomeForMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const balance = income - totalSpent;

  const totalSaved = useMemo(
    () =>
      months.reduce((sum, m) => {
        const sp = spentTotalForMonth(transactions, m);
        const inc = incomeForMonth(transactions, m);
        return sum + (inc - sp);
      }, 0),
    [months, transactions]
  );

  const maxCat = Math.max(1, ...categories.map((c) => spent[c.id] || 0));
  const firstLabel = monthLabel(months[0] ?? selectedMonth, currentMonth);
  const lastLabel = monthLabel(months[months.length - 1] ?? selectedMonth, currentMonth);

  const balanceCutoff = useMemo(() => endOfMonthTimestamp(selectedMonth), [selectedMonth]);
  const arsAccounts = accounts.filter((a) => a.currency === 'ARS');
  const usdAccounts = accounts.filter((a) => a.currency === 'USD');
  const balancesLabel =
    selectedMonth === currentMonth
      ? 'Saldos actuales'
      : `Saldos al cierre de ${monthLabel(selectedMonth, currentMonth).toLowerCase()}`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.title}>Resumen mensual</Text>

      <View style={styles.chipsRow}>
        {months.map((m) => {
          const sel = m === selectedMonth;
          return (
            <Pressable
              key={m}
              onPress={() => setSelectedMonth(m)}
              style={[styles.monthChip, { backgroundColor: sel ? colors.ink : colors.pageBg }]}
            >
              <Text style={[styles.monthChipLabel, { color: sel ? '#fff' : '#5c574d' }]}>
                {monthLabel(m, currentMonth)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.darkCard}>
        <View style={styles.darkCardRow}>
          <View style={{ gap: 2 }}>
            <Text style={styles.darkCardLabel}>Gastado</Text>
            <Text style={styles.darkCardValue}>{fmtArs(totalSpent)}</Text>
          </View>
          <View style={{ gap: 2, alignItems: 'flex-end' }}>
            <Text style={styles.darkCardLabel}>Ingresos</Text>
            <Text style={[styles.darkCardValue, { color: colors.greenLight }]}>{fmtArs(income)}</Text>
          </View>
        </View>
        <View style={styles.darkCardDivider}>
          <Text style={styles.darkCardLabel}>{balance >= 0 ? 'Te sobró' : 'Gastaste de más'}</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? colors.greenLight : colors.redLight }]}>
            {fmtSigned(balance, 'ARS')}
          </Text>
        </View>
      </View>

      <View style={styles.savedCard}>
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={styles.savedLabel}>Ahorro total</Text>
          <Text style={styles.savedSub}>
            Lo que te sobró de {firstLabel.toLowerCase()} a {lastLabel.toLowerCase()}
          </Text>
        </View>
        <Text style={[styles.savedValue, { color: totalSaved >= 0 ? colors.green : colors.red }]}>
          {fmtSigned(totalSaved, 'ARS')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{balancesLabel}</Text>
      <View style={[styles.accCard, shadow.card]}>
        {arsAccounts.map((a, i) => (
          <View key={a.id} style={[styles.accRow, i === arsAccounts.length - 1 && usdAccounts.length === 0 && styles.accRowLast]}>
            <View style={styles.accRowLeft}>
              <View style={[styles.accDot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.statName}>{a.name}</Text>
            </View>
            <Text style={styles.statAmount}>{fmtArs(accountBalanceAsOf(a, transactions, balanceCutoff))}</Text>
          </View>
        ))}
        {usdAccounts.map((a, i) => (
          <View key={a.id} style={[styles.accRow, i === usdAccounts.length - 1 && styles.accRowLast]}>
            <View style={styles.accRowLeft}>
              <View style={[styles.accDot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.statName}>{a.name}</Text>
            </View>
            <Text style={[styles.statAmount, { color: colors.violet }]}>
              {fmt(accountBalanceAsOf(a, transactions, balanceCutoff), 'USD')}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Gasto por categoría</Text>
      <View style={[styles.statsCard, shadow.card]}>
        {categories.map((c) => {
          const amt = spent[c.id] || 0;
          const color = categoryColor(c.hue);
          return (
            <View key={c.id} style={styles.statRow}>
              <View style={styles.statRowHeader}>
                <View style={styles.statRowLeft}>
                  <CategoryAvatar initial={categoryInitial(c.name)} color={color} soft={categorySoft(c.hue)} size={22} radius={7} fontSize={11} />
                  <Text style={styles.statName}>{c.name}</Text>
                </View>
                <Text style={styles.statAmount}>{fmtArs(amt)}</Text>
              </View>
              <ProgressBar pct={amt / maxCat} color={color} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  monthChipLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
  },
  darkCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.cardLg,
    padding: 20,
    gap: 12,
  },
  darkCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  darkCardLabel: {
    fontSize: 12.5,
    fontFamily: 'Nunito_700Bold',
    color: colors.white60,
  },
  darkCardValue: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
  },
  darkCardDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 12,
  },
  balanceValue: {
    fontSize: 16,
    fontFamily: 'Nunito_900Black',
  },
  savedCard: {
    backgroundColor: colors.greenSoft,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  savedLabel: {
    fontSize: 12.5,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.greenSoftText,
  },
  savedSub: {
    fontSize: 11.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.greenSoftSub,
  },
  savedValue: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
    gap: 12,
  },
  statRow: {
    gap: 5,
  },
  statRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statName: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  statAmount: {
    fontSize: 13,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  accRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  accRowLast: {
    borderBottomWidth: 0,
  },
  accRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  accCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: 16,
  },
});
