import { ClubCardPreview } from '@/src/components/cards/ClubCardPreview';
import type { UserCard } from '@/src/types/models';

type ClubCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
  wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; };
  earnPaths?: any[];
};

export function ClubCardView({ card }: ClubCardViewProps) {
  return <ClubCardPreview card={card} />;
}
