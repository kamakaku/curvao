import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { curvao } from '@/src/theme/curvaoTheme';

type AuthScreenShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

const logo = require('@/assets/logo_word.png');

export function AuthScreenShell({ children, title, subtitle }: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.slogan}>EARNED. NOT BOUGHT.</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.formContainer}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080A09',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    height: 32,
    width: 180,
    marginBottom: 8,
  },
  slogan: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.8,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
});
