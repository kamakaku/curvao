import { StyleSheet, Text, View } from 'react-native';

import { GenericCardFrame } from '@/src/components/cards/GenericCardFrame';
import { getCardVisualConfig } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function PatchCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  const config = getCardVisualConfig(card);

  return (
    <GenericCardFrame card={card} compact={compact}>
      <View style={styles.body}>
        <View style={[styles.patch, { borderColor: config.accentColor }]}>
          <Text style={[styles.patchText, { color: config.accentColor }]}>CV</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
        <Text style={styles.description} numberOfLines={compact ? 2 : 3}>{card.subtitle ?? 'Achievement patch unlocked through verified support.'}</Text>
        <Text style={styles.date}>Unlocked {new Date(card.acquiredAt).toLocaleDateString()}</Text>
      </View>
    </GenericCardFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  patch: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#0b110e',
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    width: 74,
  },
  patchText: {
    fontSize: 22,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 20,
    textAlign: 'center',
  },
  description: {
    color: curvao.colors.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
  },
});
