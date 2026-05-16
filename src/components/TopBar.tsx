import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { curvao } from '@/src/theme/curvaoTheme';

const logo = require('@/assets/logo_word.png');

export function TopBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left Side: Logo & Subline */}
        <View style={styles.leftSection}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.sublineRow}>
            <View style={styles.sublineDash} />
            <Text style={styles.subline}>EARNED. NOT BOUGHT.</Text>
            <View style={styles.sublineDash} />
          </View>
        </View>

        {/* Right Side: Bell, Avatar, Level/XP */}
        <View style={styles.rightSection}>
          <Ionicons name="notifications-outline" size={24} color={curvao.colors.text} style={styles.bellIcon} />
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={curvao.colors.muted} />
            </View>
            <View style={styles.xpSection}>
              <Text style={styles.levelText}>LVL 12</Text>
              <Text style={styles.xpText}>4.250 XP</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', 
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: curvao.spacing.lg,
    paddingVertical: curvao.spacing.sm,
    height: 70, 
  },
  leftSection: {
    gap: 2,
  },
  logo: {
    height: 24,
    width: 130, 
  },
  sublineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 2,
    marginTop: 2,
  },
  sublineDash: {
    width: 8,
    height: 1,
    backgroundColor: curvao.colors.gold,
    opacity: 0.8,
  },
  subline: {
    color: curvao.colors.muted, // Muted is better for secondary info
    fontSize: 10, // Larger for readability
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellIcon: {
    marginRight: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: curvao.colors.gold,
    overflow: 'hidden',
    backgroundColor: curvao.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpSection: {
    justifyContent: 'center',
  },
  levelText: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpText: {
    color: curvao.colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
});
