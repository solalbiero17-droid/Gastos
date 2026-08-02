import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const LABELS: Record<string, string> = {
  index: 'Inicio',
  activity: 'Actividad',
  stats: 'Resumen',
  goals: 'Metas',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderTab = (routeName: string, routeKey: string, index: number) => {
    const focused = state.index === index;
    const color = focused ? colors.ink : colors.tabInactive;
    return (
      <Pressable
        key={routeKey}
        onPress={() => navigation.navigate(routeName)}
        style={styles.tab}
      >
        <View style={[styles.dot, { backgroundColor: focused ? colors.ink : 'transparent' }]} />
        <Text style={[styles.label, { color }]}>{LABELS[routeName] ?? routeName}</Text>
      </Pressable>
    );
  };

  const left = state.routes.filter((r) => r.name === 'index' || r.name === 'activity');
  const right = state.routes.filter((r) => r.name === 'stats' || r.name === 'goals');

  return (
    <View style={[styles.container, { paddingBottom: Math.max(6, insets.bottom) }]}>
      {left.map((r) => renderTab(r.name, r.key, state.routes.indexOf(r)))}
      <Pressable onPress={() => router.push('/add')} style={styles.addButton}>
        <Text style={styles.addLabel}>+</Text>
      </Pressable>
      {right.map((r) => renderTab(r.name, r.key, state.routes.indexOf(r)))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.pageBg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  label: {
    fontSize: 11.5,
    fontFamily: 'Nunito_800ExtraBold',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  addLabel: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
    marginTop: -2,
  },
});
