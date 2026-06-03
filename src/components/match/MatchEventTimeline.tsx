import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { Match, MatchEvent } from '@/src/types/models';
import { formatKickoffTime, formatMatchDate, getMatchViewState } from '@/src/utils/matchUtils';

type MatchEventTimelineProps = {
  match: Match;
  matchEvents?: MatchEvent[];
};

type TimelineEvent = {
  id: string;
  minute?: number;
  timeLabel: string;
  title: string;
  subtitle?: string;
  side?: 'home' | 'away' | 'neutral';
  type:
    | 'kickoff'
    | 'goal'
    | 'penalty_goal'
    | 'own_goal'
    | 'goal_disallowed'
    | 'status'
    | 'substitution'
    | 'yellow_card'
    | 'red_card'
    | 'var'
    | 'save'
    | 'woodwork'
    | 'shot_off_target'
    | 'disciplinary_review';
  compact?: boolean;
  primary?: boolean;
};

export function MatchEventTimeline({ match, matchEvents }: MatchEventTimelineProps) {
  const events = buildTimelineEvents(match, matchEvents);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>MATCH TIMELINE</Text>
      <View style={styles.timeline}>
        {events.map((event, index) => (
          event.side === 'neutral' ? (
            <View key={event.id} style={styles.neutralRow}>
              <View style={styles.neutralBadge}>
                <Ionicons color={curvao.colors.gold} name={getEventIcon(event.type)} size={12} />
              </View>
              <Text style={styles.time}>{event.timeLabel}</Text>
              <Text numberOfLines={2} style={styles.name}>{event.title}</Text>
              {renderEventText(event)}
              {index < events.length - 1 ? <View style={styles.neutralLine} /> : null}
            </View>
          ) : (
            <View key={event.id} style={[styles.row, isGoalLikeEvent(event.type) && styles.goalRow]}>
              <View style={[styles.side, styles.leftSide]}>
                {event.side === 'home' ? (
                  <>
                    <Text style={[styles.time, styles.leftText, isGoalLikeEvent(event.type) && styles.goalTime]}>{event.timeLabel}</Text>
                    <Text numberOfLines={2} style={[styles.name, styles.leftText, isGoalLikeEvent(event.type) && styles.goalName]}>{event.title}</Text>
                    {renderEventText(event, [styles.eventText, styles.leftText, isGoalLikeEvent(event.type) && styles.goalEventText])}
                  </>
                ) : null}
              </View>

              <View style={styles.trackColumn}>
                <View
                  style={[
                    styles.badge,
                    event.side === 'home' && styles.badgeHome,
                    event.side === 'away' && styles.badgeAway,
                    isGoalLikeEvent(event.type) && styles.badgeGoal,
                    event.type === 'yellow_card' && styles.badgeYellowCard,
                    event.type === 'red_card' && styles.badgeRedCard,
                    event.primary && styles.badgePrimary,
                    event.compact && styles.badgeCompact,
                  ]}
                >
                  <Ionicons
                    color={getEventIconColor(event.type)}
                    name={getEventIcon(event.type)}
                    size={isGoalLikeEvent(event.type) ? 15 : event.primary ? 13 : 12}
                  />
                </View>
                {index < events.length - 1 ? <View style={styles.line} /> : null}
              </View>

              <View style={[styles.side, styles.rightSide]}>
                {event.side === 'away' ? (
                  <>
                    <Text style={[styles.time, styles.rightText, isGoalLikeEvent(event.type) && styles.goalTime]}>{event.timeLabel}</Text>
                    <Text numberOfLines={2} style={[styles.name, styles.rightText, isGoalLikeEvent(event.type) && styles.goalName]}>{event.title}</Text>
                    {renderEventText(event, [styles.eventText, styles.rightText, isGoalLikeEvent(event.type) && styles.goalEventText])}
                  </>
                ) : null}
              </View>
            </View>
          )
        ))}
      </View>
    </View>
  );
}

