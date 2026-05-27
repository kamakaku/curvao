import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { curvao } from '@/src/theme/curvaoTheme';

export default function ClaimCardScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/matches');
    }, 1200);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <CurvaoScreen>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Direktes Claiming deaktiviert</Text>
          <Text style={styles.copy}>Cards werden nur noch über Matchday-Aktionen, Stadium Check-in, Live Watch und Reward Packages vergeben.</Text>
        </View>
        <PrimaryButton label="Zum Matchday" onPress={() => router.replace('/matches')} />
      </View>
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: curvao.spacing.lg,
    justifyContent: 'center',
    minHeight: 420,
  },
  header: {
    gap: curvao.spacing.xs,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.xxl,
    fontWeight: curvao.typography.weight.black,
  },
  copy: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.base,
    fontWeight: curvao.typography.weight.semiBold,
    lineHeight: 22,
  },
});
