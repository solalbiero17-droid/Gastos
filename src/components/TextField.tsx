import React from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors, radii } from '../constants/theme';

export function TextField({
  style,
  align = 'left',
  bg = colors.surface,
  ...props
}: TextInputProps & { align?: 'left' | 'right' | 'center'; bg?: string }) {
  return (
    <TextInput
      placeholderTextColor={colors.tabInactive}
      style={[styles.input, { textAlign: align, backgroundColor: bg }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: radii.input,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13.5,
    color: colors.ink,
  },
});
