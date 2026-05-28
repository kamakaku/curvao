import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { curvao } from '@/src/theme/curvaoTheme';
import { useAuth } from '@/src/providers/AuthProvider';
import { getUserProgress, type UserProgress } from '@/src/services/progressService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';

const logo = require('@/assets/logo_word.png');

export function TopBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserProgress(user.id).then(setProgress).catch(console.warn);
  }, [user]);

  const avatarUrl = user?.avatar ? getPocketBaseFileUrl(user as any, user.avatar) : undefined;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
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
          <Pressable 
            onPress={() => router.push('/pass')}
            style={({ pressed }) => [styles.profileSection, pressed && styles.pressed]}
          >
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={20} color={curvao.colors.muted} />
              )}
            </View>
            <View style={styles.xpSection}>
              <Text style={styles.levelText}>LVL {progress?.level || 1}</Text>
              <Text style={styles.xpText}>{progress?.xp?.toLocaleString('de-DE') || 0} XP</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent', 
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 170, 77, 0.1)',
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
    color: curvao.colors.muted,
    fontSize: 10,
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
  pressed: {
    opacity: 0.7,
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
  avatar: {
    width: '100%',
    height: '100%',
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