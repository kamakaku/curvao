import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

import { ClubCrest } from '@/src/components/cards/ClubCrest';
import { PlayerStandardFrameSvg } from '@/src/components/cards/PlayerStandardFrameSvg';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { formatEdition, formatOrigin, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Club, Rarity, UserCard } from '@/src/types/models';

const cardBackBackgroundSource = require('@/assets/cards/player_standard_v2_bg--back.png');

const BACK_INNER_BORDER_PATH =
  'M202.834 32H493.206H499.794H790.166L806.167 48.2849H908.291L961 101.9293V1294.08L901.702 1354.43H593.918L561.916 1387H498.853H494.147H431.084L399.082 1354.43H91.2979L32 1294.08V101.9293L84.7092 48.2849H186.833L202.834 32Z';

const rarityAccent: Record<Rarity, { green: string; gold: string; border: string }> = {
  standard: { green: '#8fa79b', gold: '#bd9947', border: '#8fa79b' },
  rare: { green: '#21ad69', gold: '#d7b86a', border: '#bd9947' },
  epic: { green: '#8b6cf0', gold: '#d7b86a', border: '#8b6cf0' },
  legendary: { green: '#d6ad4b', gold: '#f0c84a', border: '#d6ad4b' },
  oneoff: { green: '#f7d66b', gold: '#fff2a0', border: '#fff2a0' },
};

const HISTORY_PREVIEW_LIMIT = 4;

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('de-DE');
}

function formatScore(homeScore?: number, awayScore?: number) {
  if (typeof homeScore === 'number' && typeof awayScore === 'number') {
    return `${homeScore}:${awayScore}`;
  }

  return '–:–';
}

function getClubLabel(club?: Club, fallback = 'CLUB') {
  return club?.shortName ?? club?.name ?? fallback;
}

function getCrestSource(club?: Club): ImageSourcePropType | undefined {
  const crestUrl = getPocketBaseFileUrl(club, club?.crest);
  return crestUrl ? { uri: crestUrl } : getClubCrestSource(club?.id);
}

function cardId(card: UserCard) {
  return `CV-M-${String(card.editionNumber ?? 0).padStart(7, '0')}`;
}

function normalizeScorers(values?: string[]) {
  return values?.filter(Boolean) ?? [];
}

