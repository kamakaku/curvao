import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

export function WantedEmptyState({ onDiscover }: { onDiscover: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>Noch keine Cards gesucht</Text>
      <Text style={styles.copy}>Suche nach Spielern, Teams oder Stadien und markiere Cards, die du verdienen möchtest.</Text>
      <Pressable onPress={onDiscover} style={styles.button}>
        <Text style={styles.buttonLabel}>Cards entdecken</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    backgroundColor: '#101512',
    borderColor: 'rgba(216,170,77,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    gap: curvao.spacing.md,
    padding: curvao.spacing.xl,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
    textAlign: 'center',
  },
  copy: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: curvao.colors.gold,
    borderRadius: 999,
    paddingHorizontal: curvao.spacing.lg,
    paddingVertical: curvao.spacing.sm,
  },
  buttonLabel: {
    color: curvao.colors.textInverted,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
