import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/context/DataContext';
import { CategoryAvatar } from '../../src/components/CategoryAvatar';
import { colors, radii, shadow } from '../../src/constants/theme';
import { categoryColor, categorySoft } from '../../src/utils/oklch';
import { dayLabel, fmt } from '../../src/utils/format';
import { categoryInitial } from '../../src/utils/derived';
import type { Transaction } from '../../src/types';

interface FeedRow {
  tx: Transaction;
  initial: string;
  color: string;
  soft: string;
  note: string;
  sub: string;
  amountText: string;
  amountColor: string;
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, categories, accounts } = useData();

  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const sections = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);
    const groups: { title: string; data: FeedRow[] }[] = [];
    let lastDay: string | null = null;

    for (const tx of sorted) {
      const day = dayLabel(tx.createdAt);
      if (day !== lastDay) {
        groups.push({ title: day, data: [] });
        lastDay = day;
      }
      const isGasto = tx.type === 'gasto';
      const isTransfer = tx.type === 'transferencia';
      const acc = accById[tx.accountId];
      const accName = acc?.name ?? 'Cuenta';
      const cat = tx.categoryId ? catById[tx.categoryId] : null;
      const isUsd = tx.currency === 'USD';

      let initial: string, color: string, soft: string, sub: string;
      if (isTransfer) {
        const toAcc = tx.toAccountId ? accById[tx.toAccountId] : null;
        const toName = toAcc?.name ?? 'otra cuenta';
        initial = '⇄';
        color = colors.violet;
        soft = colors.violetSoft;
        sub = `${accName} → ${toName}` + (tx.exchangeRate ? ` · recibiste ${fmt(tx.toAmount ?? tx.amount, toAcc?.currency ?? tx.currency)}` : '');
      } else if (isUsd) {
        initial = 'U$';
        color = categoryColor(285);
        soft = categorySoft(285);
        sub = `Dólares · ${accName}`;
      } else if (isGasto) {
        const name = cat?.name ?? 'Otros';
        initial = categoryInitial(name);
        color = cat ? categoryColor(cat.hue) : colors.secondary;
        soft = cat ? categorySoft(cat.hue) : colors.divider;
        sub = `${name} · ${accName}`;
      } else {
        initial = '↑';
        color = colors.green;
        soft = colors.greenSoft;
        sub = `Ingreso · ${accName}`;
      }

      groups[groups.length - 1].data.push({
        tx,
        initial,
        color,
        soft,
        note: tx.note,
        sub,
        amountText: (isTransfer ? '' : isGasto ? '−' : '+') + fmt(tx.amount, tx.currency),
        amountColor: isTransfer ? colors.violet : isGasto ? colors.ink : colors.green,
      });
    }
    return groups;
  }, [transactions, catById, accById]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.tx.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12 }}
        ListHeaderComponent={<Text style={styles.title}>Actividad</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Todavía no registraste movimientos.</Text>}
        renderSectionHeader={({ section }) => <Text style={styles.dayHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.row, shadow.card]}>
            <CategoryAvatar initial={item.initial} color={item.color} soft={item.soft} size={36} radius={12} fontSize={15} />
            <View style={styles.rowText}>
              <Text style={styles.note}>{item.note}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <Text style={[styles.amount, { color: item.amountColor }]}>{item.amountText}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
    marginBottom: 8,
  },
  empty: {
    fontSize: 13.5,
    fontFamily: 'Nunito_700Bold',
    color: colors.secondary,
    paddingVertical: 20,
    textAlign: 'center',
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
    letterSpacing: 0.7,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: colors.appBg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card - 2,
    padding: 12,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  note: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  sub: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.secondary,
  },
  amount: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
  },
});
