import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { useAuth } from '@/src/providers/AuthProvider';
import { finishCurrentCheckedInLiveMatch } from '@/src/services/devMatchService';
import { resetCurrentUserEarnedData } from '@/src/services/devResetService';
import { curvao } from '@/src/theme/curvaoTheme';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [resetArmed, setResetArmed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [finishMatchArmed, setFinishMatchArmed] = useState(false);
  const [finishingMatch, setFinishingMatch] = useState(false);

  const handleLogout = async () => {
    // In a real app, you might want to show a confirmation dialog here
    try {
      await logout();
      // AuthProvider will detect the change and redirect
    } catch {
      if (__DEV__) {
        console.warn('Logout failed');
      }
    }
  };

  const handleResetEarnedData = async () => {
    if (!user?.id || resetting) return;

    if (!resetArmed) {
      setResetArmed(true);
      setResetMessage('Zum Bestätigen erneut tippen.');
      return;
    }

    setResetting(true);
    setResetMessage(null);
    try {
      const result = await resetCurrentUserEarnedData(user.id);
      setResetMessage(`Testdaten gelöscht (${result.deletedRemoteRecords + result.deletedLocalRecords}).`);
      setResetArmed(false);
    } catch {
      setResetMessage('Testdaten konnten nicht vollständig gelöscht werden.');
    } finally {
      setResetting(false);
    }
  };

  const handleFinishCurrentMatch = async () => {
    if (!user?.id || finishingMatch) return;

    if (!finishMatchArmed) {
      setFinishMatchArmed(true);
      setResetArmed(false);
      setResetMessage('Zum Bestätigen erneut tippen: aktuelles Match beenden.');
      return;
    }

    setFinishingMatch(true);
    setResetMessage(null);
    try {
      const result = await finishCurrentCheckedInLiveMatch(user.id);
      setResetMessage(
        result.rewardPackageIds.length > 0
          ? `Match beendet. ${result.rewardPackageIds.length} Reward Package(s) erstellt.`
          : `Match beendet (${result.matchId}).`,
      );
      setFinishMatchArmed(false);
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : 'Aktuelles Match konnte nicht beendet werden.');
    } finally {
      setFinishingMatch(false);
    }
  };

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>EINSTELLUNGEN</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SettingsSection title="ACCOUNT">
          <SettingsItem 
            icon="person-outline" 
            label="Profil bearbeiten" 
            onPress={() => router.push('/settings/profile')} 
          />
          <SettingsItem 
            icon="mail-outline" 
            label="E-Mail & Passwort" 
            onPress={() => router.push('/settings/account')} 
          />
          <SettingsItem 
            icon="shield-checkmark-outline" 
            label="Sicherheit" 
            onPress={() => {}} 
            disabled 
            hint="Demnächst" 
          />
        </SettingsSection>

        <SettingsSection title="APP">
          <SettingsItem 
            icon="notifications-outline" 
            label="Benachrichtigungen" 
            onPress={() => router.push('/settings/notifications')} 
          />
          <SettingsItem 
            icon="color-palette-outline" 
            label="Darstellung" 
            onPress={() => router.push('/settings/appearance')} 
          />
        </SettingsSection>

        <SettingsSection title="CARDS & SAMMLUNG">
          <SettingsItem 
            icon="star-outline" 
            label="Showcase" 
            onPress={() => {}} 
            disabled 
            hint="Demnächst"
          />
          <SettingsItem 
            icon="swap-horizontal-outline" 
            label="Trading Einstellungen" 
            onPress={() => {}} 
            disabled 
            hint="Demnächst"
          />
        </SettingsSection>

        <SettingsSection title="SUPPORT">
          <SettingsItem 
            icon="help-buoy-outline" 
            label="Hilfe" 
            onPress={() => {}} 
            disabled
          />
          <SettingsItem 
            icon="chatbubble-ellipses-outline" 
            label="Feedback" 
            onPress={() => {}} 
            disabled
          />
        </SettingsSection>

        <SettingsSection title="RECHTLICHES">
          <SettingsItem 
            icon="document-text-outline" 
            label="Datenschutz" 
            onPress={() => router.push('/settings/privacy')} 
          />
          <SettingsItem 
            icon="document-outline" 
            label="Nutzungsbedingungen" 
            onPress={() => router.push('/settings/legal')} 
          />
        </SettingsSection>

        <SettingsSection title="DANGER ZONE" hideDivider>
          <SettingsItem
            icon="stop-circle-outline"
            label={finishMatchArmed ? 'Bestätigen: aktuelles Match beenden' : 'Aktuelles Match beenden'}
            onPress={handleFinishCurrentMatch}
            disabled={finishingMatch}
            danger
            hint={finishingMatch ? 'Beendet…' : 'Dev'}
          />
          <SettingsItem
            icon="refresh-circle-outline"
            label={resetArmed ? 'Bestätigen: Testdaten löschen' : 'Meine Testdaten zurücksetzen'}
            onPress={handleResetEarnedData}
            disabled={resetting}
            danger
            hint={resetting ? 'Löscht…' : 'Dev'}
          />
          {resetMessage ? <Text style={styles.resetMessage}>{resetMessage}</Text> : null}
          <SettingsItem 
            icon="log-out-outline" 
            label="Abmelden" 
            onPress={handleLogout} 
            danger 
          />
          <SettingsItem 
            icon="trash-outline" 
            label="Account löschen" 
            onPress={() => {}} 
            disabled 
            danger 
            hint="TODO"
          />
        </SettingsSection>
      </ScrollView>
    </CurvaoScreen>
  );
}

function SettingsSection({ title, children, hideDivider }: { title: string; children: React.ReactNode; hideDivider?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
      {!hideDivider && <View style={styles.divider} />}
    </View>
  );
}

function SettingsItem({ 
  icon, 
  label, 
  onPress, 
  danger, 
  disabled, 
  hint 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  onPress: () => void; 
  danger?: boolean; 
  disabled?: boolean;
  hint?: string;
}) {
  const color = danger ? curvao.colors.danger : curvao.colors.text;
  
  return (
    <Pressable 
      style={({ pressed }) => [styles.item, pressed && !disabled && styles.itemPressed, disabled && styles.itemDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={20} color={color} style={styles.itemIcon} />
        <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      </View>
      
      <View style={styles.itemRight}>
        {hint && <Text style={styles.itemHint}>{hint}</Text>}
        <Ionicons name="chevron-forward" size={16} color={curvao.colors.muted} opacity={0.5} />
      </View>
    </Pressable>
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
    paddingTop: 20,
    paddingBottom: 80,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.1)',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.1)',
    marginTop: 24,
    marginHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  itemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    opacity: 0.9,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemHint: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetMessage: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
