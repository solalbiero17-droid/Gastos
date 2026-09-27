import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii } from '../constants/theme';

export function Toast({ message }: { message: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [message, anim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

export function AlertBanner({ message }: { message: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.alertContainer,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Text style={styles.alertIcon}>⚠</Text>
      <Text style={styles.alertText}>{message}</Text>
    </Animated.View>
  );
}

export function InfoBanner({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.infoContainer,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Text style={styles.infoText}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.infoAction} hitSlop={8}>
          <Text style={styles.infoActionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.greenSoft,
    borderRadius: radii.card - 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.greenSoftText,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  alertContainer: {
    backgroundColor: colors.redSoft,
    borderRadius: radii.card - 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIcon: {
    fontSize: 16,
    color: colors.redSoftText,
  },
  alertText: {
    color: colors.redSoftText,
    fontSize: 13.5,
    fontFamily: 'Nunito_700Bold',
    flex: 1,
  },
  infoContainer: {
    backgroundColor: colors.violetSoft,
    borderRadius: radii.card - 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: colors.violetSoftText,
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    flex: 1,
  },
  infoAction: {
    backgroundColor: colors.violet,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  infoActionLabel: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
