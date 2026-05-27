import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { CardTile } from '@/src/components/CardTile';
import { OnboardingShell } from '@/src/components/onboarding/OnboardingShell';
import { getCurrentUser } from '@/src/services/authService';
import { clearOnboardingDraft, getOnboardingDraft, type OnboardingDraft } from '@/src/services/onboardingDraftService';
import { createStarterPackCards, StarterPackPersistenceError } from '@/src/services/starterPackService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

type OpeningState = 'ready' | 'opening' | 'revealing' | 'result' | 'error';

export default function StarterPackScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [state, setState] = useState<OpeningState>('ready');
  const [revealedCount, setRevealedCount] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const packScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getOnboardingDraft().then(setDraft);
  }, []);

  const currentRevealCard = cards[revealedCount - 1];

  async function openPack() {
    setState('opening');
    setErrorText(null);
    setRevealedCount(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(packScale, { toValue: 1.06, duration: 260, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(packScale, { toValue: 0.96, duration: 180, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.35, duration: 180, useNativeDriver: true }),
      ]),
      Animated.timing(packScale, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    try {
      const user = await getCurrentUser();
      const createdCards = await createStarterPackCards({
        userId: user.id,
        favoriteClubId: draft?.favoriteClubId,
        count: 2,
      });

      if (createdCards.length === 0) {
        setErrorText('Starter Cards werden vorbereitet. Du kannst trotzdem fortfahren.');
        setState('error');
        return;
      }

      setCards(createdCards);
      setRevealedCount(1);
      setState('revealing');
    } catch (error) {
      if (__DEV__) {
        console.warn('Starter Pack opening failed', error);
      }
      const detail = error instanceof StarterPackPersistenceError && error.detail ? ` ${error.detail}` : '';
      setErrorText(`Starter Pack konnte nicht geöffnet werden.${detail}`);
      setState('error');
    }
  }

  function revealNext() {
    if (revealedCount < cards.length) {
      setRevealedCount((current) => current + 1);
      return;
    }

    setState('result');
  }

  async function goDashboard() {
    await clearOnboardingDraft();
    router.replace('/(tabs)');
  }

  async function goCollection() {
    await clearOnboardingDraft();
    router.replace('/collection?section=Sammlung');
  }

  async function skipPack() {
    await clearOnboardingDraft();
    router.replace('/(tabs)');
  }

  if (state === 'result') {
    return (
      <OnboardingShell step={7} title="Deine ersten Cards" subtitle="Willkommen in deiner Sammlung.">
        <View style={styles.resultGrid}>
          {cards.map((card) => (
            <View key={card.id} style={styles.resultCardWrap}>
              <CardTile card={card} fullWidth />
              <Text style={styles.cardMeta}>STANDARD · STARTER PACK · GEBUNDEN</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Starter Cards sind gebunden und nicht tauschbar. Du kannst sie später durch echte Momente weiterentwickeln.</Text>
        </View>

        <AuthButton label="ZUR SAMMLUNG" onPress={goCollection} />
        <AuthButton label="ZUM DASHBOARD" onPress={goDashboard} variant="secondary" />
      </OnboardingShell>
    );
  }

  if (state === 'revealing') {
    return (
      <OnboardingShell step={6} title="Card erhalten" subtitle="Tippe weiter, um dein Starter Pack vollständig zu öffnen.">
        <View style={styles.revealStage}>
          {currentRevealCard ? (
            <View style={styles.revealCard}>
              <CardTile card={currentRevealCard} fullWidth />
            </View>
          ) : null}
          <Text style={styles.revealCounter}>{revealedCount} / {cards.length}</Text>
        </View>
        <AuthButton label={revealedCount < cards.length ? 'NÄCHSTE CARD' : 'ERGEBNIS ANZEIGEN'} onPress={revealNext} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={6}
      title="Dein Starter Pack"
      subtitle="Dein erster CURVAO Moment wartet."
    >
      <Animated.View style={[styles.packCard, { transform: [{ scale: packScale }] }]}>
        <Animated.View style={[styles.packGlow, { opacity: glowOpacity }]} />
        <View style={styles.packIcon}>
          <Ionicons name="cube-outline" size={42} color={curvao.colors.gold} />
        </View>
        <Text style={styles.packTitle}>STARTER PACK</Text>
        <Text style={styles.packCopy}>Gebunden · Nicht tradable · Standard Cards</Text>
        <View style={styles.badgeRow}>
          <StarterBadge label="Gebunden" />
          <StarterBadge label="Nicht tradable" />
          <StarterBadge label="Standard" />
        </View>
        <Text style={styles.status}>Dieses Pack enthält gebundene Standard Cards für deinen Start.</Text>
      </Animated.View>

      {errorText ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <AuthButton label={state === 'opening' ? 'ÖFFNET…' : 'PACK ÖFFNEN'} onPress={openPack} loading={state === 'opening'} />
      {state === 'error' ? <AuthButton label="ZUM DASHBOARD" onPress={goDashboard} variant="secondary" /> : null}
      <AuthButton label="Später öffnen" onPress={skipPack} variant="text" />
    </OnboardingShell>
  );
}

function StarterBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  packCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.28)',
    backgroundColor: 'rgba(7,9,8,0.92)',
    padding: 28,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  packGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(216,170,77,0.18)',
    top: 28,
  },
  packIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
  },
  packTitle: {
    color: curvao.colors.gold,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2,
  },
  packCopy: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(216,170,77,0.08)',
  },
  badgeText: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  status: {
    color: curvao.colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(184,87,77,0.3)',
    backgroundColor: 'rgba(184,87,77,0.1)',
    padding: 12,
  },
  errorText: {
    color: curvao.colors.danger,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  revealStage: {
    alignItems: 'center',
    gap: 18,
  },
  revealCard: {
    width: 240,
  },
  revealCounter: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  resultCardWrap: {
    width: '47%',
    gap: 8,
  },
  cardMeta: {
    color: curvao.colors.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.22)',
    backgroundColor: 'rgba(18,22,20,0.84)',
    padding: 14,
  },
  infoText: {
    color: curvao.colors.text,
    opacity: 0.82,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
