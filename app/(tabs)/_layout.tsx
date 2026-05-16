import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TopBar } from '@/src/components/TopBar';
import { curvao } from '@/src/theme/curvaoTheme';

const backgroundSource = require('@/assets/bg_1.png');

export default function TabLayout() {
  return (
    <View style={styles.root}>
      {/* GLOBAL PERSISTENT BACKGROUND */}
      <Image 
        source={backgroundSource} 
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
      />

      <Tabs
        screenOptions={{
          headerShown: true,
          header: () => <TopBar />,
          tabBarActiveTintColor: curvao.colors.gold,
          tabBarInactiveTintColor: curvao.colors.muted,
          tabBarStyle: {
            backgroundColor: 'rgba(0,0,0,0.8)', // Semi-transparent black
            borderTopColor: '#1a1a1a',
            height: 85,
            paddingBottom: 25,
            position: 'absolute', // Necessary for transparency to work correctly with content behind
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: -5,
          },
          tabBarButton: HapticTab,
          sceneStyle: {
             backgroundColor: 'transparent',
          }
        }}>
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'HOME', 
            tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="collection/index" 
          options={{ 
            title: 'SAMMLUNG', 
            tabBarIcon: ({ color }) => <Ionicons name="copy-sharp" size={24} color={color} /> 
          }} 
        />
        
        {/* Center Action Button - Using matches as a placeholder for "HINZUFÜGEN" logic for now */}
        <Tabs.Screen 
          name="matches/index" 
          options={{ 
            title: 'HINZUFÜGEN', 
            tabBarIcon: ({ color }) => (
              <View style={styles.centerButton}>
                <Ionicons name="add" size={32} color={curvao.colors.textInverted} />
              </View>
            ),
            tabBarLabelStyle: {
               color: curvao.colors.gold,
               fontSize: 10,
               fontWeight: '800',
               marginTop: 5,
            }
          }} 
        />

        <Tabs.Screen 
          name="deck/index" 
          options={{ 
            title: 'CLASH', 
            tabBarIcon: ({ color }) => <Ionicons name="flash-sharp" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="pass/index" 
          options={{ 
            title: 'PROFIL', 
            tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={24} color={color} /> 
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
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: curvao.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: curvao.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
