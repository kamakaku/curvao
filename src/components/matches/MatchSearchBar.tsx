import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type MatchSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function MatchSearchBar({ value, onChangeText }: MatchSearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons color={curvao.colors.muted} name="search" size={18} />
      <TextInput
        placeholder="Team, Liga oder Stadion suchen"
        placeholderTextColor={curvao.colors.muted}
        selectionColor={curvao.colors.gold}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
  },
  input: {
    color: '#F4F1E8',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
});
