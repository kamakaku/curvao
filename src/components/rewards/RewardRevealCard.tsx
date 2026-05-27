import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { CardTile } from '@/src/components/CardTile';
import { curvao } from '@/src/theme/curvaoTheme';
import type { PackageReward } from '@/src/services/rewardPackageService';

export function RewardRevealCard({ reward }: { reward: PackageReward }) {
  if (reward.userCard) {
    return (
      <View style={styles.cardReward}>
        <CardTile card={reward.userCard} fullWidth />
        <Text style={styles.cardMeta}>{reward.rarity?.toUpperCase() ?? 'STANDARD'} · LIVE VERIFIED</Text>
      </View>
    );
  }

  const icon = reward.type === 'xp' ? 'flash-outline' : reward.type === 'bond_xp' ? 'link-outline' : 'ribbon-outline';

  return (
    <View style={styles.rewardBox}>
      <View style={styles.rewardIcon}>
        <Ionicons name={icon} size={36} color={curvao.colors.gold} />
      </View>
      <Text style={styles.rewardTitle}>{reward.title}</Text>
      {reward.subtitle ? <Text style={styles.rewardSubtitle}>{reward.subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardReward: {
    gap: 10,
    width: 240,
  },
  cardMeta: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  rewardBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.88)',
    borderColor: 'rgba(216,170,77,0.26)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    minHeight: 230,
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  rewardIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 38,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  rewardTitle: {
    color: curvao.colors.text,
    fontSize: 28,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  rewardSubtitle: {
    color: curvao.colors.muted,
    fontSize: 14,
    fontWeight: curvao.typography.weight.bold,
    textAlign: 'center',
  },
});
