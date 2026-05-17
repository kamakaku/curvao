import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { CurvaoActionButton } from '@/src/components/dashboard/CurvaoActionButton';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';

const stadiumBg = require('@/assets/cards/olympiastadion_reference.png');
const herthaCrest = require('@/assets/cards/hertha_crest.png');

// Design Tokens for the Artifact
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

export function DashboardNextMatch({ match, onPress }: { match: Match; onPress?: () => void }) {
  // Mocking countdown for the UI look
  const countdown = {
    days: '02',
    hours: '05',
    minutes: '48',
    seconds: '12',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>NÄCHSTES SPIEL</Text>
      
      {/* Main Artifact Card */}
      <Pressable onPress={onPress} style={({ pressed }) => [styles.artifactCard, pressed && styles.artifactPressed]}>
        <ImageBackground source={stadiumBg} style={styles.background} imageStyle={styles.backgroundImage}>
          {/* Layered Overlays for Artifact feel */}
          <LinearGradient
            colors={['rgba(8, 10, 9, 0.95)', 'rgba(8, 10, 9, 0.4)', 'rgba(8, 10, 9, 0.75)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 1 }}
            style={styles.gradientOverlay}
          />
          
          {/* Subtle Material Texture */}
          <TextureOverlay opacity={0.08} />

          <View style={styles.content}>
            <View style={styles.mainInfoRow}>
              <View style={styles.matchTextSection}>
                <View style={styles.artifactMetaRow}>
                  <Ionicons name="calendar-sharp" size={14} color={ARTIFACT_COLORS.gold} />
                  <Text style={styles.artifactMetaText}>SA, 17.05.2026 • 15:30</Text>
                </View>
                
                <View style={styles.artifactMetaRow}>
                  <Ionicons name="location-sharp" size={14} color={ARTIFACT_COLORS.gold} />
                  <Text style={styles.artifactMetaText}>OLYMPIASTADION BERLIN</Text>
                </View>
              </View>
              
              <View style={styles.logoZone}>
                <Image source={herthaCrest} style={styles.crestLarge} resizeMode="contain" />
                <Text style={styles.vsLogoLabel}>vs.</Text>
                <View style={styles.placeholderCrestArtifact}>
                  <Text style={styles.placeholderCrestText}>S04</Text>
                </View>
              </View>
            </View>

            {/* Consolidated Countdown Dock */}
            <View style={styles.countdownDock}>
              <CountdownColumn value={countdown.days} label="TAGE" />
              <View style={styles.dockDivider} />
              <CountdownColumn value={countdown.hours} label="STD" />
              <View style={styles.dockDivider} />
              <CountdownColumn value={countdown.minutes} label="MIN" />
              <View style={styles.dockDivider} />
              <CountdownColumn value={countdown.seconds} label="SEK" />
            </View>
          </View>
        </ImageBackground>
      </Pressable>

      {/* Artifact Action Buttons */}
      <View style={styles.actions}>
        <CurvaoActionButton
          variant="live"
          title="LIVE WATCH"
          subtitle="Spiel live im TV/Radio"
          status="Belohnung sichern"
          icon="tv-outline"
          onPress={onPress}
        />

        <CurvaoActionButton
          variant="stadium"
          title="STADIUM CHECK-IN"
          subtitle="Im Stadion einchecken"
          status="Stadium Card erhalten"
          icon="location"
          onPress={onPress}
        />
      </View>
    </View>
  );
}


function CountdownColumn({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.dockColumn}>
      <Text style={styles.dockValue}>{value}</Text>
      <Text style={styles.dockLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: curvao.spacing.md,
  },
  artifactCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARTIFACT_COLORS.borderGold,
    backgroundColor: ARTIFACT_COLORS.surface,
    // Native shadow
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  artifactPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  background: {
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.35, // Stark abgedunkelt
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    padding: curvao.spacing.lg,
    zIndex: 10,
  },
  kicker: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    paddingHorizontal: 2,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: curvao.spacing.xl,
  },
  matchTextSection: {
    flex: 1,
    gap: 6,
  },
  teamNameRow: {
    gap: 2,
    marginBottom: 10,
  },
  teamName: {
    color: ARTIFACT_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  vsKicker: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    marginVertical: -2,
  },
  artifactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  artifactMetaText: {
    color: ARTIFACT_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logoZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 10,
  },
  crestLarge: {
    width: 68,
    height: 68,
  },
  vsLogoLabel: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  placeholderCrestArtifact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#004d99',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  placeholderCrestText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  // Countdown Dock
  countdownDock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5,6,6,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 14,
    paddingVertical: 10,
  },
  dockColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(216,170,77,0.15)',
    alignSelf: 'center',
  },
  dockValue: {
    color: ARTIFACT_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  dockLabel: {
    color: ARTIFACT_COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
    opacity: 0.8,
  },
  // Action Buttons
  actions: {
    flexDirection: 'row',
    gap: curvao.spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: curvao.spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.15)',
  },
  actionTextContainer: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  liveWatch: {
    backgroundColor: ARTIFACT_COLORS.surface,
  },
  stadiumCheckin: {
    backgroundColor: ARTIFACT_COLORS.gold,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkIconBg: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  actionTitle: {
    color: ARTIFACT_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  actionSub: {
    fontSize: 10,
    color: ARTIFACT_COLORS.mutedText,
    marginTop: 1,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: curvao.colors.greenBright,
  },
  rewardText: {
    fontSize: 9,
    fontWeight: '700',
    color: ARTIFACT_COLORS.mutedText,
  },
  darkText: {
    color: ARTIFACT_COLORS.background,
  },
});