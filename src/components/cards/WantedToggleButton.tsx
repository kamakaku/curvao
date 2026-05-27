import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type WantedToggleButtonProps = {
  wanted: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function WantedToggleButton({ wanted, disabled, onPress }: WantedToggleButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.button, wanted && styles.activeButton, disabled && styles.disabledButton]}>
      <Ionicons color={wanted ? curvao.colors.textInverted : curvao.colors.gold} name={wanted ? 'bookmark' : 'bookmark-outline'} size={13} />
      <Text style={[styles.label, wanted && styles.activeLabel]}>{wanted ? 'GESUCHT' : 'GESUCHT MARKIEREN'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activeButton: {
    backgroundColor: curvao.colors.gold,
    borderColor: curvao.colors.gold,
  },
  disabledButton: {
    opacity: 0.45,
  },
  label: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.7,
  },
  activeLabel: {
    color: curvao.colors.textInverted,
  },
});
