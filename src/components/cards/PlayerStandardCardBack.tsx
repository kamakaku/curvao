import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

const cardBackBackgroundSource = require('@/assets/cards/player_standard_v2_bg--back.png');

const BACK_INNER_BORDER_PATH =
  'M202.834 32H493.206H499.794H790.166L806.167 48.2849H908.291L961 101.9293V1294.08L901.702 1354.43H593.918L561.916 1387H498.853H494.147H431.084L399.082 1354.43H91.2979L32 1294.08V101.9293L84.7092 48.2849H186.833L202.834 32Z';

import {
  formatMatch,
  formatOrigin,
  formatRarity,
} from '@/src/services/cardTemplateService';
import { PlayerStandardFrameSvg } from '@/src/components/cards/PlayerStandardFrameSvg';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardOrigin, Rarity } from '@/src/types/models';

type PlayerStandardCardBackProps = {
  player: {
    firstName: string;
    lastName: string;
    displayName: string;
    position: string;
    shirtNumber?: number;
    nationality?: string;
  };
  club: {
    name: string;
    shortName?: string;
    crestUrl?: string;
    crestSource?: ImageSourcePropType;
  };
  match?: {
    homeShortName?: string;
    awayShortName?: string;
    homeScore?: number;
    awayScore?: number;
    kickoffAt?: string;
  };
  card: {
    rarity: Rarity;
    editionNumber?: number;
    editionSize?: number;
    origin: CardOrigin;
    bondLevel?: number;
    archived?: boolean;
    tradable?: boolean;
    bound?: boolean;
  };
};

const rarityAccent: Record<Rarity, { green: string; gold: string; border: string }> = {
  standard: { green: '#8fa79b', gold: '#bd9947', border: '#8fa79b' },
  rare: { green: '#21ad69', gold: '#d7b86a', border: '#bd9947' },
  epic: { green: '#8b6cf0', gold: '#d7b86a', border: '#8b6cf0' },
  legendary: { green: '#d6ad4b', gold: '#f0c84a', border: '#d6ad4b' },
  oneoff: { green: '#f7d66b', gold: '#fff2a0', border: '#fff2a0' },
};

const HISTORY_PREVIEW_LIMIT = 4;

function formatDate(kickoffAt?: string) {
  if (!kickoffAt) {
    return '—';
  }

  return new Date(kickoffAt).toLocaleDateString('de-DE');
}

function formatEditionNumber(editionNumber?: number, editionSize?: number) {
  if (!editionNumber) {
    return '—';
  }

  return editionSize ? `#${editionNumber} / ${editionSize.toLocaleString('de-DE')}` : `#${editionNumber}`;
}

function positionLabel(position: string) {
  if (position === 'FW') return 'Sturm';
  if (position === 'MF') return 'Mittelfeld';
  if (position === 'DF') return 'Verteidigung';
  if (position === 'GK') return 'Torwart';
  return position;
}

function cardId(editionNumber?: number) {
  return `CV-25-${String(editionNumber ?? 0).padStart(7, '0')}`;
}

