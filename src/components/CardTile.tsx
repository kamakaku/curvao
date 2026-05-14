import { Pressable, StyleSheet } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import type { UserCard } from '@/src/types/models';

export function CardTile({ card, onPress, fullWidth }: { card: UserCard; onPress?: () => void; fullWidth?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, fullWidth && styles.fullWidth, pressed && styles.pressed]}>
      <CardRenderer card={card} compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
  },
});
