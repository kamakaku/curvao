import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { OnboardingShell } from '@/src/components/onboarding/OnboardingShell';
import { getClubs, getMatches } from '@/src/services/matchService';
import { getOnboardingDraft, updateOnboardingDraft, type OnboardingDraft } from '@/src/services/onboardingDraftService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Club, Match } from '@/src/types/models';

const earnMethods = [
  {
    id: 'stadium_checkin',
    icon: 'location-outline' as const,
    title: 'Stadium Check-in',
    subtitle: 'Im Stadion sein und echte Rewards verdienen.',
  },
  {
    id: 'live_watch',
    icon: 'tv-outline' as const,
    title: 'Live Watch',
    subtitle: 'Spiele live verfolgen und Bond XP sammeln.',
  },
  {
    id: 'sets',
    icon: 'albums-outline' as const,
    title: 'Sets vervollständigen',
    subtitle: 'Club-, Matchday- und Special-Sets sammeln.',
  },
  {
    id: 'wanted',
    icon: 'search-outline' as const,
    title: 'Cards suchen',
    subtitle: 'Gesuchte Cards entdecken und Earn-Wege sehen.',
  },
  {
    id: 'clash',
    icon: 'flash-outline' as const,
    title: 'Clash',
    subtitle: 'Später deine Cards gegen andere einsetzen.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>({
    preferredEarnMethods: [],
    createdAt: new Date().toISOString(),
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubQuery, setClubQuery] = useState('');
  const [clubError, setClubError] = useState(false);

  useEffect(() => {
    getOnboardingDraft().then((storedDraft) => {
      if (storedDraft) {
        setDraft(storedDraft);
      }
    });

    loadData();
  }, []);

  async function loadData() {
    try {
      const [clubItems, matchItems] = await Promise.all([getClubs(), getMatches()]);
      setClubs(clubItems);
      setMatches(matchItems);
      setClubError(false);
    } catch {
      setClubError(true);
    }
  }

  async function patchDraft(partial: Partial<OnboardingDraft>) {
    const nextDraft = {
      ...draft,
      ...partial,
      preferredEarnMethods: partial.preferredEarnMethods ?? draft.preferredEarnMethods,
      createdAt: draft.createdAt,
    };
    setDraft(nextDraft);
    await updateOnboardingDraft(partial);
  }

  const filteredClubs = useMemo(() => {
    const query = clubQuery.trim().toLowerCase();
    if (!query) return clubs.slice(0, 12);
    return clubs.filter((club) => `${club.name} ${club.city ?? ''}`.toLowerCase().includes(query)).slice(0, 20);
  }, [clubQuery, clubs]);

  const nextMatch = matches.find((match) => {
    if (!draft.favoriteClubId) return match.status !== 'finished';
    return (match.homeClub === draft.favoriteClubId || match.awayClub === draft.favoriteClubId) && match.status !== 'finished';
  });

  if (step === 1) {
    return (
      <OnboardingShell
        step={1}
        title="Willkommen bei CURVAO"
        subtitle="Sammle Cards durch echte Fußballmomente. Stadium Check-ins, Live Watch, Sets und Momente — verdient, nicht gekauft."
      >
        <View style={styles.heroCard}>
          {['Stadium Check-ins', 'Live Watch', 'Sets & Sammlung', 'Fair. Echt. Verdient.'].map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={curvao.colors.gold} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
        <AuthButton label="LOS GEHT’S" onPress={() => setStep(2)} />
        <AuthButton label="Ich habe bereits einen Account" onPress={() => router.push('/(auth)/login?fromOnboarding=1')} variant="text" />
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        step={2}
        title="Welchem Club folgst du?"
        subtitle="Wir personalisieren Matches, Sets und Rewards für dich."
        onBack={() => setStep(1)}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={curvao.colors.muted} />
          <TextInput
            value={clubQuery}
            onChangeText={setClubQuery}
            placeholder="Club suchen…"
            placeholderTextColor="rgba(167,163,154,0.5)"
            style={styles.searchInput}
          />
        </View>

        {clubError ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Clubs konnten nicht geladen werden.</Text>
            <AuthButton label="Erneut versuchen" onPress={loadData} variant="secondary" />
          </View>
        ) : (
          <View style={styles.list}>
            {filteredClubs.map((club) => {
              const selected = draft.favoriteClubId === club.id;
              return (
                <Pressable
                  key={club.id}
                  onPress={() => patchDraft({ favoriteClubId: club.id, favoriteClubName: club.name })}
                  style={({ pressed }) => [styles.clubCard, selected && styles.clubCardSelected, pressed && styles.pressed]}
                >
                  <View style={styles.crestPlaceholder}>
                    <Text style={styles.crestText}>{club.shortName ?? club.name.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  <View style={styles.clubCopy}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    {club.city ? <Text style={styles.clubCity}>{club.city}</Text> : null}
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={curvao.colors.gold} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        <AuthButton label="WEITER" onPress={() => setStep(3)} />
        <AuthButton label="Überspringen" onPress={() => patchDraft({ favoriteClubId: undefined, favoriteClubName: undefined }).then(() => setStep(3))} variant="text" />
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell
        step={3}
        title="Wie möchtest du Cards verdienen?"
        subtitle="Wähle, was dir am meisten Spaß macht."
        onBack={() => setStep(2)}
      >
        <View style={styles.list}>
          {earnMethods.map((method) => {
            const selected = draft.preferredEarnMethods.includes(method.id);
            return (
              <OnboardingOptionCard
                key={method.id}
                icon={method.icon}
                selected={selected}
                title={method.title}
                subtitle={method.subtitle}
                onPress={() => {
                  const nextMethods = selected
                    ? draft.preferredEarnMethods.filter((item) => item !== method.id)
                    : [...draft.preferredEarnMethods, method.id];
                  patchDraft({ preferredEarnMethods: nextMethods });
                }}
              />
            );
          })}
        </View>
        <AuthButton label="WEITER" onPress={() => setStep(4)} />
        <AuthButton label="Zurück" onPress={() => setStep(2)} variant="text" />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={4}
      title="Dein CURVAO Start"
      subtitle="So könnte dein Start aussehen. Dies ist nur eine Vorschau — noch keine Sammlung."
      onBack={() => setStep(3)}
    >
      <View style={styles.previewCard}>
        <Text style={styles.previewKicker}>START-VORSCHAU</Text>
        <Text style={styles.previewTitle}>{draft.favoriteClubName ? `${draft.favoriteClubName} 2025/26 Set` : 'CURVAO Season Start'}</Text>
        <Text style={styles.previewText}>
          {nextMatch
            ? `Nächstes Match: ${nextMatch.stadiumName}, ${nextMatch.stadiumCity}`
            : 'Entdecke Sets, Live Watch und Stadium Check-ins.'}
        </Text>
        <View style={styles.pathRow}>
          {(draft.preferredEarnMethods.length ? draft.preferredEarnMethods : ['live_watch', 'stadium_checkin', 'sets']).slice(0, 3).map((method) => (
            <Text key={method} style={styles.pathPill}>{getMethodLabel(method)}</Text>
          ))}
        </View>
      </View>
      <AuthButton label="WEITER" onPress={() => router.push('/onboarding/account')} />
      <AuthButton label="Zurück" onPress={() => setStep(3)} variant="text" />
    </OnboardingShell>
  );
}

function getMethodLabel(method: string) {
  return earnMethods.find((item) => item.id === method)?.title ?? method;
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.24)',
    backgroundColor: 'rgba(18,22,20,0.86)',
    padding: 20,
    gap: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    color: curvao.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  searchBox: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
    backgroundColor: 'rgba(18,22,20,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  clubCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.18)',
    backgroundColor: 'rgba(18,22,20,0.84)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clubCardSelected: {
    borderColor: curvao.colors.gold,
    backgroundColor: 'rgba(216,170,77,0.10)',
  },
  pressed: {
    opacity: 0.82,
  },
  crestPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  crestText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
  },
  clubCopy: {
    flex: 1,
  },
  clubName: {
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  clubCity: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.18)',
    backgroundColor: 'rgba(18,22,20,0.84)',
    padding: 16,
  },
  infoText: {
    color: curvao.colors.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  previewCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.28)',
    backgroundColor: 'rgba(7,9,8,0.90)',
    padding: 22,
    gap: 14,
  },
  previewKicker: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  previewTitle: {
    color: curvao.colors.gold,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  previewText: {
    color: curvao.colors.text,
    opacity: 0.82,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  pathRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pathPill: {
    color: curvao.colors.gold,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
