import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { OnboardingShell } from '@/src/components/onboarding/OnboardingShell';
import { useAuth } from '@/src/providers/AuthProvider';
import { getCurrentUser } from '@/src/services/authService';
import { getOnboardingDraft } from '@/src/services/onboardingDraftService';
import { completeOnboardingForUser } from '@/src/services/onboardingService';
import { curvao } from '@/src/theme/curvaoTheme';
import { mapAuthError } from '@/src/utils/authErrors';

export default function OnboardingAccountScreen() {
  const router = useRouter();
  const { register, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !passwordConfirm) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Bitte akzeptiere Nutzungsbedingungen und Datenschutzhinweise.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        email,
        password,
        passwordConfirm,
        name: name.trim(),
      });

      const draft = (await getOnboardingDraft()) ?? {
        preferredEarnMethods: [],
        createdAt: new Date().toISOString(),
      };
      const nextUser = await getCurrentUser();
      await completeOnboardingForUser({ userId: nextUser.id, draft });
      await refreshUser();

      router.replace('/onboarding/starter-pack');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={5}
      title="Account erstellen"
      subtitle="Speichere deinen Start und deine Sammlung."
      onBack={() => router.back()}
    >
      <View>
        <AuthTextInput label="NAME" value={name} onChangeText={setName} placeholder="Dein Name" textContentType="name" />
        <AuthTextInput
          label="E-MAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="deine@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />
        <AuthTextInput label="PASSWORT" value={password} onChangeText={setPassword} placeholder="Mindestens 8 Zeichen" secureTextEntry textContentType="newPassword" />
        <AuthTextInput label="PASSWORT BESTÄTIGEN" value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="Passwort wiederholen" secureTextEntry textContentType="newPassword" />
      </View>

      <CheckRow selected={acceptedTerms} onPress={() => setAcceptedTerms(!acceptedTerms)} label="Nutzungsbedingungen akzeptieren" />
      <CheckRow selected={acceptedPrivacy} onPress={() => setAcceptedPrivacy(!acceptedPrivacy)} label="Datenschutzhinweise akzeptieren" />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <AuthButton label="ACCOUNT ERSTELLEN" onPress={handleRegister} loading={loading} />

      <Link href="/(auth)/login?fromOnboarding=1" asChild>
        <AuthButton label="Bereits einen Account? Anmelden" onPress={() => {}} variant="text" />
      </Link>
    </OnboardingShell>
  );
}

function CheckRow({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.checkRow}>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <Ionicons name="checkmark" size={14} color="#080A09" /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: curvao.colors.gold,
    borderColor: curvao.colors.gold,
  },
  checkLabel: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(184,87,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,87,77,0.3)',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
