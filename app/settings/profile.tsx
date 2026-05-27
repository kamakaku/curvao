import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { useAuth } from '@/src/providers/AuthProvider';
import { updateUserProfile } from '@/src/services/authService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile({
        name: name.trim(),
        username: username.trim() || undefined,
      });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>PROFIL BEARBEITEN</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Ionicons name="person" size={40} color={curvao.colors.muted} />
            ) : (
              <Ionicons name="person" size={40} color={curvao.colors.muted} />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.avatarHint}>AVATAR ÄNDERN (TODO)</Text>
        </View>

        <View style={styles.formContainer}>
          <AuthTextInput
            label="NAME"
            placeholder="Dein Vor- und Nachname"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
          />

          <AuthTextInput
            label="USERNAME"
            placeholder="dein_spielername"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            textContentType="username"
          />

          {/* Optional Fields placeholder */}
          <AuthTextInput
            label="LIEBLINGSCLUB"
            placeholder="Noch nicht festgelegt"
            value=""
            onChangeText={() => {}}
            editable={false}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Profil erfolgreich aktualisiert.</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AuthButton 
            label="SPEICHERN" 
            onPress={handleSave} 
            loading={loading}
          />
          <AuthButton 
            label="Abbrechen" 
            onPress={() => router.back()} 
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
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: curvao.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: curvao.colors.gold,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#080A09',
  },
  avatarHint: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.5,
  },
  formContainer: {
    marginBottom: 24,
  },
  actions: {
    marginTop: 16,
    gap: 8,
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
