import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/context/DataContext';
import { useToast } from '../../src/context/ToastContext';
import { Toast, AlertBanner } from '../../src/components/Toast';
import { ProgressBar } from '../../src/components/ProgressBar';
import { CategoryAvatar } from '../../src/components/CategoryAvatar';
import { colors, radii, shadow } from '../../src/constants/theme';
import { categoryColor, categorySoft } from '../../src/utils/oklch';
import { fmtArs, fmtSigned, monthTitle } from '../../src/utils/format';
import { monthKey as monthKeyOf } from '../../src/utils/format';
import { categoryInitial, categoryViews, overallLimit, spentByCategory } from '../../src/utils/derived';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, limits, transactions, warnThreshold } = useData();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentMonth = useMemo(() => monthKeyOf(new Date()), []);
  const spent = useMemo(() => spentByCategory(transactions, currentMonth), [transactions, currentMonth]);
  const cats = useMemo(() => categoryViews(categories, limits, spent), [categories, limits, spent]);
  const totalSpent = useMemo(() => Object.values(spent).reduce((a, b) => a + b, 0), [spent]);
  const overall = useMemo(() => overallLimit(limits), [limits]);
  const overallRemaining = overall - totalSpent;
  const overallPct = overall ? Math.min(1, totalSpent / overall) : 0;

  const overCats = cats.filter((c) => c.overLimit);
  const alertOn = overCats.length > 0 || totalSpent > overall;
  const alertText =
    totalSpent > overall
      ? `Superaste tu límite general del mes por ${fmtArs(totalSpent - overall)}.`
      : `Te pasaste del límite en ${overCats.map((c) => c.name).join(' y ')}.`;

  const barColor = overallPct >= 1 ? colors.over : overallPct >= warnThreshold ? colors.warn : colors.ok;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.monthLabel}>{monthTitle(currentMonth)}</Text>
          <Text style={styles.appTitle}>Mis Gastos</Text>
        </View>
        <View>
          <Pressable onPress={() => setMenuOpen((v) => !v)} style={[styles.gearButton, shadow.card]}>
            <Text style={styles.gearIcon}>⚙︎</Text>
          </Pressable>
          {menuOpen && (
            <View style={styles.menu}>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/limits');
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemLabel}>Configurar límites</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/accounts');
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemLabel}>Cuentas y categorías</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {toast ? <Toast message={toast} /> : null}
      {alertOn ? <AlertBanner message={alertText} /> : null}

      <View style={styles.darkCard}>
        <View style={styles.darkCardTop}>
          <Text style={styles.darkCardLabel}>Te queda este mes</Text>
          <Text style={styles.darkCardLimit}>Límite {fmtArs(overall)}</Text>
        </View>
        <Text style={[styles.remaining, { color: overallRemaining < 0 ? colors.redLight : '#fff' }]}>
          {fmtSigned(overallRemaining, 'ARS')}
        </Text>
        <ProgressBar pct={overallPct} color={barColor} height={10} trackColor={colors.white15} />
        <Text style={styles.spentLine}>
          Gastaste {fmtArs(totalSpent)} · {Math.round(overall ? (totalSpent / overall) * 100 : 0)}% del presupuesto
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Categorías</Text>
      <View style={styles.grid}>
        {cats.map((c) => {
          const color = categoryColor(c.hue);
          const soft = categorySoft(c.hue);
          const barCol = c.pct >= 1 ? colors.over : c.pct >= warnThreshold ? colors.warn : color;
          return (
            <View key={c.id} style={[styles.catCard, shadow.card]}>
              <View style={styles.catCardHeader}>
                <CategoryAvatar initial={categoryInitial(c.name)} color={color} soft={soft} />
                <Text style={styles.catName}>{c.name}</Text>
              </View>
              <Text style={[styles.catRemaining, { color: c.overLimit ? colors.red : colors.ink }]}>
                {fmtSigned(c.remaining, 'ARS')}
              </Text>
              <ProgressBar pct={c.pct} color={barCol} />
              <Text style={styles.catSpentLine}>
                {c.overLimit
                  ? `Te pasaste ${fmtArs(c.spent - c.limit)} · límite ${fmtArs(c.limit)}`
                  : `${fmtArs(c.spent)} de ${fmtArs(c.limit)}`}
              </Text>
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  monthLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.secondary,
  },
  appTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
  },
  menu: {
    position: 'absolute',
    top: 46,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 6,
    gap: 2,
    minWidth: 170,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  menuItemLabel: {
    fontSize: 13.5,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  darkCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.cardLg,
    padding: 20,
    gap: 10,
  },
  darkCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  darkCardLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: colors.white65,
  },
  darkCardLimit: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.white50,
  },
  remaining: {
    fontSize: 36,
    fontFamily: 'Nunito_900Black',
    letterSpacing: -0.5,
  },
  spentLine: {
    fontSize: 12.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.white55,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 14,
    gap: 8,
  },
  catCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catName: {
    fontSize: 13.5,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
    flexShrink: 1,
  },
  catRemaining: {
    fontSize: 19,
    fontFamily: 'Nunito_900Black',
  },
  catSpentLine: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.secondary,
  },
});
