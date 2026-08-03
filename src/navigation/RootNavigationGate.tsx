import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useData } from '../context/DataContext';
import { colors } from '../constants/theme';

/**
 * Renders nothing visible once ready; while data is loading it shows a
 * blocking overlay so the wrong screen never flashes before the redirect
 * effect below runs.
 */
export function RootNavigationGate() {
  const { setupComplete, loading } = useData();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const group: string | undefined = segments[0];
    const inSetup = group === 'setup';
    const inApp = group === '(tabs)' || group === 'add' || group === 'limits' || group === 'accounts';

    if (!setupComplete && !inSetup) {
      router.replace('/setup');
    } else if (setupComplete && !inApp) {
      router.replace('/(tabs)');
    }
  }, [loading, setupComplete, segments, router]);

  if (!loading) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
