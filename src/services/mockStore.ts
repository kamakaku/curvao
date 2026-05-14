import {
  mockAchievements,
  mockCardEvents,
  mockCheckins,
  mockClubs,
  mockMatches,
  mockMatchPlayers,
  mockPlayers,
  mockUserAchievements,
  mockUserCards,
} from '@/src/data/mockData';

export const mockStore = {
  clubs: [...mockClubs],
  players: [...mockPlayers],
  matches: [...mockMatches],
  matchPlayers: [...mockMatchPlayers],
  checkins: [...mockCheckins],
  userCards: [...mockUserCards],
  cardEvents: [...mockCardEvents],
  achievements: [...mockAchievements],
  userAchievements: [...mockUserAchievements],
};

let counter = 1;

export function createId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
