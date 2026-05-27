import { Image } from 'expo-image';
import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
const backgroundSource = require('@/assets/bg_1.png');

type Props = PropsWithChildren<{
  padded?: boolean;
  fixedTop?: React.ReactNode;
  contentTopInset?: number;
}>;

export function CurvaoScreen({ children, padded = true, fixedTop, contentTopInset = 0 }: Props) {
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
        contentContainerStyle={[styles.content, padded && styles.padded, contentTopInset > 0 && { paddingTop: contentTopInset }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {fixedTop ? <View style={styles.fixedTop}>{fixedTop}</View> : null}
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
  fixedTop: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
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
