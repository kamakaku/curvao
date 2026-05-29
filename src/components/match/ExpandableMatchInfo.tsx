import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';
import { formatKickoffTime, formatMatchDate } from '@/src/utils/matchUtils';

type ExpandableMatchInfoProps = {
  match: Match;
};

export function ExpandableMatchInfo({ match }: ExpandableMatchInfoProps) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const stadiumName = match.expand?.stadium?.name || match.stadiumName;
    const stadiumCity = match.expand?.stadium?.city || match.stadiumCity;
    
    return [
      { label: 'Kickoff', value: `${formatMatchDate(match)} · ${formatKickoffTime(match)}` },
      { label: 'Stadium', value: `${stadiumName}${stadiumCity ? ` · ${stadiumCity}` : ''}` },
      { label: 'Competition', value: match.competition },
      { label: 'Saison', value: match.season },
    ];
  }, [match]);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.headerButton}>
        <Text style={styles.title}>MATCH INFO</Text>
        <Ionicons color={curvao.colors.muted} name={open ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      <Text numberOfLines={1} style={styles.summary}>{rows[0].value} · {match.expand?.stadium?.name || match.stadiumName} · {match.competition}</Text>

      {open ? (
        <View style={styles.details}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label.toUpperCase()}</Text>
              <Text numberOfLines={2} style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.72)',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  headerButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  summary: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  details: {
    gap: 8,
    marginTop: 10,
  },
  row: {
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    gap: 2,
    paddingTop: 8,
  },
  label: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
