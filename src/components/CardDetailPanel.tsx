import { StyleSheet, Text, View } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RarityBadge } from '@/src/components/RarityBadge';
import { formatCardOrigin, formatEdition } from '@/src/services/cardTemplateService';
import { getPlayerName } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function CardDetailPanel({ card, onClose }: { card?: UserCard; onClose?: () => void }) {
  if (!card) {
    return null;
  }

  const rows = [
    ['Type', card.type],
    ['Origin', formatCardOrigin(card.origin)],
    ['Edition', formatEdition(card)],
    ['Tradable', card.tradable ? 'Yes' : 'No'],
    ['Archived', card.archived ? 'Yes' : 'No'],
    ['Bound', card.bound ? 'Yes' : 'No'],
    ['Player', card.player ? getPlayerName(card.player) : 'None'],
    ['Match', card.match ?? 'None'],
  ];

  return (
    <View style={styles.panel}>
      <CardRenderer card={card} />
      <View style={styles.detailBody}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.subtitle}>{card.subtitle}</Text>
          </View>
          <RarityBadge rarity={card.rarity} />
        </View>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
        {onClose ? <PrimaryButton label="Close" onPress={onClose} variant="secondary" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 10,
  },
  detailBody: {
    backgroundColor: curvao.colors.surfaceElevated,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: curvao.colors.muted,
    marginTop: 4,
  },
  row: {
    borderTopColor: curvao.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  label: {
    color: curvao.colors.muted,
  },
  value: {
    color: curvao.colors.text,
    flex: 1,
    fontWeight: '700',
    textAlign: 'right',
  },
});
