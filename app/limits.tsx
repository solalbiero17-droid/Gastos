import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../src/context/DataContext';
import { TextField } from '../src/components/TextField';
import { CategoryAvatar } from '../src/components/CategoryAvatar';
import { colors, radii, shadow, LIMIT_STEP } from '../src/constants/theme';
import { categoryColor, categorySoft } from '../src/utils/oklch';
import { fmtArs } from '../src/utils/format';
import { categoryInitial, overallLimit } from '../src/utils/derived';

export default function LimitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, limits, setLimit } = useData();
  const overall = useMemo(() => overallLimit(limits), [limits]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.appBg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, shadow.card]}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Límites</Text>
      </View>
      <Text style={styles.subtitle}>Ajustá cuánto podés gastar por mes.</Text>

      <View style={styles.overallCard}>
        <View>
          <Text style={styles.overallLabel}>Límite general</Text>
          <Text style={styles.overallSub}>Suma de tus categorías</Text>
        </View>
        <Text style={styles.overallValue}>{fmtArs(overall)}</Text>
      </View>

      <View style={styles.card}>
        {categories.map((c, i) => {
          const value = limits[c.id] ?? 0;
          return (
            <View key={c.id} style={[styles.row, i === categories.length - 1 && styles.rowLast]}>
              <View style={styles.rowLeft}>
                <CategoryAvatar
                  initial={categoryInitial(c.name)}
                  color={categoryColor(c.hue)}
                  soft={categorySoft(c.hue)}
                  size={26}
                  radius={8}
                  fontSize={12}
                />
                <Text style={styles.rowName}>{c.name}</Text>
              </View>
              <View style={styles.rowRight}>
                <Pressable onPress={() => setLimit(c.id, Math.max(0, value - LIMIT_STEP))} style={styles.stepButton}>
                  <Text style={styles.stepLabel}>−</Text>
                </Pressable>
                <TextField
                  value={fmtArs(value)}
                  onChangeText={(v) => setLimit(c.id, parseInt(v.replace(/[^\d]/g, '') || '0', 10))}
                  keyboardType="numeric"
                  align="center"
                  bg={colors.appBg}
                  style={styles.limitInput}
                />
                <Pressable onPress={() => setLimit(c.id, value + LIMIT_STEP)} style={styles.stepButton}>
                  <Text style={styles.stepLabel}>+</Text>
                </Pressable>
              </View>
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
  overallCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  overallSub: {
    fontSize: 11.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.white55,
  },
  overallValue: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
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
    paddingVertical: 11,
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
  },
  rowName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: colors.ink,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
    color: '#5c574d',
  },
  limitInput: {
    fontSize: 13,
    fontFamily: 'Nunito_900Black',
    width: 96,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
});
