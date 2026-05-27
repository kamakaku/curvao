import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { wantedTargetToMockUserCard } from '@/src/services/wantedCardService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardSearchResult } from '@/src/services/wantedCardService';

const texture = require('../../../assets/textures/curvao_universal_texture_overlay_2048.png');

function getStatus(result: CardSearchResult) {
  if (result.owned) return 'BESITZT';
  if (result.wanted) return 'GESUCHT';
  return 'NOCH NICHT VERDIENT';
}

export function WantedSearchResultTile({ result, onPress }: { result: CardSearchResult; onPress: () => void }) {
  const status = getStatus(result);
  const mockCard = wantedTargetToMockUserCard(result.target);

  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Image source={texture} style={[styles.texture, { pointerEvents: 'none' }]} />
      <View style={styles.imageBox}>
        <View style={styles.cardWrapper}>
          <CardRenderer card={mockCard} compact />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.title}>{result.title}</Text>
          <Text style={[styles.status, result.owned && styles.ownedStatus, result.wanted && styles.wantedStatus]}>{status}</Text>
        </View>
        <Text numberOfLines={1} style={styles.subtitle}>{result.subtitle}</Text>
        {result.badge ? <Text style={styles.badge}>{result.badge}</Text> : null}
      </View>
      <Ionicons color={curvao.colors.gold} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: curvao.spacing.md,
    overflow: 'hidden',
    padding: curvao.spacing.md,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  imageBox: {
    alignItems: 'center',
    backgroundColor: '#080A09',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 6,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    width: 52,
    overflow: 'hidden',
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.95 }],
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: curvao.spacing.sm,
  },
  title: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.black,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
  },
  badge: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  status: {
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    color: curvao.colors.muted,
    fontSize: 8,
    fontWeight: curvao.typography.weight.black,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ownedStatus: {
    borderColor: 'rgba(34,200,120,0.28)',
    color: '#22C878',
  },
  wantedStatus: {
    borderColor: 'rgba(216,170,77,0.34)',
    color: curvao.colors.gold,
  },
});