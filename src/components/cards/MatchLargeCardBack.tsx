import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import type { CardOrigin, Rarity, UserCard, Club } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');

const CURVAO = {
  surface: '#080A09',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
};

const CARD_WIDTH = 380;
const CARD_HEIGHT = 543;

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getVerificationDisplay(origin: CardOrigin): { label: string; icon: keyof typeof Ionicons.glyphMap } {
  switch (origin) {
    case 'stadium_verified':
      return { label: 'GPS + MATCHDAY', icon: 'shield-checkmark-outline' };
    case 'live_verified':
    case 'logged_viewing':
      return { label: 'LIVE WATCH', icon: 'eye-outline' };
    default:
      return { label: 'CURVAO AUTHENTICATED', icon: 'checkmark-circle-outline' };
  }
}

export function MatchLargeCardBack({ card }: { card: UserCard }) {
  const { match, homeClub, awayClub, stadium } = getCardRelations(card);
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const seasonText = match?.season ?? "2025/26";
  const verification = getVerificationDisplay(card.origin);
  const acquisitionDate = formatDate(card.acquiredAt);
  const editionText = card.editionNumber 
    ? `#${card.editionNumber}${card.editionSize ? ` / ${card.editionSize.toLocaleString('de-DE')}` : ''}`
    : 'OPEN EDITION';

  const history = [
    { date: formatDate(match?.kickoffAt ?? card.acquiredAt), label: `Match verified via ${card.origin.replace('_', ' ').toUpperCase()}` },
    { date: acquisitionDate, label: 'Proof archived in Collection' },
    { date: acquisitionDate, label: 'Experience authenticated by CURVAO' },
  ];

  return (
    <View style={styles.cardBase}>
      <Image source={cardBaseBlank} style={styles.backgroundImage} />
      <TextureOverlay opacity={0.15} />

      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.rarityLabel}>{rarityLabel}</Text>
            <RarityStars rarity={card.rarity} />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.seasonLabel}>SEASON</Text>
            <Text style={styles.seasonValue}>{seasonText}</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.matchTitle}>
            {homeClub?.name?.toUpperCase() || 'HOME'} VS {awayClub?.name?.toUpperCase() || 'AWAY'}
          </Text>
          <Text style={styles.competitionName}>{match?.competition?.toUpperCase() || 'VERIFIED MATCH'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Details Grid */}
        <View style={styles.grid}>
          <View style={styles.gridColumn}>
            <DetailRow label="STADIUM" value={stadium?.name?.toUpperCase() || 'VERIFIED'} icon="location-outline" />
            <DetailRow label="CITY" value={stadium?.city?.toUpperCase() || '—'} icon="map-outline" />
            <DetailRow label="KICKOFF" value={formatDate(match?.kickoffAt)} icon="calendar-outline" />
            <DetailRow label="STATUS" value="VERIFIED · ARCHIVED" icon="lock-closed-outline" />
          </View>
          <View style={styles.gridColumn}>
            <DetailRow label="VERIFICATION" value={verification.label} icon={verification.icon} />
            <DetailRow label="RESULT" value={`${match?.homeScore ?? '–'}:${match?.awayScore ?? '–'}`} icon="football-outline" />
            <DetailRow label="ATTENDANCE" value={match?.stadiumCapacity ? match.stadiumCapacity.toLocaleString('de-DE') : '—'} icon="people-outline" />
            <DetailRow label="COMPETITION" value={match?.competition?.toUpperCase() || 'LIGA'} icon="trophy-outline" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Timeline */}
        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>MATCH EVENT HISTORY</Text>
          <View style={styles.timelineContainer}>
            {history.map((item, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={styles.timelineTrack}>
                  <View style={styles.historyDot} />
                  {i < history.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>ACQUIRED ON {acquisitionDate}</Text>
            <Text style={styles.footerText}>EDITION {editionText}</Text>
          </View>
          <Text style={styles.cardId}>CARD ID: CV-M-{String(card.editionNumber ?? 0).padStart(7, '0')}</Text>
        </View>
      </View>
    </View>
  );
}

function DetailRow({ label, value, icon, color }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color?: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={11} color={color ?? CURVAO.gold} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
        <Text 
          style={[styles.detailValue, color ? { color } : {}]} 
          numberOfLines={2} 
          adjustsFontSizeToFit 
          minimumFontScale={0.8}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function RarityStars({ rarity }: { rarity: string }) {
  const stars = rarity === 'standard' ? 1 : rarity === 'rare' ? 2 : 3;
  return (
    <View style={styles.starsRow}>
      {[...Array(3)].map((_, i) => (
        <Ionicons key={i} name={i < stars ? "star" : "star-outline"} size={12} color={CURVAO.gold} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#080A09',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'stretch',
    transform: [{ scaleX: -1 }], 
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: '7%',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  rarityLabel: {
    color: CURVAO.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  seasonLabel: {
    color: CURVAO.muted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  seasonValue: {
    color: CURVAO.gold,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  heroSection: {
    marginBottom: 12,
  },
  matchTitle: {
    color: CURVAO.gold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  competitionName: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.15)',
    marginVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridColumn: {
    flex: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    color: CURVAO.muted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  detailValue: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 11,
  },
  historySection: {
    flex: 1,
    marginTop: 5,
  },
  sectionLabel: {
    color: CURVAO.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
    opacity: 0.8,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  historyRow: {
    flexDirection: 'row',
    minHeight: 28,
  },
  timelineTrack: {
    width: 20,
    alignItems: 'center',
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CURVAO.gold,
    zIndex: 2,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    top: 10,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(216,170,77,0.2)',
    left: 9.5,
    zIndex: 1,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 8,
    flex: 1,
  },
  historyDate: {
    color: CURVAO.muted,
    fontSize: 8,
    fontWeight: '700',
    width: 60,
    marginTop: 2,
  },
  historyLabel: {
    color: CURVAO.text,
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 1,
    flexShrink: 1,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    paddingBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: CURVAO.gold,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  cardId: {
    color: CURVAO.muted,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.4,
  },
});
