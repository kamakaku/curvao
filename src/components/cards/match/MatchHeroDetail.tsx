import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground, StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = (SCREEN_HEIGHT * 3) / 5;

const stadiumBg = require('@/assets/cards/olympiastadion_reference.png');

const ARTIFACT_COLORS = {
  background: '#080A09',
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  textPrimary: '#F4F1E8',
  mutedText: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.28)',
};

export function MatchHeroDetail({ card }: { card: UserCard }) {
  const insets = useSafeAreaInsets();
  const { match, homeClub, awayClub, stadium } = getCardRelations(card);

  const homeCrest = getClubCrestSource(homeClub?.id);
  const awayCrest = getClubCrestSource(awayClub?.id);
  
  const kickoffDate = match?.kickoffAt 
    ? new Date(match.kickoffAt).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'SA, 17.05.2026';
  const kickoffTime = match?.kickoffAt 
    ? new Date(match.kickoffAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : '15:30';

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <ImageBackground source={stadiumBg} style={[styles.background, { height: HERO_HEIGHT }]} imageStyle={styles.backgroundImage}>
          <LinearGradient
            colors={['rgba(8, 10, 9, 0.95)', 'rgba(8, 10, 9, 0.4)', 'rgba(8, 10, 9, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 1 }}
            style={styles.gradientOverlay}
          />
          
          <TextureOverlay opacity={0.08} />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.rarityBadge}>
                  <Text style={styles.rarityText}>{formatRarity(card.rarity).toUpperCase()}</Text>
              </View>
              <Text style={styles.seasonLine}>SAISON {match?.season || '2025/26'}</Text>
            </View>

            <View style={styles.mainInfoRow}>
              <View style={styles.matchTextSection}>
                <View style={styles.artifactMetaRow}>
                  <Ionicons name="calendar-sharp" size={16} color={ARTIFACT_COLORS.gold} />
                  <Text style={styles.artifactMetaText}>{kickoffDate} • {kickoffTime}</Text>
                </View>
                
                <View style={styles.artifactMetaRow}>
                  <Ionicons name="location-sharp" size={16} color={ARTIFACT_COLORS.gold} />
                  <Text style={styles.artifactMetaText}>{stadium?.name?.toUpperCase() || card.stadiumName?.toUpperCase() || 'OLYMPIASTADION BERLIN'}</Text>
                </View>

                <View style={styles.teamNamesSection}>
                  <Text style={styles.teamName}>{homeClub?.name?.toUpperCase() || 'HOME'}</Text>
                  <Text style={styles.vsKicker}>VS</Text>
                  <Text style={styles.teamName}>{awayClub?.name?.toUpperCase() || 'AWAY'}</Text>
                </View>
              </View>
              
              <View style={styles.logoZone}>
                <Image source={homeCrest} style={styles.crestLarge} resizeMode="contain" />
                <Text style={styles.vsLogoLabel}>vs.</Text>
                <Image source={awayCrest} style={styles.crestLarge} resizeMode="contain" />
              </View>
            </View>

            {/* Large Result Display instead of Countdown if match is finished/live */}
            <View style={styles.resultDock}>
              <View style={styles.dockColumn}>
                <Text style={styles.dockLabel}>HOME</Text>
                <Text style={styles.dockValue}>{match?.homeScore ?? '-'}</Text>
              </View>
              <View style={styles.dockDivider} />
              <View style={styles.dockColumnCenter}>
                  <Text style={styles.statusLabel}>{match?.status === 'finished' ? 'FINAL' : 'LIVE'}</Text>
                  <Text style={styles.competitionText}>{match?.competition?.toUpperCase() || 'WETTBEWERB'}</Text>
              </View>
              <View style={styles.dockDivider} />
              <View style={styles.dockColumn}>
                <Text style={styles.dockLabel}>AWAY</Text>
                <Text style={styles.dockValue}>{match?.awayScore ?? '-'}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    width: '100%',
  },
  wrapper: {
    backgroundColor: ARTIFACT_COLORS.background,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARTIFACT_COLORS.borderGold,
  },
  background: {
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.35,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    zIndex: 10,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rarityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rarityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  seasonLine: {
    color: ARTIFACT_COLORS.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  matchTextSection: {
    flex: 1,
    gap: 8,
  },
  artifactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  artifactMetaText: {
    color: ARTIFACT_COLORS.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  teamNamesSection: {
    marginTop: 20,
    gap: 4,
  },
  teamName: {
    color: ARTIFACT_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  vsKicker: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 16,
    fontWeight: '900',
    marginVertical: -2,
  },
  logoZone: {
    alignItems: 'center',
    gap: 12,
    paddingLeft: 20,
  },
  crestLarge: {
    width: 72,
    height: 72,
  },
  vsLogoLabel: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  resultDock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5,6,6,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 30,
  },
  dockColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockColumnCenter: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dockDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(216,170,77,0.15)',
    alignSelf: 'center',
  },
  dockValue: {
    color: ARTIFACT_COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '900',
  },
  dockLabel: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 2,
    opacity: 0.8,
  },
  statusLabel: {
    color: curvao.colors.greenBright,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  competitionText: {
    color: ARTIFACT_COLORS.mutedText,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
});
