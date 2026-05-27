import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const texture = require('../../../assets/textures/curvao_universal_texture_overlay_2048.png');
const crest = require('../../../assets/logo_crest.png');

export function EarnInfoBox() {
  return (
    <View style={styles.box}>
      <Image source={texture} style={[styles.texture, { pointerEvents: 'none' }]} />
      <Image contentFit="contain" source={crest} style={styles.crest} />
      <View style={styles.copyWrap}>
        <Text style={styles.title}>Earned. Not Bought.</Text>
        <Text style={styles.copy}>Verified Cards sind wertvoller als Fan Claimed Cards.</Text>
      </View>
      <Text style={styles.marks}>•••</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.86)',
    borderColor: 'rgba(216,170,77,0.25)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: curvao.spacing.md,
    overflow: 'hidden',
    padding: curvao.spacing.lg,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },
  crest: {
    height: 44,
    width: 44,
  },
  copyWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.8,
  },
  copy: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
    lineHeight: 20,
  },
  marks: {
    color: 'rgba(216,170,77,0.42)',
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 2,
  },
});