export function MatchCardBack({ card }: { card: UserCard }) {
  const { match, stadium, homeClub, awayClub } = getCardRelations(card);
  const accent = rarityAccent[card.rarity];
  const date = formatDate(match?.kickoffAt ?? card.acquiredAt);
  const origin = formatOrigin(card.origin);
  const edition = formatEdition(card);
  const homeScorers = normalizeScorers(match?.homeGoalScorers);
  const awayScorers = normalizeScorers(match?.awayGoalScorers);
  const stadiumName = stadium?.name ?? match?.stadiumName ?? 'Verified Stadium';
  const stadiumCity = stadium?.city ?? match?.stadiumCity;
  const score = formatScore(match?.homeScore, match?.awayScore);
  const historyEvents = [
    { date, text: `Earned (${origin})` },
    { date, text: 'Added to Archive' },
    { date, text: 'Match Card Minted' },
    { date, text: 'Check-in Verified' },
    { date, text: 'Proof stored in Archive' },
  ];
  const visibleHistoryEvents = historyEvents.slice(0, HISTORY_PREVIEW_LIMIT);
  const hiddenHistoryCount = Math.max(historyEvents.length - visibleHistoryEvents.length, 0);
  const backgroundClipId = `matchCardBackBackgroundClip-${card.id}-${card.rarity}`;

  return (
    <View style={[styles.back, { borderColor: accent.border }]}> 
      <View pointerEvents="none" style={styles.frameShadowLayer}>
        <PlayerStandardFrameSvg layer="shadow" rarity={card.rarity} />
      </View>
      <View style={styles.backContent}>
        <View pointerEvents="none" style={styles.backBackground}>
          <Svg height="100%" viewBox="0 0 992 1419.5" width="100%">
            <Defs>
              <ClipPath id={backgroundClipId}>
                <Path d={BACK_INNER_BORDER_PATH} />
              </ClipPath>
            </Defs>
            <SvgImage
              clipPath={`url(#${backgroundClipId})`}
              height="1419.5"
              href={cardBackBackgroundSource}
              preserveAspectRatio="xMidYMid slice"
              width="992"
              x="0"
              y="0"
            />
          </Svg>
        </View>
        <View style={[styles.heroPanel, { borderColor: accent.gold }]}> 
          <View style={styles.crestPair}>
            <ClubCrest size={38} source={getCrestSource(homeClub)} />
            <ClubCrest size={38} source={getCrestSource(awayClub)} />
          </View>
          <View style={styles.heroText}>
            <View style={styles.rarityLine}>
              <Ionicons name="diamond-outline" size={10} color={accent.gold} />
              <Text style={[styles.rarityLineText, { color: accent.gold }]}>{formatRarity(card.rarity)}</Text>
              <View style={styles.rarityStars}>
                <Ionicons name="star" size={8} color={accent.gold} />
                <Ionicons name="star" size={8} color="rgba(189,153,71,0.35)" />
                <Ionicons name="star" size={8} color="rgba(189,153,71,0.35)" />
              </View>
            </View>
            <Text style={[styles.matchTitle, { color: accent.gold }]} numberOfLines={1}>
              {`${getClubLabel(homeClub, 'HOME')} vs ${getClubLabel(awayClub, 'AWAY')}`.toUpperCase()}
            </Text>
            <Text style={[styles.competition, { color: accent.green }]} numberOfLines={1}>
              {(match?.competition ?? card.subtitle ?? 'MATCH CARD').toUpperCase()}
            </Text>
            <Text style={styles.metaLine}>SEASON {match?.season ?? '2025/26'} • {date}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.score, { color: accent.gold }]}>{score}</Text>
            <Text style={[styles.scoreLabel, { color: accent.green }]}>ENDSTAND</Text>
          </View>
        </View>

        <View style={styles.twoColumn}>
          <InfoPanel title="HERKUNFT" accent={accent.green}>
            <View style={styles.originRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={accent.gold} />
              <Text style={[styles.originText, { color: accent.gold }]}>{origin}</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color={accent.green} />
            </View>
            <Text style={styles.smallLabel}>Earned at</Text>
            <Text style={styles.primaryText}>{stadiumName}</Text>
            <Text style={styles.secondaryText}>{stadiumCity ?? date}</Text>
            <View style={styles.originEditionRow}>
              <Ionicons name="pricetag-outline" size={14} color={accent.gold} />
              <Text style={styles.originEditionLabel}>Edition</Text>
              <Text style={styles.originEditionValue}>{edition}</Text>
            </View>
          </InfoPanel>

          <InfoPanel title="MATCHDATEN" accent={accent.green}>
            <Attribute icon="football-outline" label="Match" value={`${getClubLabel(homeClub, 'HOME')} ${score} ${getClubLabel(awayClub, 'AWAY')}`} color={accent.gold} />
            <Attribute icon="calendar-outline" label="Datum" value={date} color={accent.gold} />
            <Attribute icon="trophy-outline" label="Wettbewerb" value={match?.competition ?? '—'} color={accent.gold} />
            <Attribute icon="location-outline" label="Stadion" value={stadiumName} color={accent.gold} last />
          </InfoPanel>
        </View>

        <View style={styles.twoColumn}>
          <InfoPanel title="TORSCHÜTZEN" accent={accent.green}>
            <ScorerList club={getClubLabel(homeClub, 'HOME')} scorers={homeScorers} color={accent.gold} />
            <ScorerList club={getClubLabel(awayClub, 'AWAY')} scorers={awayScorers} color={accent.gold} last />
          </InfoPanel>

          <InfoPanel title="NUTZEN" accent={accent.green}>
            <Benefit icon="shield-checkmark-outline" text="Match Card ist Proof und nicht tradable" color={accent.gold} />
            <Benefit icon="archive-outline" text="Bleibt dauerhaft im Archiv sichtbar" color={accent.gold} />
            <Benefit icon="ticket-outline" text="Belegt Check-in und Match-Erlebnis" color={accent.gold} />
          </InfoPanel>
        </View>

        <View style={styles.twoColumnSmall}>
          <InfoPanel title="HISTORIE" accent={accent.green}>
            {visibleHistoryEvents.map((event) => (
              <History key={`${event.date}-${event.text}`} date={event.date} text={event.text} />
            ))}
            {hiddenHistoryCount > 0 ? (
              <Text style={[styles.historyOverflow, { color: accent.green }]}>+ {hiddenHistoryCount} weitere im Archiv</Text>
            ) : null}
          </InfoPanel>

          <View style={[styles.footer, { borderColor: accent.gold }]}> 
            <FooterBlock label="CARD ID" value={cardId(card)} accent={accent.green} />
            <FooterBlock label="STATUS" value={card.archived ? 'ARCHIVED' : 'OPEN'} accent={accent.green} />
            <FooterBlock label="VERIFIZIERT" value="CURVAO" accent={accent.green} />
          </View>
        </View>
      </View>
      <View pointerEvents="none" style={styles.frameLayer}>
        <PlayerStandardFrameSvg layer="overlay" rarity={card.rarity} />
      </View>
    </View>
  );
}

