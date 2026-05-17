import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TopBar } from '@/src/components/TopBar';
import { curvao } from '@/src/theme/curvaoTheme';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: () => <TopBar />,
          tabBarActiveTintColor: curvao.colors.gold,
          tabBarInactiveTintColor: curvao.colors.muted,
          tabBarStyle: {
            backgroundColor: 'transparent', 
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 0,
            position: 'absolute',
            elevation: 0,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
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
        
        <Tabs.Screen 
          name="matches/index" 
          options={{ 
            title: 'HINZUFÜGEN', 
            tabBarIcon: () => (
              <View style={styles.centerButton}>
                <Ionicons name="add" size={20} color={curvao.colors.textInverted} />
              </View>
            ),
            tabBarLabelStyle: {
               color: curvao.colors.gold,
               fontSize: 8,
               fontWeight: '400',
               marginTop: 0, // Adjusted for the raised button
            }
          }} 
        />

        <Tabs.Screen 
          name="deck/index" 
          options={{ 
            title: 'CLASH', 
            tabBarIcon: ({ color }) => <Ionicons name="flash-sharp" size={18} color={color} /> 
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
  centerButton: {
    width: 40,
    height: 40,
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
