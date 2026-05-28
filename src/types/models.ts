export type CardType = 'match' | 'player' | 'moment' | 'stadium' | 'patch' | 'season';
export type Rarity = 'standard' | 'rare' | 'epic' | 'legendary' | 'oneoff';
export type CardOrigin =
  | 'self_earned'
  | 'stadium_verified'
  | 'logged_viewing'
  | 'traded'
  | 'club_drop'
  | 'event_drop'
  | 'gifted'
  | 'bound'
  | 'starter_pack'
  | 'fan_claimed'
  | 'live_verified'
  | 'special_moment'
  | 'club_reward'
  | 'season_reward';
export type CheckinType = 'stadium' | 'viewing';
export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type CardSetType = 'club_season' | 'matchday' | 'stadium' | 'moment' | 'origin' | 'special';
export type CardSetStatus = 'draft' | 'upcoming' | 'active' | 'final' | 'archived';
export type CardSetSlotType =
  | 'match_card'
  | 'stadium_card'
  | 'player_card'
  | 'moment_card'
  | 'mvp_card'
  | 'attendance_card'
  | 'live_watch_reward'
  | 'stadium_checkin_reward'
  | 'completion_reward';
export type CardEventType =
  | 'earned'
  | 'traded_in'
  | 'traded_out'
  | 'bound'
  | 'upgraded'
  | 'favorited'
  | 'main_selected'
  | 'achievement_unlocked';

export type Club = {
  id: string;
  name: string;
  shortName?: string;
  country?: string;
  city?: string;
  primaryColor?: string;
  secondaryColor?: string;
  crest?: string;
  expand?: Record<string, any>;
};

export type Player = {
  id: string;
  firstName?: string;
  lastName: string;
  displayName: string;
  club: string;
  position: string;
  shirtNumber?: number;
  nationality?: string;
  avatar?: string;
  active: boolean;
  expand?: {
    club?: Club;
  };
};

export type Stadium = {
  id: string;
  name: string;
  city: string;
  country?: string;
  club?: string;
  capacity?: number;
  image?: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
  sortOrder?: number;
  expand?: {
    club?: Club;
  };
};

export type Match = {
  id: string;
  homeClub: string;
  awayClub: string;
  competition: string;
  season: string;
  kickoffAt: string;
  stadium?: string;
  stadiumName: string;
  stadiumCity: string;
  stadiumCapacity?: number;
  stadiumImage?: string;
  stadiumVisitCount?: number;
  favoriteStadium?: boolean;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  homeGoalScorers?: string[];
  awayGoalScorers?: string[];
  importance: Exclude<Rarity, 'oneoff'>;
  expand?: {
    homeClub?: Club;
    awayClub?: Club;
    stadium?: Stadium & {
      expand?: {
        club?: Club;
      };
    };
  };
};

export type MatchPlayer = {
  id: string;
  match: string;
  player: string;
  club: string;
  started: boolean;
  minuteIn?: number;
  minuteOut?: number;
};

export type MatchEvent = {
  id: string;
  match: string;
  club?: string;
  player?: string;
  relatedPlayer?: string;
  sportmonksEventId?: string;
  eventType:
    | 'goal'
    | 'penalty_goal'
    | 'own_goal'
    | 'goal_disallowed'
    | 'substitution'
    | 'yellow_card'
    | 'red_card'
    | 'second_yellow_red'
    | 'var'
    | 'save'
    | 'woodwork'
    | 'shot_off_target'
    | 'disciplinary_review'
    | 'other'
    | string;
  side?: 'home' | 'away' | 'neutral';
  minute?: number;
  extraMinute?: number;
  sortOrder?: number;
  title?: string;
  subtitle?: string;
  result?: string;
  info?: string;
  expand?: {
    club?: Club;
    player?: Player;
    relatedPlayer?: Player;
  };
};

export type Checkin = {
  id: string;
  user: string;
  match: string;
  type: CheckinType;
  status: 'pending' | 'verified' | 'rejected';
  seatBlock?: string;
  seatRow?: string;
  seatNumber?: string;
  verifiedAt?: string;
  note?: string;
};

