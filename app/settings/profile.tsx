import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Modal, FlatList } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { useAuth } from '@/src/providers/AuthProvider';
import { updateUserProfile } from '@/src/services/authService';
import { getClubs } from '@/src/services/matchService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Club } from '@/src/types/models';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [favoriteClubId, setFavoriteClubId] = useState(user?.favoriteClubId || '');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isClubModalVisible, setIsClubModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getClubs().then(setClubs).catch(console.warn);
  }, []);

  const selectedClub = clubs.find(c => c.id === favoriteClubId);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        favoriteClub: favoriteClubId || undefined,
      } as any);
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const selectClub = (id: string) => {
    setFavoriteClubId(id);
    setIsClubModalVisible(false);
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
            <Ionicons name="person" size={40} color={curvao.colors.muted} />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.avatarHint}>AVATAR ÄNDERN</Text>
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

          <Pressable onPress={() => setIsClubModalVisible(true)}>
            <View pointerEvents="none">
              <AuthTextInput
                label="LIEBLINGSCLUB"
                placeholder="Club wählen…"
                value={selectedClub?.name || ''}
                editable={false}
              />
            </View>
          </Pressable>
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

      <Modal
        visible={isClubModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsClubModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>LIEBLINGSCLUB WÄHLEN</Text>
              <Pressable onPress={() => setIsClubModalVisible(false)}>
                <Ionicons name="close" size={24} color={curvao.colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={clubs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.clubItem} 
                  onPress={() => selectClub(item.id)}
                >
                  <Text style={[styles.clubNameItem, item.id === favoriteClubId && styles.clubNameSelected]}>
                    {item.name}
                  </Text>
                  {item.id === favoriteClubId && (
                    <Ionicons name="checkmark" size={20} color={curvao.colors.gold} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
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
    borderRadius: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0C0D0E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  clubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  clubNameItem: {
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  clubNameSelected: {
    color: curvao.colors.gold,
    fontWeight: '800',
  },
});
