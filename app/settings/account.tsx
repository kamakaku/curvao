import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { useAuth } from '@/src/providers/AuthProvider';
import { requestPasswordReset } from '@/src/services/authService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestPasswordReset(user.email);
      setSuccess(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      if (__DEV__) {
        console.warn('Logout failed');
      }
    }
  };

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>E-MAIL & PASSWORT</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBox}>
          <Text style={styles.label}>REGISTRIERTE E-MAIL</Text>
          <Text style={styles.value}>{user?.email}</Text>
          <Text style={styles.hint}>Die E-Mail-Adresse kann aus Sicherheitsgründen derzeit nicht in der App geändert werden. Bitte wende dich an den Support.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PASSWORT ÄNDERN</Text>
          <Text style={styles.sectionText}>
            Wir senden dir einen sicheren Link an deine E-Mail-Adresse, über den du dein Passwort neu vergeben kannst.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Wenn ein Account existiert, erhältst du eine E-Mail.</Text>
            </View>
          ) : null}

          <AuthButton 
            label="Passwort-Link senden" 
            onPress={handlePasswordReset} 
            loading={loading}
            variant="secondary"
          />
        </View>

        <View style={styles.dangerZone}>
          <AuthButton 
            label="Auf allen Geräten abmelden" 
            onPress={handleLogout} 
            variant="text"
          />
        </View>

      </ScrollView>
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.15)',
    padding: 20,
    marginBottom: 32,
  },
  label: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  value: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  hint: {
    color: curvao.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionText: {
    color: curvao.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  dangerZone: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(184,87,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,87,77,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34,200,120,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,200,120,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: curvao.colors.greenBright,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
