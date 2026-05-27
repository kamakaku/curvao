import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { curvao } from '@/src/theme/curvaoTheme';

export default function PrivacySettingsScreen() {
  const router = useRouter();

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>DATENSCHUTZ</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.documentBox}>
          <Text style={styles.text}>
            {/* TODO: Load real privacy policy text */}
            Hier stehen in Kürze die vollständigen Datenschutzbestimmungen für CURVAO.
            {"\n\n"}
            Wir nehmen den Schutz deiner persönlichen Daten sehr ernst. Alle Standortdaten (GPS) für den Stadium Check-in werden ausschließlich zur Verifizierung des Matches genutzt und nicht dauerhaft getrackt.
          </Text>
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
    paddingBottom: 80,
  },
  documentBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  text: {
    color: curvao.colors.muted,
    fontSize: 14,
    lineHeight: 24,
  }
});