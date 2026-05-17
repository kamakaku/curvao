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
  active: boolean;
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
