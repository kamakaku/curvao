import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardMoreMenu } from '@/src/components/cards/CardMoreMenu';
import { PlayerCardDetailsAccordion } from '@/src/components/cards/player/PlayerCardDetailsAccordion';
import { PlayerConnectionCompact } from '@/src/components/cards/player/PlayerConnectionCompact';
import { PlayerContextChips } from '@/src/components/cards/player/PlayerContextChips';
import { PlayerDetailSummaryBar } from '@/src/components/cards/player/PlayerDetailSummaryBar';
import { PlayerHighlightMomentCompact } from '@/src/components/cards/player/PlayerHighlightMomentCompact';
import { PlayerInfoChips } from '@/src/components/cards/player/PlayerInfoChips';
import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getBondProgress, shareCard, toggleFavorite, upgradeCardBond, copyCardIdToClipboard } from '@/src/services/cardActionService';
import { getClubCrestSource, getPlayerCardImageSource } from '@/src/services/cardAssetService';
import { formatCardOrigin, formatEdition, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { setMainCard } from '@/src/services/cardService';
import type { UserCard } from '@/src/types/models';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = (SCREEN_HEIGHT * 3) / 5;

const HERO_COLORS = {
  bg: '#080A09',
  surface: '#121614',
  surfaceSoft: '#191E1B',
  surfaceDeep: '#070908',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  goldDark: '#8B6425',
  text: '#F4F1E8',
  muted: '#A7A39A',
  mint: '#22C878',
  borderGold: 'rgba(216,170,77,0.30)',
};

type PlayerHeroDetailProps = {
  card: UserCard;
};

function formatPosition(position: string) {
  if (position === 'FW') return 'FORWARD';
  if (position === 'MF') return 'MIDFIELD';
  if (position === 'DF') return 'DEFENSE';
  if (position === 'GK') return 'GOALKEEPER';
  return position;
}

export function PlayerHeroDetail({ card }: PlayerHeroDetailProps) {
  const insets = useSafeAreaInsets();
  const [currentCard, setCurrentCard] = useState(card);
  const [actionError, setActionError] = useState<string | undefined>();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { player, playerClub, match } = getCardRelations(currentCard);
  const bondProgress = getBondProgress(currentCard);
  
  const firstName = player?.firstName || currentCard.title.split(' ')[0] || '';
  const lastName = player?.lastName || currentCard.title.split(' ').slice(1).join(' ') || currentCard.title;
  const position = player?.position || 'PLAYER';
  const jerseyNumber = player?.shirtNumber ? `${player.shirtNumber}` : '';
  
  const playerImage = getPlayerCardImageSource(player);
  const clubCrest = getClubCrestSource(playerClub?.id);
  const primaryColor = playerClub?.primaryColor || playerClub?.secondaryColor || '#16181A';
  const locationLabel = formatLocation(playerClub?.city, playerClub?.country);
  const statusSummary = `${currentCard.favorite ? 'Favorite' : 'Not Favorite'} · ${currentCard.tradable ? 'Tradable' : 'Not Tradable'}`;
  const liveMatches = currentCard.stadiumVisitCount ?? 0;
  const momentsCount = 0;
  const ownedVariantsCount = 1;
  const verificationType = currentCard.origin === 'live_verified'
    ? 'Live Verified'
    : currentCard.origin === 'stadium_verified'
      ? 'Stadium Verified'
      : currentCard.origin === 'fan_claimed'
        ? 'Fan Claimed'
        : currentCard.origin === 'self_earned'
          ? 'Self Earned'
          : '—';
  const summaryMetrics = [
    {
      label: 'Bond Level',
      value: `L${bondProgress.level}`,
      sub: bondProgress.requiredXp
        ? `${bondProgress.currentXp.toLocaleString('de-DE')} / ${bondProgress.requiredXp.toLocaleString('de-DE')} XP`
        : `${bondProgress.currentXp.toLocaleString('de-DE')} XP`,
      progress: bondProgress.progress,
      tone: 'gold' as const,
    },
  ];
  const connectionItems = [
    {
      icon: 'people-outline' as const,
      value: `${liveMatches}`,
      label: 'Live Matches\nGesehen',
      sub: 'Erlebt & verifiziert',
      progress: Math.min(1, liveMatches / 20),
    },
    {
      icon: 'heart-outline' as const,
      value: `${bondProgress.level}`,
      label: 'Fan Bond\nLevel',
      sub: `Von ${bondProgress.isMaxLevel ? bondProgress.level : 5}`,
      progress: bondProgress.progress,
    },
    {
      icon: 'trophy-outline' as const,
      value: `${momentsCount}`,
      label: 'Momente\nGesammelt',
      sub: 'Besondere Augenblicke',
      progress: Math.min(1, momentsCount / 10),
    },
    {
      icon: 'star-outline' as const,
      value: `${ownedVariantsCount}`,
      label: 'Karten\nBesitzt',
      sub: 'Von 5 verfügbar',
      progress: Math.min(1, ownedVariantsCount / 5),
    },
  ];
  const infoChips = [
    { icon: 'shirt-outline' as const, label: 'Position', value: formatPosition(position) || '—' },
    { icon: 'calendar-outline' as const, label: 'Saison', value: currentCard.expand?.match?.season || '2025/2026' },
    ...(player?.nationality ? [{ icon: 'flag-outline' as const, label: 'Nationalität', value: player.nationality }] : []),
    ...(playerClub?.name ? [{ icon: 'people-outline' as const, label: 'Club', value: playerClub.name }] : []),
    ...((card.stadiumName || match?.stadiumName) ? [{ icon: 'location-outline' as const, label: 'Stadion', value: card.stadiumName || match?.stadiumName || '—' }] : []),
  ];
  const contextChips = [
    ...(currentCard.origin === 'live_verified' ? [{ icon: 'play-circle-outline' as const, label: 'LIVE VERIFIED' }] : []),
    ...(currentCard.origin === 'stadium_verified' ? [{ icon: 'location-outline' as const, label: 'STADIUM VERIFIED' }] : []),
    { icon: 'medal-outline' as const, label: `BOND LEVEL ${bondProgress.level}` },
    { icon: 'shirt-outline' as const, label: formatPosition(position) },
    ...(match ? [{ icon: 'football-outline' as const, label: 'MATCHDAY READY' }] : []),
    { icon: 'calendar-outline' as const, label: `CURVAO ${currentCard.expand?.match?.season || '2025/26'}` },
  ];
  const detailRows = [
    { label: 'Origin', value: formatCardOrigin(currentCard.origin) },
    { label: 'Acquired On', value: formatDate(currentCard.acquiredAt) },
    { label: 'Edition', value: formatEdition(currentCard) },
    { label: 'Status', value: currentCard.bound ? 'Bound' : currentCard.tradable ? 'Tradable' : 'Locked' },
    { label: 'Verification Type', value: verificationType },
    { label: 'Card ID', value: currentCard.id.toUpperCase() },
    { label: 'Season', value: currentCard.expand?.match?.season || '2025/2026' },
    { label: 'Rarity', value: formatRarity(currentCard.rarity) },
  ];
  const actionButtons = useMemo(
    () => [
      {
        id: 'main',
        icon: 'star' as const,
        label: currentCard.isMainCard ? 'Main Card' : 'Als Main',
        active: currentCard.isMainCard,
        disabled: currentCard.bound || currentCard.isMainCard,
        onPress: async () => {
          setActionError(undefined);
          const updated = await setMainCard(currentCard.id);
          setCurrentCard({ ...currentCard, ...updated, isMainCard: true });
        },
      },
      {
        id: 'favorite',
        icon: currentCard.favorite ? ('heart' as const) : ('heart-outline' as const),
        label: currentCard.favorite ? 'Favorit' : 'Merken',
        active: currentCard.favorite,
        onPress: async () => {
          setActionError(undefined);
          setCurrentCard((value) => ({ ...value, favorite: !value.favorite }));
          try {
            const updated = await toggleFavorite(currentCard);
            setCurrentCard((value) => ({ ...value, ...updated }));
          } catch {
            setActionError('Favorit lokal markiert. Sync später prüfen.');
          }
        },
      },
      {
        id: 'bond',
        icon: 'flash' as const,
        label: bondProgress.canUpgrade ? 'Upgrade' : 'Bond',
        active: bondProgress.canUpgrade,
        disabled: !bondProgress.canUpgrade,
        onPress: async () => {
          setActionError(undefined);
          const updated = await upgradeCardBond(currentCard);
          setCurrentCard({ ...currentCard, ...updated });
        },
      },
      {
        id: 'share',
        icon: 'share-social' as const,
        label: 'Teilen',
        onPress: async () => {
          setActionError(undefined);
          await shareCard(currentCard);
        },
      },
      {
        id: 'copy',
        icon: 'copy' as const,
        label: 'ID',
        onPress: () => {
          setActionError(undefined);
          copyCardIdToClipboard(currentCard);
          setActionError('Card-ID in der Console ausgegeben.');
        },
      },
    ],
    [bondProgress.canUpgrade, currentCard],
  );

  const runAction = async (action: (typeof actionButtons)[number]) => {
    if (action.disabled) return;
    try {
      await action.onPress();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Aktion konnte nicht ausgeführt werden.');
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: primaryColor, height: HERO_HEIGHT }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        
        <TextureOverlay opacity={0.1} />

        {jerseyNumber ? (
          <View style={styles.bgNumberContainer}>
            <Text 
              style={styles.bgNumberText} 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              minimumFontScale={0.1}
            >
              {jerseyNumber.padStart(2, '0')}
            </Text>
          </View>
        ) : null}

        <View style={styles.playerImageContainer}>
          {playerImage && (
            <Image source={playerImage} style={StyleSheet.absoluteFill} contentFit="contain" contentPosition="bottom center" />
          )}
        </View>

        <View style={[styles.topMeta, { paddingTop: Math.max(24, insets.top + 10) }]}>
          <View style={styles.topLeft}>
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{formatRarity(currentCard.rarity)}</Text>
            </View>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>{currentCard.expand?.match?.season || '2025/26'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomInfo}>
          <View style={styles.nameBlock}>
            <Text 
              style={styles.firstName} 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              minimumFontScale={0.5}
            >
              {firstName.toUpperCase()}
            </Text>
            <Text 
              style={styles.lastName} 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              minimumFontScale={0.5}
            >
              {lastName.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.positionText}>{formatPosition(position)}</Text>
          <View style={styles.locationPill}>
            <Ionicons color="#F4F1E8" name="location-sharp" size={13} />
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>
        </View>

        <View style={styles.clubBadgeContainer}>
          <View style={styles.crestCircle}>
            <Image source={clubCrest} style={styles.clubCrest} contentFit="contain" />
          </View>
        </View>
        </View>

        <View style={styles.lowerContent}>
          <PlayerDetailSummaryBar metrics={summaryMetrics} />

          <View style={styles.cardControlRowCompact}>
            <View style={styles.cardControlStatusList}>
              <View style={[styles.cardControlStatusChip, (currentCard.favorite || currentCard.tradable) && styles.cardControlStatusChipActive]}>
                <Ionicons name={currentCard.favorite ? 'heart' : 'heart-outline'} color={currentCard.favorite ? HERO_COLORS.goldSoft : HERO_COLORS.muted} size={13} />
                <Ionicons name="swap-horizontal" color={currentCard.tradable ? HERO_COLORS.goldSoft : HERO_COLORS.muted} size={13} />
                <Text style={[styles.cardControlStatusText, (currentCard.favorite || currentCard.tradable) && styles.cardControlStatusTextActive]}>
                  {statusSummary}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setIsOptionsOpen(true)}
              style={({ pressed }) => [styles.optionsButton, pressed && styles.optionsButtonPressed]}
            >
              <Ionicons name="ellipsis-horizontal" color="#FFF" size={22} />
            </Pressable>
          </View>

          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

          <PlayerConnectionCompact
            ctaLabel={`LEVEL ${bondProgress.level} FAN >`}
            items={connectionItems}
            title="DEINE VERBINDUNG"
          />

          <PlayerInfoChips chips={infoChips} title="SPIELER INFOS" />

          <PlayerContextChips chips={contextChips} title="CARD KONTEXT" />

          <PlayerHighlightMomentCompact />

          <PlayerCardDetailsAccordion rows={detailRows} />
        </View>
      </ScrollView>

      <CardMoreMenu
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        actions={[
          actionButtons.slice(0, 3).map((action) => ({
            label: action.label,
            icon: action.icon,
            active: action.active,
            disabled: action.disabled,
            onPress: () => {
              void runAction(action);
            },
          })),
          actionButtons.slice(3).map((action) => ({
            label: action.label,
            icon: action.icon,
            active: action.active,
            disabled: action.disabled,
            onPress: () => {
              void runAction(action);
            },
          })),
        ]}
      />
    </>
  );
}

