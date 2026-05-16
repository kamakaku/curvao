import { Image } from 'expo-image';
import { PropsWithChildren } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const backgroundSource = require('@/assets/bg_1.png');

type Props = PropsWithChildren<{
  padded?: boolean;
}>;

export function CurvaoScreen({ children, padded = true }: Props) {
  return (
    <View style={styles.root}>
      {/* Scrollable content on top, background is now handled by the root layout */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, padded && styles.padded]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: curvao.spacing.md,
    paddingBottom: 110,
  },
  padded: {
    paddingHorizontal: curvao.spacing.lg,
    paddingTop: curvao.spacing.md,
  },
});