function InfoPanel({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <View style={styles.infoPanel}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

function Attribute({ icon, label, value, color, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string; last?: boolean }) {
  return (
    <View style={[styles.attributeRow, last && styles.rowLast]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={styles.attributeValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ScorerList({ club, scorers, color, last }: { club: string; scorers: string[]; color: string; last?: boolean }) {
  return (
    <View style={[styles.scorerBlock, last && styles.rowLast]}>
      <Text style={[styles.scorerClub, { color }]}>{club.toUpperCase()}</Text>
      {scorers.length > 0 ? scorers.map((scorer) => (
        <Text key={scorer} style={styles.scorerText} numberOfLines={1}>{scorer}</Text>
      )) : <Text style={styles.scorerText}>—</Text>}
    </View>
  );
}

function Benefit({ icon, text, color }: { icon: keyof typeof Ionicons.glyphMap; text: string; color: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function History({ date, text }: { date: string; text: string }) {
  return (
    <View style={styles.historyRow}>
      <View style={styles.historyDot} />
      <Text style={styles.historyDate}>{date}</Text>
      <Text style={styles.historyText}>{text}</Text>
    </View>
  );
}

function FooterBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.footerBlock}>
      <Text style={[styles.footerLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.footerValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'visible',
  },
  backContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    paddingBottom: 38,
    paddingHorizontal: 30,
    paddingTop: 30,
    zIndex: 5,
  },
  backBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  heroPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,5,0.74)',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    zIndex: 2,
  },
  crestPair: {
    alignItems: 'center',
    borderRightColor: 'rgba(189,153,71,0.35)',
    borderRightWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 56,
    justifyContent: 'center',
    paddingRight: 9,
    width: 88,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  rarityLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  rarityLineText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  rarityStars: {
    flexDirection: 'row',
    gap: 1,
  },
  matchTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  competition: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  metaLine: {
    color: curvao.colors.text,
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  scoreBox: {
    alignItems: 'center',
    borderLeftColor: 'rgba(189,153,71,0.35)',
    borderLeftWidth: 1,
    minWidth: 56,
    paddingLeft: 10,
  },
  score: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 7,
    fontWeight: '900',
  },
  twoColumn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    zIndex: 2,
  },
  twoColumnSmall: {
    flex: 0.9,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    zIndex: 2,
  },
  infoPanel: {
    backgroundColor: 'rgba(2,6,5,0.62)',
    borderColor: 'rgba(189,153,71,0.25)',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    padding: 9,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 7,
  },
  originRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  originText: {
    flex: 1,
    fontSize: 8,
    fontWeight: '800',
  },
  smallLabel: {
    color: curvao.colors.muted,
    fontSize: 8,
    marginBottom: 4,
  },
  primaryText: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  secondaryText: {
    color: curvao.colors.muted,
    fontSize: 8,
    marginTop: 3,
  },
  originEditionRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
  },
  originEditionLabel: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
  },
  originEditionValue: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'right',
  },
  attributeRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  attributeLabel: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
  },
  attributeValue: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'right',
  },
  scorerBlock: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    marginBottom: 6,
    paddingBottom: 6,
  },
  scorerClub: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  scorerText: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 7,
  },
  benefitText: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
    lineHeight: 11,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  historyDot: {
    backgroundColor: curvao.colors.green,
    borderRadius: 6,
    height: 7,
    width: 7,
  },
  historyDate: {
    color: curvao.colors.text,
    fontSize: 8,
    width: 45,
  },
  historyText: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
  },
  historyOverflow: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  footer: {
    backgroundColor: 'rgba(2,6,5,0.72)',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 2,
  },
  footerBlock: {
    gap: 3,
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footerValue: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '700',
  },
  rowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  frameShadowLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
    zIndex: 1,
  },
  frameLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
    zIndex: 20,
  },
});