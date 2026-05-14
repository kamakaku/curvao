import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCardOrigin, formatEdition, getCardVisualConfig } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

type Props = PropsWithChildren<{
  card: UserCard;
  compact?: boolean;
}>;

export function GenericCardFrame({ card, compact, children }: Props) {
  const config = getCardVisualConfig(card);

  return (
    <View style={[styles.frame, compact && styles.compact, { borderColor: config.borderColor }]}>
      <View style={styles.topRow}>
        <Text style={[styles.typeBadge, { color: config.accentColor, borderColor: config.accentColor }]}>{config.badgeLabel}</Text>
        <Text style={styles.edition}>{formatEdition(card)}</Text>
      </View>

      {children}

      <View style={styles.bottomRow}>
        <Text style={styles.origin}>{formatCardOrigin(card.origin)}</Text>
        <View style={styles.indicators}>
          {card.archived ? <Text style={styles.indicator}>ARCHIVED</Text> : null}
          {card.tradable ? <Text style={styles.indicator}>TRADABLE</Text> : null}
          {card.bound ? <Text style={styles.indicator}>BOUND</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function GenericFallbackCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  const config = getCardVisualConfig(card);

  return (
    <GenericCardFrame card={card} compact={compact}>
      <View style={styles.fallbackBody}>
        <Text style={[styles.frameLabel, { color: config.accentColor }]}>{config.frameLabel}</Text>
        <Text style={styles.title} numberOfLines={compact ? 2 : 3}>{card.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{card.subtitle ?? card.type}</Text>
      </View>
    </GenericCardFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#101713',
    borderRadius: curvao.radius.md,
    borderWidth: 2,
    minHeight: 224,
    overflow: 'hidden',
    padding: 12,
    width: '100%',
  },
  compact: {
    minHeight: 186,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeBadge: {
    borderRadius: curvao.radius.sm,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  edition: {
    color: curvao.colors.muted,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'right',
  },
  bottomRow: {
    borderTopColor: curvao.colors.border,
    borderTopWidth: 1,
    gap: 8,
    marginTop: 'auto',
    paddingTop: 9,
  },
  origin: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  indicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  indicator: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '800',
  },
  fallbackBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  frameLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: curvao.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 13,
  },
});
