import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { curvao } from '@/src/theme/curvaoTheme';

export default function AppearanceSettingsScreen() {
  const router = useRouter();

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>DARSTELLUNG</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBox}>
          <Ionicons name="moon" size={32} color={curvao.colors.gold} style={styles.icon} />
          <Text style={styles.title}>Dark Mode</Text>
          <Text style={styles.text}>
            CURVAO ist nativ im Dark Mode gestaltet, um die Sammelkarten optimal in Szene zu setzen. 
            Ein Light Mode wird derzeit nicht unterstützt.
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
    alignItems: 'center',
    paddingTop: 60,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.15)',
    padding: 30,
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  text: {
    color: curvao.colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
  },
});
