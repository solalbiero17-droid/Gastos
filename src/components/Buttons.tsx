import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radii, shadow } from '../constants/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  bg = colors.ink,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  bg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor: disabled ? colors.disabled : bg }]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  radius = 14,
}: {
  icon: string;
  onPress: () => void;
  size?: number;
  radius?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: radius },
        shadow.card,
      ]}
    >
      <Text style={styles.iconLabel}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_900Black',
  },
  iconButton: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.secondary,
  },
});
