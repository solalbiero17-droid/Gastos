import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSession } from '../context/SessionContext';
import { useData } from '../context/DataContext';
import { colors } from '../constants/theme';

/**
 * Renders nothing visible once ready; while session/data state is unknown it
 * shows a blocking overlay so the wrong screen never flashes before the
 * redirect effect below runs.
 */
export function RootNavigationGate() {
  const { loggedIn, initializing } = useSession();
  const { setupComplete, loading } = useData();
  const router = useRouter();
  const segments = useSegments();

  const settled = !initializing && !loading;

  useEffect(() => {
    if (!settled) return;
    const group: string | undefined = segments[0];
    const inAuthFlow = group === 'login';
    const inSetup = group === 'setup';
    const inApp = group === '(tabs)' || group === 'add' || group === 'limits' || group === 'accounts';

    if (!loggedIn && !inAuthFlow) {
      router.replace('/login');
    } else if (loggedIn && !setupComplete && !inSetup) {
      router.replace('/setup');
    } else if (loggedIn && setupComplete && !inApp) {
      router.replace('/(tabs)');
    }
  }, [settled, loggedIn, setupComplete, segments, router]);

  if (settled) return null;

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
