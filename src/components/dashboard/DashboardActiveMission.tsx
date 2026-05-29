import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const packageStandard = require('@/assets/package_standard.png');

export function DashboardActiveMission() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>AKTIVE MISSION</Text>
      
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.title}>Dein erstes Live Match</Text>
            <Text style={styles.desc}>Schau dein nächstes Spiel live oder sei im Stadion dabei.</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>0/1</Text>
            </View>
          </View>

          {/* Real Pack Image */}
          <View style={styles.packContainer}>
             <Image 
               source={packageStandard} 
               style={styles.packImage} 
               resizeMode="contain" 
             />
          </View>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>BELOHNUNG</Text>
            <Text style={styles.rewardValue}>100 XP</Text>
            <Text style={styles.rewardSub}>+ 1 MATCH CARD</Text>
            
            <View style={styles.chevronContainer}>
               <Ionicons name="chevron-forward-sharp" size={18} color={curvao.colors.muted} />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: curvao.spacing.md,
  },
  kicker: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: 'rgba(12, 13, 14, 0.50)',
    borderRadius: 8,
    padding: curvao.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(118, 92, 54, 0.25)',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  info: {
    flex: 2.2,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  desc: {
    color: curvao.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(214, 173, 75, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '0%', // Start at 0
    height: '100%',
    backgroundColor: curvao.colors.gold,
  },
  progressText: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  packContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  packImage: {
    width: 80,
    height: 120,
    transform: [{ rotate: '12deg' }],
  },
  rewardContainer: {
    flex: 1.4,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  rewardLabel: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.8,
  },
  rewardValue: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  rewardSub: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  chevronContainer: {
    marginTop: 10,
    alignSelf: 'flex-end',
    opacity: 0.6,
  },
});
