import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type Props = PropsWithChildren<{
  padded?: boolean;
}>;

export function CurvaoScreen({ children, padded = true }: Props) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, padded && styles.padded]}>{children}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: curvao.colors.background,
  },
  content: {
    gap: curvao.spacing.md,
    paddingBottom: 40,
  },
  padded: {
    paddingHorizontal: curvao.spacing.lg,
    paddingTop: 58,
  },
});