function buildTimelineEvents(match: Match, matchEvents?: MatchEvent[]): TimelineEvent[] {
  if (matchEvents?.length) {
    const mapped = matchEvents.map<TimelineEvent>((event) => ({
      id: event.id,
      minute: event.minute,
      timeLabel: formatEventMinute(event),
      title: event.title || event.expand?.player?.displayName || event.expand?.club?.name || 'Ereignis',
      subtitle: buildEventSubtitle(event),
      side: event.side || 'neutral',
      type: resolveTimelineType(event),
      primary: isPrimaryEventType(resolveTimelineType(event)),
    }));

    const kickoffEvent: TimelineEvent = {
      id: `${match.id}-kickoff`,
      minute: 0,
      timeLabel: formatKickoffTime(match),
      title: 'Anpfiff',
      subtitle: `${formatMatchDate(match)} · ${match.competition}`,
      side: 'neutral',
      type: 'kickoff',
    };

    const collapsed = collapseSubstitutionEvents(mapped);
    const hasKickoff = collapsed.some((event) => event.type === 'kickoff');
    const all = hasKickoff ? collapsed : [kickoffEvent, ...collapsed];
    const viewState = getMatchViewState(match);

    if (viewState.status === 'final') {
      all.push({
        id: `${match.id}-final`,
        minute: 999,
        timeLabel: 'FT',
        title: 'Endstand',
        subtitle: `${match.homeScore ?? 0}:${match.awayScore ?? 0}`,
        side: 'neutral',
        type: 'status',
        primary: true,
      });
    }

    return all.sort((left, right) => {
      const leftMinute = left.minute ?? 999;
      const rightMinute = right.minute ?? 999;
      if (leftMinute !== rightMinute) {
        return rightMinute - leftMinute;
      }
      return getEventPriority(left.type) - getEventPriority(right.type);
    });
  }

  const events: TimelineEvent[] = [
    {
      id: `${match.id}-kickoff`,
      minute: 0,
      timeLabel: formatKickoffTime(match),
      title: 'Anpfiff',
      subtitle: `${formatMatchDate(match)} · ${match.competition}`,
      side: 'neutral',
      type: 'kickoff',
      primary: true,
    },
    ...normalizeGoalScorers(match.homeGoalScorers, 'home', match.expand?.homeClub?.name || 'Home').map((event, index) => ({
      ...event,
      id: `${match.id}-home-${index}`,
    })),
    ...normalizeGoalScorers(match.awayGoalScorers, 'away', match.expand?.awayClub?.name || 'Away').map((event, index) => ({
      ...event,
      id: `${match.id}-away-${index}`,
    })),
  ];

  const viewState = getMatchViewState(match);
  if (viewState.status === 'final') {
    events.push({
      id: `${match.id}-final`,
      minute: 999,
      timeLabel: 'FT',
      title: 'Endstand',
      subtitle: `${match.homeScore ?? 0}:${match.awayScore ?? 0}`,
      side: 'neutral',
      type: 'status',
      primary: true,
    });
  } else if (viewState.status === 'live') {
    events.push({
      id: `${match.id}-live`,
      minute: 999,
      timeLabel: 'LIVE',
      title: 'Spiel läuft',
      subtitle: `${match.homeScore ?? 0}:${match.awayScore ?? 0}`,
      side: 'neutral',
      type: 'status',
      primary: true,
    });
  } else if (viewState.status === 'upcoming') {
    events.push({
      id: `${match.id}-upcoming`,
      minute: 999,
      timeLabel: 'UPCOMING',
      title: 'Bevorstehendes Spiel',
      subtitle: `${match.stadiumName} · ${match.stadiumCity}`,
      side: 'neutral',
      type: 'status',
      primary: true,
    });
  }

  return events.sort((left, right) => (right.minute ?? 0) - (left.minute ?? 0));
}

