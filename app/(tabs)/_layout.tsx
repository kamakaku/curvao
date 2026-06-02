import { Tabs, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TopBar } from '@/src/components/TopBar';
import { curvao } from '@/src/theme/curvaoTheme';
import { SvgIcon } from '@/src/components/ui/SvgIcon';
import { ICONS } from '@/src/constants/Icons';
import { useAuth } from '@/src/providers/AuthProvider';

export default function TabLayout() {
  const { user, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  if (!isInitialized || isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: () => <TopBar />,
          tabBarActiveTintColor: curvao.colors.gold,
          tabBarInactiveTintColor: curvao.colors.muted,
          tabBarStyle: {
            backgroundColor: 'rgba(10,12,11,0.96)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(216,170,77,0.18)',
            borderRadius: 24,
            bottom: 16,
            height: 72,
            left: 16,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            right: 16,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
          },
          tabBarBackground: () => (
            <View style={styles.tabBarBackground}>
              <LinearGradient
                colors={['rgba(24,28,26,0.98)', 'rgba(10,12,11,0.96)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 8,
            fontWeight: '400',
            marginTop: 0,
          },
          tabBarButton: HapticTab,
          sceneStyle: {
             backgroundColor: '#000',
          }
        }}>
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'HOME', 
            tabBarIcon: ({ color }) => <SvgIcon xml={ICONS.home} color={color} width={24} height={24} />
          }} 
        />
        <Tabs.Screen 
          name="collection/index" 
          options={{ 
            title: 'CARDS', 
            tabBarIcon: ({ color }) => <SvgIcon xml={ICONS.cards} color={color} width={24} height={24} />
          }} 
        />
        <Tabs.Screen
          name="collection/set/[id]"
          options={{
            href: null,
          }}
        />
        
        <Tabs.Screen 
          name="matches/index" 
          options={{ 
            title: 'MATCH', 
            tabBarIcon: ({ color }) => <SvgIcon xml={ICONS.match} color={color} width={24} height={24} />
          }} 
        />
        <Tabs.Screen
          name="matches/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="live-watch/[matchId]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="reward-package/[id]"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen 
          name="deck/index" 
          options={{ 
            title: 'CLASH', 
            tabBarIcon: ({ color }) => <SvgIcon xml={ICONS.clash} color={color} width={24} height={24} />
          }} 
        />
        <Tabs.Screen
          name="progress/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="pass/index" 
          options={{ 
            href: null,
          }} 
        />
      </Tabs>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
