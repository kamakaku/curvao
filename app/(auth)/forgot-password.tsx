import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { AuthScreenShell } from '@/src/components/auth/AuthScreenShell';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { AuthButton } from '@/src/components/auth/AuthButton';
import { requestPasswordReset } from '@/src/services/authService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Bitte gib deine E-Mail ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell 
      title="Passwort zurücksetzen" 
      subtitle="Gib deine E-Mail ein. Wir senden dir einen Link zum Zurücksetzen."
    >
      {!success ? (
        <>
          <AuthTextInput
            label="E-MAIL"
            placeholder="deine@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <AuthButton 
              label="LINK SENDEN" 
              onPress={handleReset} 
              loading={loading}
            />
            
            <View style={styles.divider} />

            <Link href="/(auth)/login" asChild>
              <AuthButton label="Zurück zur Anmeldung" onPress={() => {}} variant="secondary" />
            </Link>
          </View>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Wenn ein Account existiert, erhältst du eine E-Mail zum Zurücksetzen deines Passworts.
          </Text>
          
          <View style={styles.actions}>
            <Link href="/(auth)/login" asChild>
              <AuthButton label="Zurück zur Anmeldung" onPress={() => {}} />
            </Link>
          </View>
        </View>
      )}
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 16,
    gap: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(184,87,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,87,77,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
  },
  successContainer: {
    marginTop: 20,
  },
  successText: {
    color: curvao.colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
});
