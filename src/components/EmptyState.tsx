import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 18,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.heavy,
  },
  body: {
    color: curvao.colors.muted,
    marginTop: curvao.spacing.xs,
  },
});
