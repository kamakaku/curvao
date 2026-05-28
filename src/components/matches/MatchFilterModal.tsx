import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

type Option = { label: string; value: string };
type FilterKey = 'league' | 'matchday' | 'date' | 'team';
type DraftFilters = {
  league: string;
  matchday: string;
  date: string;
  team: string;
};

type MatchFilterModalProps = {
  visible: boolean;
  focusKey?: FilterKey | null;
  draft: DraftFilters;
  leagueOptions: Option[];
  matchdayOptions: Option[];
  dateOptions: Option[];
  teamOptions: Option[];
  teamSearch: string;
  onTeamSearchChange: (value: string) => void;
  onClose: () => void;
  onChange: (key: FilterKey, value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export function MatchFilterModal({
  visible,
  focusKey,
  draft,
  leagueOptions,
  matchdayOptions,
  dateOptions,
  teamOptions,
  teamSearch,
  onTeamSearchChange,
  onClose,
  onChange,
  onApply,
  onReset,
}: MatchFilterModalProps) {
  const visibleTeams = teamOptions.filter((team) => team.label.toLowerCase().includes(teamSearch.toLowerCase()));

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color="#F4F1E8" name="close" size={20} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <FilterSection
              active={focusKey === 'league'}
              label="Liga"
              options={leagueOptions}
              value={draft.league}
              onSelect={(value) => onChange('league', value)}
            />

            <FilterSection
              active={focusKey === 'matchday'}
              label="Spieltag"
              options={matchdayOptions}
              value={draft.matchday}
              onSelect={(value) => onChange('matchday', value)}
            />

            <FilterSection
              active={focusKey === 'date'}
              label="Datum"
              options={dateOptions}
              value={draft.date}
              onSelect={(value) => onChange('date', value)}
            />

            <View style={[styles.section, focusKey === 'team' && styles.sectionActive]}>
              <Text style={styles.sectionLabel}>Mannschaft</Text>
              <View style={styles.searchWrap}>
                <Ionicons color="#A7A39A" name="search" size={16} />
                <TextInput
                  placeholder="Team suchen"
                  placeholderTextColor="#A7A39A"
                  selectionColor="#D8AA4D"
                  style={styles.teamInput}
                  value={teamSearch}
                  onChangeText={onTeamSearchChange}
                />
              </View>
              <View style={styles.optionGrid}>
                {visibleTeams.map((option) => {
                  const active = option.value === draft.team;
                  return (
                    <Pressable key={option.value} onPress={() => onChange('team', option.value)} style={[styles.optionChip, active && styles.optionChipActive]}>
                      <Text numberOfLines={1} style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton label="Zurücksetzen" onPress={onReset} variant="secondary" />
            <PrimaryButton label="Filter anwenden" onPress={onApply} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterSection({
  label,
  options,
  value,
  onSelect,
  active,
}: {
  label: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  active?: boolean;
}) {
  return (
    <View style={[styles.section, active && styles.sectionActive]}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.optionGrid}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable key={option.value} onPress={() => onSelect(option.value)} style={[styles.optionChip, selected && styles.optionChipActive]}>
              <Text numberOfLines={1} style={[styles.optionText, selected && styles.optionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type { DraftFilters, FilterKey };

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121614',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(216,170,77,0.4)',
    borderRadius: 999,
    height: 4,
    marginBottom: 12,
    width: 52,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: '#F4F1E8',
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#191E1B',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  content: {
    gap: 16,
    paddingBottom: 18,
  },
  section: {
    backgroundColor: '#191E1B',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  sectionActive: {
    borderColor: 'rgba(216,170,77,0.28)',
  },
  sectionLabel: {
    color: '#D8AA4D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: 'rgba(18,22,20,0.78)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionChipActive: {
    backgroundColor: 'rgba(216,170,77,0.16)',
    borderColor: '#D8AA4D',
  },
  optionText: {
    color: '#A7A39A',
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#F4F1E8',
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  teamInput: {
    color: '#F4F1E8',
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
});