export type LiveWatchSession = {
  id: string;
  user: string;
  match: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  startedAt: string;
  requiredSeconds: number;
  watchedSeconds: number;
  lastHeartbeatAt?: string;
  completedAt?: string;
  checkpointCount?: number;
  rewardClaimed: boolean;
  metadata?: string;
};

export type SetCompletionReward = {
  xp?: number;
  badgeId?: string;
  frameVariant?: string;
  title?: string;
  rewardPackageType?: string;
};

export type CardSet = {
  id: string;
  key: string;
  type: CardSetType;
  title: string;
  subtitle?: string;
  name?: string;
  clubId?: string;
  clubName?: string;
  matchId?: string;
  stadiumId?: string;
  season?: string;
  description?: string;
  status: CardSetStatus;
  featured?: boolean;
  active?: boolean;
  totalSlots?: number;
  completionReward?: SetCompletionReward;
  createdAt?: string;
  updatedAt?: string;
  expand?: {
    match?: Match;
    club?: Club;
    stadium?: Stadium;
  };
};

export type CardSetSlot = {
  id: string;
  setId: string;
  slotType: CardSetSlotType;
  cardTemplateId?: string;
  playerId?: string;
  matchId?: string;
  stadiumId?: string;
  clubId?: string;
  rarity?: Rarity;
  required: boolean;
  sortOrder: number;
  title?: string;
  hint?: string;
  unlockState?: 'available' | 'locked_until_match' | 'locked_until_final' | 'reward_only';
};

export type UserCard = {
  id: string;
  user: string;
  template?: string;
  type: CardType;
  title: string;
  subtitle?: string;
  rarity: Rarity;
  origin: CardOrigin;
  editionNumber?: number;
  editionSize?: number;
  match?: string;
  player?: string;
  stadium?: string;
  sourceCheckin?: string;
  tradable: boolean;
  bound: boolean;
  boundTo?: string;
  isMainCard: boolean;
  bondXp: number;
  bondLevel: number;
  acquiredAt: string;
  archived: boolean;
  favorite: boolean;
  stadiumName?: string;
  stadiumCity?: string;
  stadiumCapacity?: number;
  stadiumImage?: string;
  stadiumVisitCount?: number;
  favoriteStadium?: boolean;
  expand?: {
    match?: Match & {
      expand?: {
        homeClub?: Club;
        awayClub?: Club;
        stadium?: Stadium & {
          expand?: {
            club?: Club;
          };
        };
      };
    };
    player?: Player & {
      expand?: {
        club?: Club;
      };
    };
    stadium?: Stadium & {
      expand?: {
        club?: Club;
      };
    };
  };
};

export type CardTemplate = {
  id: string;
  key?: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  version?: string;
  description?: string;
  image?: string;
  visualConfig?: string;
  tradableDefault: boolean;
  active: boolean;
};

export type CardEvent = {
  id: string;
  user: string;
  card: string;
  eventType: CardEventType;
  title: string;
  description?: string;
  relatedCard?: string;
  relatedMatch?: string;
  createdAt: string;
};

export type RewardEvent = {
  id: string;
  user: string;
  actionType: 'starter_pack' | 'live_watch' | 'stadium_checkin' | 'set_completion' | 'manual_admin';
  sourceType: 'match' | 'stadium' | 'set' | 'card_set' | 'pack' | 'card_template';
  sourceId?: string;
  match?: string;
  rewardType: 'card' | 'xp' | 'bond_xp' | 'pack' | 'badge';
  card?: string;
  xpAmount?: number;
  bondXpAmount?: number;
  status: 'granted' | 'skipped' | 'failed';
  createdAt: string;
  metadata?: string;
};

export type Achievement = {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: 'match_count' | 'stadium_count' | 'card_count' | 'bound_count' | 'custom';
  threshold?: number;
  patchTemplate?: string;
  active: boolean;
};

export type UserAchievement = {
  id: string;
  user: string;
  achievement: string;
  unlockedAt: string;
  relatedCard?: string;
};

export type FanStats = {
  verifiedMatches: number;
  stadiumCheckins: number;
  loggedViewings: number;
  totalCards: number;
  playerCards: number;
  matchCards: number;
  boundCards: number;
  achievements: number;
};
