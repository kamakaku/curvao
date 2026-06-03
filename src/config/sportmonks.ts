export type SportmonksConfig = {
  baseUrl: string;
  token?: string;
  enabled: boolean;
};

export const SPORTMONKS_FIXTURE_PERFORMANCE_INCLUDES =
  'participants;lineups.details.type;events.type;statistics.type';

export const sportmonksConfig: SportmonksConfig = {
  baseUrl: process.env.EXPO_PUBLIC_SPORTMONKS_BASE_URL?.trim() || 'https://api.sportmonks.com/v3/football',
  token: process.env.EXPO_PUBLIC_SPORTMONKS_TOKEN?.trim() || undefined,
  enabled: process.env.EXPO_PUBLIC_SPORTMONKS_ENABLED === 'true',
};

