import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surface: '#16181A',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: '#252528',
  track: 'rgba(255,255,255,0.08)',
  fill: '#D8AA4D',
};

type SummaryMetric = {
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  tone?: 'default' | 'gold' | 'mint';
};

export function PlayerDetailSummaryBar({ metrics }: { metrics: SummaryMetric[] }) {
  const singleMetric = metrics.length === 1 ? metrics[0] : null;

  if (singleMetric) {
    return (
      <View style={[styles.card, styles.singleCard]}>
        <View style={styles.singleLeft}>
          <Text style={styles.label}>{singleMetric.label}</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={[
              styles.singleValue,
              singleMetric.tone === 'gold' && styles.valueGold,
              singleMetric.tone === 'mint' && styles.valueMint,
            ]}
          >
            {singleMetric.value}
          </Text>
          <Text numberOfLines={1} style={styles.singleSub}>
            {singleMetric.sub ?? '—'}
          </Text>
        </View>
        <View style={styles.singleRight}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(100, (singleMetric.progress ?? 0) * 100))}%` },
              ]}
            />
          </View>
          <Text style={styles.singleProgressLabel}>
            {singleMetric.progress !== undefined
              ? `${Math.round(Math.max(0, Math.min(100, singleMetric.progress * 100)))}% bis nächstes Level`
              : '—'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {metrics.map((metric, index) => (
        <View key={metric.label} style={[styles.column, index < metrics.length - 1 && styles.columnDivider]}>
          <Text style={styles.label}>{metric.label}</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={1}
            style={[
              styles.value,
              metric.tone === 'gold' && styles.valueGold,
              metric.tone === 'mint' && styles.valueMint,
            ]}
          >
            {metric.value}
          </Text>
          {metric.progress !== undefined ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, metric.progress * 100))}%` }]} />
            </View>
          ) : (
            <Text numberOfLines={1} style={styles.sub}>{metric.sub ?? '—'}</Text>
          )}
          {metric.progress !== undefined ? <Text numberOfLines={1} style={styles.sub}>{metric.sub ?? '—'}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 14,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.85,
    shadowRadius: 9,
    elevation: 12,
  },
  singleCard: {
    alignItems: 'center',
    minHeight: 112,
    paddingHorizontal: 14,
  },
  column: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 5,
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  columnDivider: {
    borderRightColor: 'rgba(255,255,255,0.08)',
    borderRightWidth: 1,
  },
  singleLeft: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingRight: 18,
  },
  singleRight: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    maxWidth: 176,
  },
  label: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  singleValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
  },
  valueGold: {
    color: COLORS.gold,
  },
  valueMint: {
    color: COLORS.fill,
  },
  sub: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'left',
  },
  singleSub: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  progressTrack: {
    backgroundColor: COLORS.track,
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: COLORS.fill,
    borderRadius: 999,
    height: '100%',
  },
  singleProgressLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
});
