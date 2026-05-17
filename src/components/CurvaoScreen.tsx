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
      {/* Individual background per screen to ensure opacity */}
      <Image 
        source={backgroundSource} 
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
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
