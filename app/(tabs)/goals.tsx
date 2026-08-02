import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/context/DataContext';
import { useToast } from '../../src/context/ToastContext';
import { Toast } from '../../src/components/Toast';
import { TextField } from '../../src/components/TextField';
import { DualProgressBar } from '../../src/components/ProgressBar';
import { colors, radii, shadow, GOAL_HUES } from '../../src/constants/theme';
import { categoryColor, categorySoft } from '../../src/utils/oklch';
import { fmtArs, fmtUsd, monthKey as monthKeyOf, monthTitle } from '../../src/utils/format';
import { accountBalance, goalViews, incomeForMonth, overallLimit, spentByCategory, spentTotalForMonth } from '../../src/utils/derived';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { accounts, transactions, limits, goals, addGoal, contributeToGoal } = useData();
  const { toast, showToast } = useToast();

  const [aportVals, setAportVals] = useState<Record<string, string>>({});
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const currentMonth = useMemo(() => monthKeyOf(new Date()), []);
  const income = useMemo(() => incomeForMonth(transactions, currentMonth), [transactions, currentMonth]);
  const totalSpent = useMemo(() => spentTotalForMonth(transactions, currentMonth), [transactions, currentMonth]);
  const overall = useMemo(() => overallLimit(limits), [limits]);
  const leftover = Math.max(0, overall - totalSpent);

  const arsAccounts = accounts.filter((a) => a.currency === 'ARS');
  const usdAccounts = accounts.filter((a) => a.currency === 'USD');
  const totalArs = arsAccounts.reduce((sum, a) => sum + accountBalance(a, transactions), 0);
  const usdWf = accounts.find((a) => a.id === 'usdwf');
  const usdEf = accounts.find((a) => a.id === 'usdef');

  const goalList = useMemo(() => goalViews(goals, leftover), [goals, leftover]);
  const canAddGoal = goalName.trim().length > 0 && (parseInt(goalTarget || '0', 10) || 0) > 0;

  const handleContribute = async (goalId: string, name: string) => {
    const amount = parseInt(aportVals[goalId] || '0', 10);
    if (!amount) {
      showToast('Escribí el monto a aportar.');
      return;
    }
    await contributeToGoal(goalId, amount);
    setAportVals((prev) => ({ ...prev, [goalId]: '' }));
    showToast(`Aportaste ${fmtArs(amount)} a ${name}`);
  };

  const handleAddGoal = async () => {
    if (!canAddGoal) return;
    const target = parseInt(goalTarget, 10);
    const name = goalName.trim();
    await addGoal(name, target);
    setGoalName('');
    setGoalTarget('');
    showToast(`Meta "${name}" creada.`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 20 }]}
    >
      <Text style={styles.title}>Metas y cuentas</Text>
      {toast ? <Toast message={toast} /> : null}

      <View style={[styles.summaryCard, shadow.card]}>
        <View>
          <Text style={styles.summaryLabel}>Ingresos de {monthTitle(currentMonth).split(' ')[0].toLowerCase()}</Text>
          <Text style={[styles.summaryValue, { color: colors.green }]}>{fmtArs(income)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.summaryLabel}>Total en cuentas</Text>
          <Text style={styles.summaryValue}>{fmtArs(totalArs)}</Text>
        </View>
      </View>

      <View style={[styles.summaryCard, shadow.card]}>
        <View>
          <Text style={styles.summaryLabel}>Dólares Wells Fargo</Text>
          <Text style={[styles.summaryValue, { color: colors.violet }]}>
            {usdWf ? fmtUsd(accountBalance(usdWf, transactions)) : '—'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.summaryLabel}>Dólares efectivo</Text>
          <Text style={[styles.summaryValue, { color: colors.violet }]}>
            {usdEf ? fmtUsd(accountBalance(usdEf, transactions)) : '—'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Metas de ahorro</Text>
      <View style={styles.leftoverCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.leftoverLabel}>Sobrante del mes → a tus metas</Text>
          <Text style={styles.leftoverSub}>Lo que no gastes se reparte entre tus metas</Text>
        </View>
        <Text style={styles.leftoverValue}>{fmtArs(leftover)}</Text>
      </View>

      {goalList.map((g) => {
        const color = categoryColor(g.hue);
        const soft = categorySoft(g.hue);
        const pctLabel = g.target ? Math.round((g.saved / g.target) * 100) : 0;
        return (
          <View key={g.id} style={[styles.goalCard, shadow.card]}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>{g.name}</Text>
              <TextField
                value={aportVals[g.id] ?? ''}
                onChangeText={(v) => setAportVals((prev) => ({ ...prev, [g.id]: v.replace(/[^\d]/g, '') }))}
                placeholder="$ monto"
                keyboardType="numeric"
                align="right"
                bg={colors.appBg}
                style={styles.goalInput}
              />
              <Pressable onPress={() => handleContribute(g.id, g.name)} style={[styles.aportButton, { backgroundColor: soft }]}>
                <Text style={[styles.aportButtonLabel, { color }]}>+ Aportar</Text>
              </Pressable>
            </View>
            <DualProgressBar pct={g.pct} projPct={g.target ? g.projected / g.target : 0} color={color} />
            <Text style={styles.goalLine}>
              {fmtArs(g.saved)} de {fmtArs(g.target)} · {pctLabel}%
              {g.projected > 0 ? ` · +${fmtArs(g.projected)} si no gastás más` : ''}
            </Text>
          </View>
        );
      })}

      <View style={[styles.newGoalCard, shadow.card]}>
        <Text style={styles.newGoalLabel}>Nueva meta</Text>
        <View style={styles.newGoalRow}>
          <TextField
            value={goalName}
            onChangeText={setGoalName}
            placeholder="Nombre (ej: Vacaciones)"
            bg={colors.appBg}
            style={styles.newGoalNameInput}
          />
          <TextField
            value={goalTarget}
            onChangeText={(v) => setGoalTarget(v.replace(/[^\d]/g, ''))}
            placeholder="$ objetivo"
            keyboardType="numeric"
            bg={colors.appBg}
            style={styles.newGoalTargetInput}
          />
        </View>
        <Pressable
          onPress={handleAddGoal}
          style={[styles.newGoalButton, { backgroundColor: canAddGoal ? colors.ink : colors.disabled }]}
        >
          <Text style={styles.newGoalButtonLabel}>Agregar meta</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Cuentas en pesos</Text>
      <View style={[styles.accCard, shadow.card]}>
        {arsAccounts.map((a, i) => (
          <View key={a.id} style={[styles.accRow, i === arsAccounts.length - 1 && styles.accRowLast]}>
            <View style={styles.accLeft}>
              <View style={[styles.dot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.accName}>{a.name}</Text>
            </View>
            <Text style={styles.accBalance}>{fmtArs(accountBalance(a, transactions))}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Cuentas en dólares</Text>
      <View style={[styles.accCard, shadow.card]}>
        {usdAccounts.map((a, i) => (
          <View key={a.id} style={[styles.accRow, i === usdAccounts.length - 1 && styles.accRowLast]}>
            <View style={styles.accLeft}>
              <View style={[styles.dot, { backgroundColor: categoryColor(a.hue) }]} />
              <Text style={styles.accName}>{a.name}</Text>
            </View>
            <Text style={styles.accBalance}>{fmtUsd(accountBalance(a, transactions))}</Text>
          </View>
        ))}
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: 'Nunito_700Bold',
    color: colors.secondary,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  leftoverCard: {
    backgroundColor: colors.greenSoft,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  leftoverLabel: {
    fontSize: 12.5,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.greenSoftText,
  },
  leftoverSub: {
    fontSize: 11.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.greenSoftSub,
  },
  leftoverValue: {
    fontSize: 19,
    fontFamily: 'Nunito_900Black',
    color: colors.greenSoftText,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
    gap: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalName: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  goalInput: {
    width: 90,
    fontSize: 12.5,
    paddingVertical: 8,
  },
  aportButton: {
    borderRadius: radii.input,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aportButtonLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  goalLine: {
    fontSize: 12.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.secondary,
  },
  newGoalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
    gap: 10,
  },
  newGoalLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
  },
  newGoalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  newGoalNameInput: {
    flex: 1,
    minWidth: 0,
  },
  newGoalTargetInput: {
    width: 110,
  },
  newGoalButton: {
    borderRadius: radii.input,
    paddingVertical: 11,
    alignItems: 'center',
  },
  newGoalButtonLabel: {
    color: '#fff',
    fontSize: 13.5,
    fontFamily: 'Nunito_900Black',
  },
  accCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: 16,
  },
  accRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  accRowLast: {
    borderBottomWidth: 0,
  },
  accLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  accName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: colors.ink,
  },
  accBalance: {
    fontSize: 14.5,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
});