export function PlayerStandardCardBack({ player, club, match, card }: PlayerStandardCardBackProps) {
  const accent = rarityAccent[card.rarity];
  const crestSource = club.crestSource ?? (club.crestUrl ? { uri: club.crestUrl } : undefined);
  const matchText = formatMatch(match);
  const matchDate = formatDate(match?.kickoffAt);
  const edition = formatEditionNumber(card.editionNumber, card.editionSize);
  const origin = formatOrigin(card.origin);
  const historyEvents = [
    { date: matchDate, text: `Earned (${origin})` },
    { date: matchDate, text: 'Added to Archive' },
    { date: matchDate, text: 'Card Minted' },
    { date: matchDate, text: card.tradable ? 'Tradable' : 'Locked' },
    { date: matchDate, text: 'Verified by Curvao' },
  ];
  const visibleHistoryEvents = historyEvents.slice(0, HISTORY_PREVIEW_LIMIT);
  const hiddenHistoryCount = Math.max(historyEvents.length - visibleHistoryEvents.length, 0);
  const backgroundClipId = `playerStandardCardBackBackgroundClip-${card.rarity}`;

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
          <View style={styles.crestBox}>
            {crestSource ? <Image source={crestSource} resizeMode="contain" style={styles.crest} /> : null}
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
            <Text style={[styles.playerName, { color: accent.gold }]} numberOfLines={1}>
              {player.displayName.toUpperCase()}
            </Text>
            <Text style={[styles.clubName, { color: accent.green }]} numberOfLines={1}>
              {club.name.toUpperCase()}
            </Text>
            <Text style={styles.metaLine}>
              SEASON 2025/26
            </Text>
          </View>
          <View style={styles.numberBox}>
            <Text style={[styles.number, { color: accent.gold }]}>{player.shirtNumber ?? '—'}</Text>
            <Text style={[styles.position, { color: accent.green }]}>{positionLabel(player.position).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.twoColumn}>
        <InfoPanel title="HERKUNFT" accent={accent.green}>
          <View style={styles.originRow}>
            <Ionicons name="football-outline" size={22} color={accent.gold} />
            <Text style={[styles.originText, { color: accent.gold }]}>{origin}</Text>
            <Ionicons name="shield-checkmark-outline" size={22} color={accent.green} />
          </View>
          <Text style={styles.smallLabel}>Earned at</Text>
          <Text style={styles.matchText}>{matchText}</Text>
          <Text style={styles.matchDate}>{matchDate}</Text>
          <View style={styles.originEditionRow}>
            <Ionicons name="pricetag-outline" size={14} color={accent.gold} />
            <Text style={styles.originEditionLabel}>Edition</Text>
            <Text style={styles.originEditionValue}>{edition}</Text>
          </View>
        </InfoPanel>

        <InfoPanel title="ATTRIBUTES" accent={accent.green}>
          <Attribute icon="grid-outline" label="Position" value={positionLabel(player.position)} color={accent.gold} />
          <Attribute icon="eye-outline" label="Seen Live" value="1×" color={accent.gold} />
          <Attribute icon="medal-outline" label="Bond Level" value={`Level ${card.bondLevel ?? 1}`} color={accent.gold} />
          <Attribute icon="sparkles-outline" label="Trait" value="Home Hero" color={accent.gold} last />
        </InfoPanel>
      </View>

      <View style={styles.twoColumn}>
        <InfoPanel title="NUTZEN" accent={accent.green}>
          <Benefit icon="grid-outline" text={`Zählt für ${club.name} Season Set`} color={accent.gold} />
          <Benefit icon="swap-horizontal" text={card.tradable ? 'Tradable als Player Card' : 'Nicht tradable'} color={accent.gold} />
          <Benefit icon="locate-outline" text="Kann durch Duplikate gebunden und verbessert werden" color={accent.gold} />
        </InfoPanel>

        <InfoPanel title="HISTORIE" accent={accent.green}>
          {visibleHistoryEvents.map((event) => (
            <History key={`${event.date}-${event.text}`} date={event.date} text={event.text} />
          ))}
          {hiddenHistoryCount > 0 ? (
            <Text style={[styles.historyOverflow, { color: accent.green }]}>
              + {hiddenHistoryCount} weitere im Archiv
            </Text>
          ) : null}
        </InfoPanel>
      </View>

      <View style={[styles.footer, { borderColor: accent.gold }]}>
        <FooterBlock label="CARD ID" value={cardId(card.editionNumber)} accent={accent.green} />
        <FooterBlock label="STATUS" value={card.archived ? 'ARCHIVED' : 'OPEN'} accent={accent.green} />
        <FooterBlock label="VERIFIZIERT" value="Verified" accent={accent.green} />
      </View>
      </View>
      <View pointerEvents="none" style={styles.frameLayer}>
        <PlayerStandardFrameSvg layer="overlay" rarity={card.rarity} />
      </View>
    </View>
  );
}

function InfoPanel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoPanel}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

function Attribute({
  icon,
  label,
  value,
  color,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.attributeRow, last && styles.attributeRowLast]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={styles.attributeValue}>{value}</Text>
    </View>
  );
}

function Benefit({ icon, text, color }: { icon: keyof typeof Ionicons.glyphMap; text: string; color: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name={icon} size={18} color={color} />
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
    paddingBottom: 38,
    paddingHorizontal: 30,
    paddingTop: 30,
    zIndex: 5,
    overflow: 'hidden',
  },
  backBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
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
  decorLineTop: {
    borderColor: 'rgba(189,153,71,0.42)',
    borderTopWidth: 1,
    left: 34,
    position: 'absolute',
    right: 34,
    top: 52,
  },
  heroPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,5,0.72)',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 11,
    zIndex: 2,
  },
  crestBox: {
    alignItems: 'center',
    borderRightColor: 'rgba(189,153,71,0.35)',
    borderRightWidth: 1,
    height: 54,
    justifyContent: 'center',
    paddingRight: 10,
    width: 64,
  },
  crest: {
    height: 42,
    width: 48,
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
  playerName: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  clubName: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  metaLine: {
    color: curvao.colors.text,
    fontSize: 6,
    fontWeight: '400',
    letterSpacing: 1.4,
  },
  numberBox: {
    alignItems: 'center',
    borderLeftColor: 'rgba(189,153,71,0.35)',
    borderLeftWidth: 1,
    minWidth: 48,
    paddingLeft: 9,
  },
  number: {
    fontSize: 28,
    fontWeight: '800',
  },
  position: {
    fontSize: 9,
    fontWeight: '900',
  },
  twoColumn: {
    flex: 1,
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
    gap: 10,
    marginBottom: 10,
  },
  originText: {
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
  },
  smallLabel: {
    color: curvao.colors.muted,
    fontSize: 8,
    marginBottom: 6,
  },
  matchText: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  matchDate: {
    color: curvao.colors.muted,
    fontSize: 8,
    marginTop: 4,
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
    gap: 10,
    paddingVertical: 2,
  },
  attributeRowLast: {
    borderBottomWidth: 0,
  },
  attributeLabel: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: 8,
  },
  attributeValue: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'right',
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 10,
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
    marginBottom: 7,
  },
  historyDot: {
    backgroundColor: curvao.colors.green,
    borderRadius: 6,
    height: 8,
    width: 8,
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
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,5,0.72)',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 2,
  },
  footerBlock: {
    flex: 1,
    gap: 6,
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 2,
  },
  footerValue: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '700',
  },
});