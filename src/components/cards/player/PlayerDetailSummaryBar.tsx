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
        <View style={styles.singleTopRow}>
          <View style={styles.singleTitleContainer}>
            <Text style={styles.label}>{singleMetric.label}</Text>
            <Text
              style={[
                styles.singleValueCompact,
                singleMetric.tone === 'gold' && styles.valueGold,
                singleMetric.tone === 'mint' && styles.valueMint,
              ]}
            >
              {singleMetric.value}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.singleSub}>
            {singleMetric.sub ?? '—'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, (singleMetric.progress ?? 0) * 100))}%` },
            ]}
          />
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
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  singleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  singleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
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
  singleValueCompact: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
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
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  progressTrack: {
    backgroundColor: COLORS.track,
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: COLORS.fill,
    borderRadius: 999,
    height: '100%',
  },
});
