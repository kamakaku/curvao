import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { WantedEarnPaths } from '@/src/components/cards/WantedEarnPaths';
import { wantedCardToMockUserCard } from '@/src/services/wantedCardService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { EarnPath, WantedCard } from '@/src/services/wantedCardService';

const texture = require('../../../assets/textures/curvao_universal_texture_overlay_2048.png');

function getTypeLabel(type: WantedCard['targetType']) {
  switch (type) {
    case 'player':
      return 'Player';
    case 'match':
      return 'Match';
    case 'stadium':
      return 'Stadium';
    default:
      return 'Special';
  }
}

type WantedCardTileProps = {
  wantedCard: WantedCard;
  title: string;
  subtitle?: string;
  earnPaths: EarnPath[];
  onRemove: () => void;
  onPress?: () => void;
  onOpenSet?: () => void;
  onOpenMatch?: () => void;
};

export function WantedCardTile({ wantedCard, title, subtitle, earnPaths, onRemove, onPress, onOpenSet, onOpenMatch }: WantedCardTileProps) {
  const mockCard = wantedCardToMockUserCard(wantedCard);

  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Image source={texture} style={[styles.texture, { pointerEvents: 'none' }]} />
      <View style={styles.imageBox}>
        <View style={styles.cardWrapper}>
          <CardRenderer card={mockCard} compact />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.status}>GESUCHT</Text>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
          </View>
          <Pressable onPress={(e) => { e.stopPropagation(); onRemove(); }} style={styles.removeButton}>
            <Ionicons color={curvao.colors.muted} name="close" size={16} />
          </Pressable>
        </View>

        <Text numberOfLines={1} style={styles.subtitle}>{subtitle ?? getTypeLabel(wantedCard.targetType)}</Text>
        <Text style={styles.meta}>{getTypeLabel(wantedCard.targetType)} · Noch nicht verdient</Text>
        <WantedEarnPaths paths={earnPaths} />

        <View style={styles.actions}>
          {onOpenSet ? (
            <Pressable onPress={(e) => { e.stopPropagation(); onOpenSet(); }} style={styles.actionButton}>
              <Text style={styles.actionLabel}>Zum Set</Text>
            </Pressable>
          ) : null}
          {onOpenMatch ? (
            <Pressable onPress={(e) => { e.stopPropagation(); onOpenMatch(); }} style={styles.actionButton}>
              <Text style={styles.actionLabel}>Zum Match</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.20)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: curvao.spacing.md,
    overflow: 'hidden',
    padding: curvao.spacing.md,
    boxShadow: '0px 10px 16px rgba(0,0,0,0.18)',
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  imageBox: {
    alignItems: 'center',
    backgroundColor: '#080A09',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 94,
    justifyContent: 'center',
    width: 66,
    overflow: 'hidden',
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.95 }],
  },
  body: {
    flex: 1,
    gap: 8,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: curvao.spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  status: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.4,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.black,
    marginTop: 3,
  },
  removeButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
  },
  meta: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: curvao.typography.weight.bold,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.sm,
  },
  actionButton: {
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionLabel: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
  },
});
