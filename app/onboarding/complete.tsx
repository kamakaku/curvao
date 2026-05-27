import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { OnboardingShell } from '@/src/components/onboarding/OnboardingShell';
import { useAuth } from '@/src/providers/AuthProvider';
import { getCurrentUser } from '@/src/services/authService';
import { clearOnboardingDraft, getOnboardingDraft, type OnboardingDraft } from '@/src/services/onboardingDraftService';
import { completeOnboardingForUser } from '@/src/services/onboardingService';
import { getStarterPackAvailability } from '@/src/services/starterPackService';
import { curvao } from '@/src/theme/curvaoTheme';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOnboardingDraft().then(setDraft);
  }, []);

  async function startCurvao() {
    setLoading(true);
    try {
      const [user, currentDraft] = await Promise.all([getCurrentUser(), getOnboardingDraft()]);
      await completeOnboardingForUser({
        userId: user.id,
        draft: currentDraft ?? { preferredEarnMethods: [], createdAt: new Date().toISOString() },
      });
      await refreshUser();
      const starterPackAvailability = await getStarterPackAvailability(user.id).catch(() => null);
      if (starterPackAvailability && starterPackAvailability.unopenedPackCount > 0) {
        router.replace('/onboarding/starter-pack');
        return;
      }

      await clearOnboardingDraft();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={7}
      title="Alles bereit!"
      subtitle="Dein CURVAO Start ist eingerichtet. Auf geht’s zu deiner Sammlung."
    >
      <View style={styles.summaryCard}>
        <SummaryRow label="Lieblingsclub" value={draft?.favoriteClubName ?? 'Später festlegen'} />
        <SummaryRow label="Earn-Wege" value={draft?.preferredEarnMethods.length ? `${draft.preferredEarnMethods.length} gewählt` : 'Alle Wege offen'} />
        <SummaryRow label="Starter Pack" value="Vorbereitet" />
      </View>

      <AuthButton label="CURVAO STARTEN" onPress={startCurvao} loading={loading} />
    </OnboardingShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name="checkmark-circle" size={18} color={curvao.colors.gold} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.26)',
    backgroundColor: 'rgba(18,22,20,0.88)',
    padding: 18,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryLabel: {
    flex: 1,
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
