import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const backgroundSource = require('@/assets/bg_1.png');
const logoSource = require('@/assets/logo_word.png');

type Props = PropsWithChildren<{
  step?: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}>;

export function OnboardingShell({ children, step, totalSteps = 7, title, subtitle, onBack }: Props) {
  return (
    <View style={styles.root}>
      <Image source={backgroundSource} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color={curvao.colors.gold} />
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <Image source={logoSource} style={styles.logo} contentFit="contain" />
          <View style={styles.backButton} />
        </View>

        {step ? (
          <View style={styles.progressRow}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View key={index} style={[styles.progressDot, index < step && styles.progressDotActive]} />
            ))}
          </View>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080A09',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 32,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
  },
  progressDot: {
    width: 18,
    height: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  progressDotActive: {
    backgroundColor: curvao.colors.gold,
  },
  header: {
    gap: 10,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: curvao.colors.text,
    opacity: 0.82,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
