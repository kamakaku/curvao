import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
};

export function OnboardingOptionCard({ icon, title, subtitle, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={selected ? '#080A09' : curvao.colors.gold} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={curvao.colors.gold} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
    backgroundColor: 'rgba(18,22,20,0.86)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  selected: {
    borderColor: curvao.colors.gold,
    backgroundColor: 'rgba(216,170,77,0.10)',
  },
  pressed: {
    opacity: 0.82,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
