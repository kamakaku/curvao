import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Switch } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { curvao } from '@/src/theme/curvaoTheme';

export default function NotificationsSettingsScreen() {
  const router = useRouter();

  // In a real app, these would come from user.preferences or a local store
  const [settings, setSettings] = useState({
    matchReminder: true,
    liveWatch: true,
    packs: true,
    trading: false,
    setCompletion: true,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>BENACHRICHTIGUNGEN</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={20} color={curvao.colors.gold} />
          <Text style={styles.hintText}>
            Push-Benachrichtigungen werden in einer kommenden Version aktiviert. 
            Du kannst deine Präferenzen aber bereits jetzt festlegen.
          </Text>
        </View>

        <SettingsSection title="EVENTS & MATCHES">
          <ToggleItem 
            label="Match Reminder" 
            description="Erinnere mich an anstehende Spiele meines Clubs."
            value={settings.matchReminder} 
            onValueChange={() => toggleSwitch('matchReminder')} 
          />
          <ToggleItem 
            label="Live Watch Erinnerung" 
            description="Erhalte eine Nachricht, wenn der Check-in startet."
            value={settings.liveWatch} 
            onValueChange={() => toggleSwitch('liveWatch')} 
          />
        </SettingsSection>

        <SettingsSection title="CARDS & SAMMLUNG">
          <ToggleItem 
            label="Pack Rewards" 
            description="Informiere mich über neue Drops und erspielte Packs."
            value={settings.packs} 
            onValueChange={() => toggleSwitch('packs')} 
          />
          <ToggleItem 
            label="Set Completion" 
            description="Benachrichtige mich, wenn ich ein Set vervollständige."
            value={settings.setCompletion} 
            onValueChange={() => toggleSwitch('setCompletion')} 
          />
          <ToggleItem 
            label="Trading Updates" 
            description="Status-Updates zu meinen Tauschanfragen."
            value={settings.trading} 
            onValueChange={() => toggleSwitch('trading')} 
            isLast
          />
        </SettingsSection>

      </ScrollView>
    </CurvaoScreen>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function ToggleItem({ 
  label, 
  description,
  value, 
  onValueChange,
  isLast
}: { 
  label: string; 
  description: string;
  value: boolean; 
  onValueChange: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.item, !isLast && styles.itemBorder]}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDesc}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(216,170,77,0.4)' }}
        thumbColor={value ? curvao.colors.gold : '#f4f3f4'}
        ios_backgroundColor="rgba(255,255,255,0.1)"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: curvao.colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(216,170,77,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.3)',
    padding: 16,
    marginBottom: 32,
    alignItems: 'flex-start',
    gap: 12,
  },
  hintText: {
    color: curvao.colors.text,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    opacity: 0.9,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.1)',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  itemLabel: {
    color: curvao.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDesc: {
    color: curvao.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.8,
  },
});
