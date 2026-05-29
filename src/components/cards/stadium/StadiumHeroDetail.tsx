import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardMoreMenu } from '@/src/components/cards/CardMoreMenu';
import { PlayerCardDetailsAccordion } from '@/src/components/cards/player/PlayerCardDetailsAccordion';
import { PlayerCardHistoryAccordion } from '@/src/components/cards/player/PlayerCardHistoryAccordion';
import { StadiumBiographyBoxes } from '@/src/components/cards/stadium/StadiumBiographyBoxes';
import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { shareCard, toggleFavorite, copyCardIdToClipboard } from '@/src/services/cardActionService';
import { formatCardOrigin, formatEdition, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { curvao } from '@/src/theme/curvaoTheme';
import type { EarnPath } from '@/src/services/wantedCardService';
import type { UserCard } from '@/src/types/models';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = (SCREEN_HEIGHT * 3) / 5;

const olympiastadionImage = require('@/assets/cards/olympiastadion_reference.png');

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

type StadiumHeroDetailProps = {
  card: UserCard;
};

export function StadiumHeroDetail({ card, wantedState }: { card: UserCard; wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; }; }) {
  const insets = useSafeAreaInsets();
  const [currentCard, setCurrentCard] = useState(card);
  const [actionError, setActionError] = useState<string | undefined>();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { stadium, stadiumClub } = getCardRelations(currentCard);
  
  const stadiumImageUrl = getPocketBaseFileUrl(stadium, stadium?.image) ?? getPocketBaseFileUrl(currentCard, currentCard.stadiumImage);
  const stadiumImageSource = stadiumImageUrl ? { uri: stadiumImageUrl } : olympiastadionImage;
  const primaryColor = stadiumClub?.primaryColor || '#121614';

  const verificationType = currentCard.origin === 'live_verified'
    ? 'Live Verified'
    : currentCard.origin === 'stadium_verified'
      ? 'Stadium Verified'
      : currentCard.origin === 'fan_claimed'
        ? 'Fan Claimed'
        : currentCard.origin === 'self_earned'
          ? 'Self Earned'
          : '—';

  const detailRows = [
    { label: 'Origin', value: formatCardOrigin(currentCard.origin) },
    { label: 'Acquired On', value: new Date(currentCard.acquiredAt).toLocaleDateString('de-DE') },
    { label: 'Edition', value: formatEdition(currentCard) },
    { label: 'Status', value: currentCard.bound ? 'Bound' : currentCard.tradable ? 'Tradable' : 'Locked' },
    { label: 'Verification Type', value: verificationType },
    { label: 'Card ID', value: currentCard.id.toUpperCase() },
    { label: 'Season', value: currentCard.expand?.match?.season || '2025/2026' },
    { label: 'Rarity', value: formatRarity(currentCard.rarity) },
  ];

  const statusChips = [
    ...(wantedState?.isOwned
      ? [{ key: 'owned', icon: 'checkmark-circle' as const, label: 'Besitzt', tone: 'mint' as const }]
      : []),
    ...(wantedState && !wantedState.isOwned && wantedState.isWanted
      ? [{ key: 'wanted', icon: 'search' as const, label: 'Gesucht', tone: 'gold' as const }]
      : []),
    ...(currentCard.favorite
      ? [{ key: 'favorite', icon: 'heart' as const, label: 'Favorit', tone: 'gold' as const }]
      : []),
    ...(currentCard.tradable
      ? [{ key: 'tradable', icon: 'swap-horizontal' as const, label: 'Tauschbar', tone: 'default' as const }]
      : []),
    ...(currentCard.bound
      ? [{ key: 'bound', icon: 'lock-closed' as const, label: 'Gebunden', tone: 'muted' as const }]
      : []),
  ];

  const actionButtons = useMemo(
    () => [
      ...(wantedState && !wantedState.isOwned
        ? [{
            id: 'wanted',
            icon: (wantedState.isWanted ? 'bookmark' : 'bookmark-outline') as 'bookmark' | 'bookmark-outline',
            label: wantedState.isWanted ? 'Gesucht' : 'Suchen',
            active: wantedState.isWanted,
            disabled: false,
            onPress: async () => wantedState.onToggleWanted(),
          }]
        : []),
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
    [currentCard, wantedState],
  );

  const runAction = async (action: (typeof actionButtons)[number]) => {
    if ('disabled' in action && action.disabled) return;
    try {
      await action.onPress();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Aktion konnte nicht ausgeführt werden.');
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: primaryColor, height: HERO_HEIGHT }]}>
          {/* Background Gradients */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
          
          <TextureOverlay opacity={0.15} />

          {/* Stadium Image Background */}
          <View style={styles.imageLayer}>
            <Image 
              source={stadiumImageSource} 
              style={StyleSheet.absoluteFill} 
              contentFit="cover" 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* Top Meta */}
          <View style={[styles.topMeta, { paddingTop: Math.max(24, insets.top + 10) }]}>
            <View style={styles.topLeft}>
              <View style={styles.rarityBadge}>
                <Text style={styles.rarityText}>{formatRarity(currentCard.rarity).toUpperCase()}</Text>
              </View>
              <View style={styles.seasonBadge}>
                <Text style={styles.seasonText}>2025/26 COLLECTION</Text>
              </View>
            </View>
            
            <View style={styles.topRight}>
              <View style={styles.typeBadge}>
                <Ionicons name="map" size={12} color="#FFF" />
                <Text style={styles.typeText}>STADIUM</Text>
              </View>
            </View>
          </View>

          {/* Name & City bottom left */}
          <View style={styles.bottomInfo}>
            <View style={styles.nameBlock}>
              <Text style={styles.cityName}>{stadium?.city?.toUpperCase() || 'CITY'}</Text>
              <Text 
                  style={styles.stadiumName}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
              >
                  {stadium?.name?.toUpperCase() || currentCard.title.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.visitRow}>
              <Ionicons name="navigate-outline" size={14} color={HERO_COLORS.mint} />
              <Text style={styles.visitText}>GPS VERIFIED · {currentCard.stadiumVisitCount ?? 1} VISITS</Text>
            </View>
          </View>
        </View>

        <View style={styles.lowerContent}>
          <View style={styles.cardControlRowCompact}>
            <View style={styles.cardControlStatusList}>
              {statusChips.map((chip) => (
                <View
                  key={chip.key}
                  style={[
                    styles.cardControlStatusChip,
                    chip.tone === 'gold' && styles.cardControlStatusChipGold,
                    chip.tone === 'muted' && styles.cardControlStatusChipMuted,
                    chip.tone === 'mint' && styles.cardControlStatusChipMint,
                  ]}
                >
                  <Ionicons
                    name={chip.icon}
                    color={
                      chip.tone === 'gold'
                        ? HERO_COLORS.goldSoft
                        : chip.tone === 'muted'
                          ? HERO_COLORS.muted
                          : chip.tone === 'mint'
                            ? HERO_COLORS.mint
                            : HERO_COLORS.text
                    }
                    size={13}
                  />
                  <Text
                    style={[
                      styles.cardControlStatusText,
                      chip.tone === 'gold' && styles.cardControlStatusTextGold,
                      chip.tone === 'muted' && styles.cardControlStatusTextMuted,
                      chip.tone === 'mint' && styles.cardControlStatusTextMint,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>

            {wantedState && !wantedState.isOwned && (
              <Pressable
                onPress={wantedState.onToggleWanted}
                style={({ pressed }) => [
                  styles.wantedIconButton,
                  wantedState.isWanted && styles.wantedIconButtonActive,
                  pressed && styles.optionsButtonPressed,
                ]}
              >
                <Ionicons
                  name={wantedState.isWanted ? 'bookmark' : 'bookmark-outline'}
                  color={wantedState.isWanted ? HERO_COLORS.gold : '#FFF'}
                  size={18}
                />
                <Text style={[styles.wantedButtonText, wantedState.isWanted && styles.wantedButtonTextActive]}>
                  {wantedState.isWanted ? 'GESUCHT' : 'MARKIERE ALS GESUCHT'}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setIsOptionsOpen(true)}
              style={({ pressed }) => [styles.optionsButton, pressed && styles.optionsButtonPressed]}
            >
              <Ionicons name="ellipsis-horizontal" color="#FFF" size={22} />
            </Pressable>
          </View>
          
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

          <StadiumBiographyBoxes card={currentCard} />

          <PlayerCardDetailsAccordion rows={detailRows} />
          <PlayerCardHistoryAccordion cardId={currentCard.id} />
        </View>
      </ScrollView>

      <CardMoreMenu
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        actions={[
          actionButtons.map((action) => ({
            label: action.label,
            icon: action.icon,
            active: action.active,
            disabled: 'disabled' in action ? Boolean(action.disabled) : false,
            onPress: () => {
              void runAction(action);
            },
          })),
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#07080A',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  heroCard: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  topLeft: {
    gap: 6,
  },
  topRight: {},
  rarityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.7,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    zIndex: 15,
  },
  nameBlock: {
    gap: 0,
    marginBottom: 8,
  },
  cityName: {
    color: HERO_COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  stadiumName: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 56,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.9,
  },
  visitText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  lowerContent: {
    backgroundColor: '#07080A',
    paddingTop: 0,
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
    backgroundColor: '#16181A',
    borderColor: '#252528',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 30,
    paddingHorizontal: 11,
  },
  cardControlStatusChipGold: {
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.28)',
  },
  cardControlStatusChipMuted: {
    backgroundColor: '#121416',
    borderColor: '#252528',
  },
  cardControlStatusChipMint: {
    backgroundColor: 'rgba(34,200,120,0.10)',
    borderColor: 'rgba(34,200,120,0.28)',
  },
  cardControlStatusText: {
    color: HERO_COLORS.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardControlStatusTextGold: {
    color: HERO_COLORS.goldSoft,
  },
  cardControlStatusTextMuted: {
    color: HERO_COLORS.muted,
  },
  cardControlStatusTextMint: {
    color: HERO_COLORS.mint,
  },
  optionsButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 52,
  },
  wantedIconButton: {
    alignItems: 'center',
    backgroundColor: '#101316',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  wantedIconButtonActive: {
    borderColor: HERO_COLORS.gold,
    backgroundColor: 'rgba(216,170,77,0.15)',
  },
  wantedButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  wantedButtonTextActive: {
    color: HERO_COLORS.gold,
  },
  optionsButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  actionError: {
    color: HERO_COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: -2,
    paddingHorizontal: 20,
  },
});