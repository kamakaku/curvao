import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardMoreMenu } from '@/src/components/cards/CardMoreMenu';
import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getBondProgress, shareCard, toggleFavorite, upgradeCardBond, copyCardIdToClipboard } from '@/src/services/cardActionService';
import { getClubCrestSource, getPlayerImageSource } from '@/src/services/cardAssetService';
import { formatEdition, formatOrigin, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
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
  const { player, playerClub, match, homeClub, awayClub } = getCardRelations(currentCard);
  const bondProgress = getBondProgress(currentCard);
  
  const firstName = player?.firstName || currentCard.title.split(' ')[0] || '';
  const lastName = player?.lastName || currentCard.title.split(' ').slice(1).join(' ') || currentCard.title;
  const position = player?.position || 'PLAYER';
  const jerseyNumber = player?.shirtNumber ? `${player.shirtNumber}` : '';
  
  const playerImage = getPlayerImageSource(player?.id);
  const clubCrest = getClubCrestSource(playerClub?.id);
  const primaryColor = playerClub?.primaryColor || '#DC052D';
  const locationLabel = formatLocation(playerClub?.city, playerClub?.country);
  const matchLabel = match ? `${homeClub?.shortName ?? homeClub?.name ?? 'Home'} VS ${awayClub?.shortName ?? awayClub?.name ?? 'Away'}` : 'NO MATCH';
  const statusSummary = `${currentCard.favorite ? 'Favorite' : 'Not Favorite'} · ${currentCard.tradable ? 'Tradable' : 'Not Tradable'}`;
  const infoCards = [
    { id: 'rarity', icon: 'diamond' as const, label: 'Rarity', value: formatRarity(currentCard.rarity), meta: 'Frame' },
    { id: 'origin', icon: 'shield-checkmark' as const, label: 'Origin', value: formatOrigin(currentCard.origin), meta: 'Proof' },
    { id: 'edition', icon: 'albums' as const, label: 'Edition', value: formatEdition(currentCard), meta: currentCard.tradable ? 'Tradable' : 'Bound' },
    { id: 'club', label: 'CLUB', value: playerClub?.shortName ?? playerClub?.name ?? 'CURVAO', meta: playerClub?.city ?? 'CURVAO' },
    { id: 'match', label: 'MATCH', value: matchLabel, meta: match ? formatDate(match.kickoffAt) : 'ARCHIVE' },
    { id: 'acquired', icon: 'calendar' as const, label: 'Erhalten', value: formatDate(currentCard.acquiredAt), meta: 'Collection' },
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
        <View style={styles.cardControlRow}>
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

        <View style={styles.bondPanel}>
          <View style={styles.bondHeader}>
            <View>
              <Text style={styles.bondLabel}>PLAYER BOND</Text>
              <Text style={styles.bondTitle}>Level {bondProgress.level}</Text>
            </View>
            <Text style={styles.bondXp}>{bondProgress.currentXp}/{bondProgress.requiredXp || 'MAX'} XP</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(bondProgress.progress * 100)}%` }]} />
          </View>
          <Text style={styles.bondHint}>
            {bondProgress.isMaxLevel ? 'Max Level erreicht.' : `${bondProgress.remainingXp} XP bis zum nächsten Bond-Level.`}
          </Text>
        </View>

        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CARD INTEL</Text>
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.infoGrid}>
          {infoCards.map((item) => (
            <View key={item.id} style={styles.infoCard}>
              <View style={styles.infoTopRow}>
                <Ionicons name={item.icon ?? 'information-circle'} color={HERO_COLORS.goldSoft} size={17} />
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>{item.value}</Text>
              <Text style={styles.infoMeta} numberOfLines={1}>{item.meta}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: '#1F2227',
  },
  content: {
    paddingBottom: 120,
  },
  heroCard: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    backgroundColor: '#1F2227',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
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
    borderRadius: 16,
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
