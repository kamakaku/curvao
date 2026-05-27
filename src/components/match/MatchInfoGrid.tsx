import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';
import { formatKickoffTime, formatMatchDate } from '@/src/utils/matchUtils';

type MatchInfoGridProps = {
  match: Match;
};

export function MatchInfoGrid({ match }: MatchInfoGridProps) {
  const stadiumName = match.expand?.stadium?.name || match.stadiumName;
  const stadiumCity = match.expand?.stadium?.city || match.stadiumCity;
  const stadiumCapacity = match.expand?.stadium?.capacity || match.stadiumCapacity;

  const items = [
    { label: 'Competition', value: match.competition },
    { label: 'Kickoff', value: `${formatMatchDate(match)} · ${formatKickoffTime(match)}` },
    { label: 'Stadium', value: `${stadiumName}${stadiumCity ? ` · ${stadiumCity}` : ''}` },
    match.season ? { label: 'Saison', value: match.season } : undefined,
    stadiumCapacity ? { label: 'Kapazität', value: stadiumCapacity.toLocaleString('de-DE') } : undefined,
  ].filter((item): item is { label: string; value: string } => Boolean(item?.value));

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>MATCH INFO</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <Text style={styles.label}>{item.label.toUpperCase()}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    backgroundColor: 'rgba(18,22,20,0.82)',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 14,
    width: '48%',
  },
  label: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  value: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
});
