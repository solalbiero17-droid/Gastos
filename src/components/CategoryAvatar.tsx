import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CategoryAvatar({
  initial,
  color,
  soft,
  size = 28,
  radius = 9,
  fontSize = 13,
}: {
  initial: string;
  color: string;
  soft: string;
  size?: number;
  radius?: number;
  fontSize?: number;
}) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: radius, backgroundColor: soft },
      ]}
    >
      <Text style={[styles.text, { color, fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Nunito_900Black',
  },
});
