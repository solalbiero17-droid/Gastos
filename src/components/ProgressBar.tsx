import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  pct: number;
  color: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({ pct, color, height = 7, trackColor = colors.barTrack }: Props) {
  const width = `${Math.max(0, Math.min(100, pct * 100))}%` as const;
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height }]}>
      <View style={[styles.fill, { width, backgroundColor: color, borderRadius: height }]} />
    </View>
  );
}

/** Two-segment bar: a solid "saved" portion plus a lighter "projected" portion. */
export function DualProgressBar({
  pct,
  projPct,
  color,
  height = 9,
}: {
  pct: number;
  projPct: number;
  color: string;
  height?: number;
}) {
  const solidWidth = Math.max(0, Math.min(100, pct * 100));
  const projWidth = Math.max(0, Math.min(100 - solidWidth, projPct * 100));
  return (
    <View style={[styles.track, { height, borderRadius: height, flexDirection: 'row' }]}>
      <View style={{ width: `${solidWidth}%`, height: '100%', backgroundColor: color }} />
      <View style={{ width: `${projWidth}%`, height: '100%', backgroundColor: color, opacity: 0.35 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