function normalizeGoalScorers(scorers: string[] | undefined, side: 'home' | 'away', clubName: string) {
  return (scorers ?? [])
    .map((entry) => {
      const match = entry.match(/^\s*(\d+(?:\+\d+)?)['’]?\s+(.+)$/);
      if (match) {
        return {
          minute: parseMinute(match[1]),
          timeLabel: `${match[1]}'`,
          title: match[2].trim(),
          subtitle: clubName,
          side,
          type: 'goal' as const,
        };
      }

      return {
        minute: undefined,
        timeLabel: 'TOR',
        title: entry,
        subtitle: clubName,
        side,
        type: 'goal' as const,
      };
    });
}

function parseMinute(value: string) {
  const [base, added] = value.split('+').map((part) => Number(part));
  if (Number.isNaN(base)) return undefined;
  return Number.isNaN(added) ? base : base + added;
}

function formatEventMinute(event: MatchEvent) {
  if (typeof event.minute === 'number' && typeof event.extraMinute === 'number' && event.extraMinute > 0) {
    return `${event.minute}+${event.extraMinute}'`;
  }
  if (typeof event.minute === 'number') {
    return `${event.minute}'`;
  }
  return event.eventType.toUpperCase();
}

function mapTimelineType(eventType: string): TimelineEvent['type'] {
  if (eventType === 'goal') {
    return 'goal';
  }
  if (eventType === 'penalty_goal') return 'penalty_goal';
  if (eventType === 'own_goal') return 'own_goal';
  if (eventType === 'goal_disallowed') return 'goal_disallowed';
  if (eventType === 'substitution') {
    return 'substitution';
  }
  if (eventType === 'yellow_card') {
    return 'yellow_card';
  }
  if (eventType === 'red_card' || eventType === 'second_yellow_red') {
    return 'red_card';
  }
  if (eventType === 'var') return 'var';
  if (eventType === 'save') return 'save';
  if (eventType === 'woodwork') return 'woodwork';
  if (eventType === 'shot_off_target') return 'shot_off_target';
  if (eventType === 'disciplinary_review') return 'disciplinary_review';
  if (eventType === 'kickoff') {
    return 'kickoff';
  }
  return 'status';
}

function resolveTimelineType(event: MatchEvent): TimelineEvent['type'] {
  const mapped = mapTimelineType(event.eventType);
  if (mapped !== 'status') {
    return mapped;
  }

  const detail = `${event.subtitle || ''} ${event.info || ''}`.toLowerCase();
  if (detail.includes('penalty')) return 'penalty_goal';
  if (detail.includes('own goal')) return 'own_goal';
  if (detail.includes('goalkeepersave')) return 'save';
  if (detail.includes('woodwork')) return 'woodwork';
  if (detail.includes('offtarget')) return 'shot_off_target';
  if (detail.includes('card adjusted')) return 'disciplinary_review';

  return 'status';
}

function buildEventSubtitle(event: MatchEvent) {
  if (isGoalLikeEvent(resolveTimelineType(event))) {
    return normalizeScoreLabel(event.result) || event.subtitle || event.info || undefined;
  }

  return (
    event.subtitle ||
    event.expand?.relatedPlayer?.displayName ||
    event.result ||
    event.info ||
    undefined
  );
}

function collapseSubstitutionEvents(events: TimelineEvent[]) {
  const grouped = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    if (event.type !== 'substitution' || event.side === 'neutral' || event.minute === undefined) {
      continue;
    }
    const key = `${event.side}-${event.minute}-${event.timeLabel}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(event);
    grouped.set(key, bucket);
  }

  if (grouped.size === 0) {
    return events;
  }

  const emitted = new Set<string>();

  return events.flatMap<TimelineEvent>((event) => {
    if (event.type !== 'substitution' || event.side === 'neutral' || event.minute === undefined) {
      return [event];
    }

    const key = `${event.side}-${event.minute}-${event.timeLabel}`;
    const bucket = grouped.get(key) ?? [];

    if (bucket.length <= 1) {
      return [{ ...event, compact: true }];
    }

    if (emitted.has(key)) {
      return [];
    }

    emitted.add(key);
    return [{
      id: `group-${key}`,
      minute: event.minute,
      timeLabel: event.timeLabel,
      title: `${bucket.length} Wechsel`,
      subtitle: bucket.map((entry) => entry.title).filter(Boolean).slice(0, 3).join(' · '),
      side: event.side,
      type: 'substitution' as const,
      compact: true,
    }];
  });
}

function isPrimaryEventType(type: TimelineEvent['type']) {
  return ['kickoff', 'status', 'goal', 'penalty_goal', 'own_goal', 'goal_disallowed', 'red_card', 'var'].includes(type);
}

function getEventPriority(type: TimelineEvent['type']) {
  switch (type) {
    case 'kickoff':
    case 'status':
      return 0;
    case 'goal':
    case 'penalty_goal':
    case 'own_goal':
      return 1;
    case 'goal_disallowed':
    case 'red_card':
      return 2;
    case 'yellow_card':
    case 'var':
      return 3;
    case 'substitution':
      return 4;
    case 'save':
    case 'woodwork':
    case 'shot_off_target':
    case 'disciplinary_review':
      return 5;
  }
}

function getEventIcon(type: TimelineEvent['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'kickoff':
      return 'play';
    case 'goal':
      return 'football';
    case 'penalty_goal':
      return 'football';
    case 'own_goal':
      return 'football';
    case 'goal_disallowed':
      return 'close-circle';
    case 'substitution':
      return 'swap-horizontal';
    case 'yellow_card':
      return 'square';
    case 'red_card':
      return 'stop';
    case 'var':
      return 'scan';
    case 'save':
      return 'hand-left';
    case 'woodwork':
      return 'remove-circle';
    case 'shot_off_target':
      return 'arrow-forward';
    case 'disciplinary_review':
      return 'shield-checkmark';
    case 'status':
      return 'flag';
  }
}

function getEventIconColor(type: TimelineEvent['type']) {
  if (type === 'yellow_card') {
    return curvao.colors.gold;
  }
  if (type === 'red_card') {
    return '#FF5C5C';
  }
  if (isGoalLikeEvent(type)) {
    return curvao.colors.gold;
  }
  return curvao.colors.text;
}

function isGoalLikeEvent(type: TimelineEvent['type']) {
  return type === 'goal' || type === 'penalty_goal' || type === 'own_goal' || type === 'goal_disallowed';
}

function getEventText(event: TimelineEvent) {
  if (event.type === 'goal') {
    return 'TOR';
  }
  if (event.type === 'penalty_goal') {
    return 'ELFMETERTOR';
  }
  if (event.type === 'own_goal') {
    return 'EIGENTOR';
  }
  if (event.type === 'goal_disallowed') {
    return 'TOR ABERKANNT';
  }
  if (event.type === 'substitution') {
    return event.subtitle ? `WECHSEL · ${event.subtitle}` : 'WECHSEL';
  }
  if (event.type === 'yellow_card') {
    return event.subtitle ? `GELB · ${event.subtitle}` : 'GELBE KARTE';
  }
  if (event.type === 'red_card') {
    return event.subtitle ? `ROT · ${event.subtitle}` : 'ROTE KARTE';
  }
  if (event.type === 'var') {
    return event.subtitle ? `VAR · ${event.subtitle}` : 'VAR';
  }
  if (event.type === 'save') {
    return event.subtitle ? `PARADE · ${event.subtitle}` : 'PARADE';
  }
  if (event.type === 'woodwork') {
    return event.subtitle ? `ALUMINIUM · ${event.subtitle}` : 'ALUMINIUM';
  }
  if (event.type === 'shot_off_target') {
    return event.subtitle ? `VORBEI · ${event.subtitle}` : 'VORBEI';
  }
  if (event.type === 'disciplinary_review') {
    return event.subtitle ? `ENTSCHEIDUNG · ${event.subtitle}` : 'ENTSCHEIDUNG';
  }
  if (event.type === 'kickoff') {
    return event.subtitle || 'ANPFIFF';
  }
  return event.subtitle || 'STATUS';
}

function renderEventText(event: TimelineEvent, style: StyleProp<TextStyle> = styles.eventText) {
  if (isGoalLikeEvent(event.type)) {
    const score = normalizeScoreLabel(event.subtitle);
    if (score) {
      const [leftScore, rightScore] = score.split(':');
      const highlightLeft = event.side === 'home';
      const highlightRight = event.side === 'away';
      return (
        <Text numberOfLines={2} style={style}>
          {getEventText(event)} ·{' '}
          <Text style={highlightLeft ? styles.goalScoreHighlight : styles.goalScore}>
            {leftScore}
          </Text>
          <Text style={styles.goalScoreSeparator}>:</Text>
          <Text style={highlightRight ? styles.goalScoreHighlight : styles.goalScore}>
            {rightScore}
          </Text>
        </Text>
      );
    }
  }

  return (
    <Text numberOfLines={2} style={style}>
      {getEventText(event)}
      {event.subtitle && !isGoalLikeEvent(event.type) ? ` · ${event.subtitle}` : ''}
    </Text>
  );
}

function normalizeScoreLabel(value?: string) {
  const match = String(value || '').match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) {
    return null;
  }
  return `${match[1]}:${match[2]}`;
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  timeline: {
    backgroundColor: 'rgba(18,22,20,0.82)',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
  },
  goalRow: {
    backgroundColor: 'rgba(216,170,77,0.06)',
    borderRadius: 8,
    marginHorizontal: -6,
    paddingHorizontal: 6,
    paddingTop: 2,
  },
  side: {
    flex: 1,
    gap: 2,
    paddingBottom: 16,
  },
  leftSide: {
    alignItems: 'flex-end',
  },
  rightSide: {
    alignItems: 'flex-start',
  },
  trackColumn: {
    alignItems: 'center',
    width: 36,
  },
  line: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    flex: 1,
    marginTop: 6,
    minHeight: 30,
    width: 1,
  },
  neutralRow: {
    alignItems: 'center',
    minHeight: 96,
    paddingBottom: 16,
  },
  neutralBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    marginBottom: 6,
    width: 22,
  },
  neutralLine: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    height: 30,
    marginTop: 10,
    width: 1,
  },
  time: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  goalTime: {
    color: curvao.colors.gold,
    fontSize: 11,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  badgeGoal: {
    backgroundColor: 'rgba(216,170,77,0.18)',
    borderColor: 'rgba(216,170,77,0.42)',
    height: 26,
    width: 26,
  },
  badgePrimary: {
    borderWidth: 1.2,
    height: 24,
    width: 24,
  },
  badgeCompact: {
    opacity: 0.92,
  },
  badgeHome: {
    backgroundColor: 'rgba(24,164,100,0.14)',
    borderColor: 'rgba(24,164,100,0.30)',
  },
  badgeAway: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.24)',
  },
  name: {
    color: curvao.colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  goalName: {
    fontSize: 15,
    fontWeight: '900',
  },
  leftText: {
    textAlign: 'right',
  },
  rightText: {
    textAlign: 'left',
  },
  eventText: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  goalEventText: {
    color: curvao.colors.gold,
    fontWeight: '800',
  },
  goalScore: {
    color: curvao.colors.text,
    fontWeight: '700',
  },
  goalScoreHighlight: {
    color: curvao.colors.gold,
    fontWeight: '900',
  },
  goalScoreSeparator: {
    color: curvao.colors.muted,
    fontWeight: '700',
  },
  badgeYellowCard: {
    backgroundColor: 'rgba(216,170,77,0.18)',
    borderColor: 'rgba(216,170,77,0.40)',
  },
  badgeRedCard: {
    backgroundColor: 'rgba(255,92,92,0.16)',
    borderColor: 'rgba(255,92,92,0.38)',
  },
});
