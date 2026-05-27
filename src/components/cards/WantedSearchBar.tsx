import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type WantedSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function WantedSearchBar({ value, onChangeText }: WantedSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons color={curvao.colors.muted} name="search-outline" size={18} />
      <TextInput
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder="Spieler, Teams, Stadien suchen…"
        placeholderTextColor="rgba(167,163,154,0.72)"
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons color={curvao.colors.muted} name="close" size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: curvao.spacing.sm,
    paddingHorizontal: curvao.spacing.md,
    paddingVertical: 4,
  },
  input: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: curvao.typography.size.base,
    fontWeight: curvao.typography.weight.semiBold,
    minHeight: 44,
  },
  clearButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
