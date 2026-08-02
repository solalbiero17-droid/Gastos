import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="activity" options={{ title: 'Actividad' }} />
      <Tabs.Screen name="stats" options={{ title: 'Resumen' }} />
      <Tabs.Screen name="goals" options={{ title: 'Metas' }} />
    </Tabs>
  );
}