function formatLocation(city?: string, country?: string) {
  const countryShort = country ? country.slice(0, 2).toUpperCase() : 'UK';
  return `${city ?? 'LONDON'}, ${countryShort}`;
}

function formatDate(value?: string) {
  if (!value) return 'UNKNOWN DATE';
  return new Date(value).toLocaleDateString('de-DE');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#07080A',
  },
  content: {
    paddingBottom: 120,
  },
  heroCard: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bgNumberContainer: {
    position: 'absolute',
    bottom: '18%',
    left: -22,
    right: -22,
    zIndex: 3,
  },
  bgNumberText: {
    color: '#111317',
    fontSize: 360,
    fontWeight: '900',
    opacity: 0.44,
    letterSpacing: 0,
    lineHeight: 350,
    textAlign: 'center',
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  topLeft: {
    gap: 8,
  },
  cardControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardControlRowCompact: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 20,
  },
  cardControlStatusList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  cardControlStatusChip: {
    alignItems: 'center',
    backgroundColor: '#262B31',
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  cardControlStatusChipActive: {
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.30)',
  },
  cardControlStatusText: {
    color: 'rgba(244,241,232,0.74)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cardControlStatusTextActive: {
    color: HERO_COLORS.goldSoft,
  },
  optionsButton: {
    alignItems: 'center',
    backgroundColor: '#101316',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 52,
  },
  optionsButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  rarityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  seasonBadge: {
    paddingLeft: 2,
  },
  seasonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.7,
  },
  playerImageContainer: {
    position: 'absolute',
    bottom: '5%',
    left: 0,
    right: 0,
    height: '85%',
    zIndex: 5,
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    zIndex: 15,
    gap: 0,
  },
  nameBlock: {
    gap: 0,
  },
  firstName: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.85,
  },
  lastName: {
    color: '#FFF',
    fontSize: 86,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 82,
    textShadow: '0px 4px 20px rgba(0,0,0,0.6)',
  },
  positionText: {
    color: HERO_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 6,
    opacity: 0.9,
  },
  locationPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28,31,36,0.92)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationText: {
    color: '#F4F1E8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  clubBadgeContainer: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    zIndex: 20,
  },
  crestCircle: {
    width: 72,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubCrest: {
    width: '100%',
    height: '100%',
  },
  lowerContent: {
    backgroundColor: '#07080A',
    paddingTop: 0,
  },
  bondPanel: {
    backgroundColor: '#262B31',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  bondHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bondLabel: {
    color: HERO_COLORS.goldSoft,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  bondTitle: {
    color: HERO_COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  bondXp: {
    color: HERO_COLORS.muted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: HERO_COLORS.goldSoft,
    borderRadius: 999,
    height: '100%',
  },
  bondHint: {
    color: 'rgba(244,241,232,0.58)',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
  },
  statusStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    alignItems: 'center',
    backgroundColor: '#262B31',
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 74,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  statusChipActive: {
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.30)',
  },
  statusLabel: {
    color: HERO_COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: 'rgba(244,241,232,0.78)',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  statusValueActive: {
    color: HERO_COLORS.goldSoft,
  },
  actionError: {
    color: HERO_COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: -2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#F4F1E8',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  paginationDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  dotActive: {
    backgroundColor: '#F4F1E8',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#2B3037',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 96,
    padding: 12,
    width: '48%',
  },
  infoTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 22,
    marginTop: 8,
  },
  infoMeta: {
    color: 'rgba(255,255,255,0.46)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
