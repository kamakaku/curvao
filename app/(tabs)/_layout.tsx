import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { curvao } from '@/src/theme/curvaoTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: curvao.colors.gold,
        tabBarInactiveTintColor: curvao.colors.muted,
        tabBarStyle: {
          backgroundColor: curvao.colors.surface,
          borderTopColor: curvao.colors.border,
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="matches/index" options={{ title: 'Matches', tabBarIcon: ({ color, size }) => <Ionicons name="football" size={size} color={color} /> }} />
      <Tabs.Screen name="collection/index" options={{ title: 'Collection', tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} /> }} />
      <Tabs.Screen name="deck/index" options={{ title: 'Deck', tabBarIcon: ({ color, size }) => <Ionicons name="layers" size={size} color={color} /> }} />
      <Tabs.Screen name="pass/index" options={{ title: 'Pass', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
