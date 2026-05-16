import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: curvao.colors.surface,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    minWidth: 104,
    padding: 12,
  },
  value: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.heavy,
  },
  label: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.xs,
    marginTop: 2,
  },
});
