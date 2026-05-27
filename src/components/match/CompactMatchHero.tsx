import type { Match } from '@/src/types/models';

import { MatchHero } from './MatchHero';

type CompactMatchHeroProps = {
  match: Match;
};

export function CompactMatchHero({ match }: CompactMatchHeroProps) {
  return <MatchHero match={match} variant="compact" />;
}
