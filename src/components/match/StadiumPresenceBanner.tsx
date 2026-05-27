import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type StadiumPresenceBannerProps = {
  live?: boolean;
  title?: string;
  text: string;
  compact?: boolean;
};

export function StadiumPresenceBanner({
  live = false,
  title = 'Du bist gerade im Stadion',
  text,
  compact = false,
}: StadiumPresenceBannerProps) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!live) {
      pulse.setValue(0.6);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [live, pulse]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.iconWrap}>
        {live ? (
          <View style={styles.liveIndicatorWrap}>
            <Animated.View style={[styles.livePulse, { opacity: pulse, transform: [{ scale: pulse }] }]} />
            <View style={styles.liveDot} />
          </View>
        ) : (
          <Ionicons color={curvao.colors.gold} name="location" size={20} />
        )}
      </View>
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {live ? <Text style={styles.liveLabel}>LIVE</Text> : null}
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(29,22,8,0.8)',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  containerCompact: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  liveIndicatorWrap: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  livePulse: {
    backgroundColor: 'rgba(232,58,58,0.35)',
    borderRadius: 999,
    height: 18,
    position: 'absolute',
    width: 18,
  },
  liveDot: {
    backgroundColor: '#E83A3A',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  liveLabel: {
    color: '#E83A3A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  text: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
