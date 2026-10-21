import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSession } from '@/lib/session';
import { usePalette } from '@/ui/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  const c = usePalette();
  const { mode } = useSession();
  const merchant = mode === 'merchant';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
      }}
    >
      <Tabs.Protected guard={!merchant}>
        <Tabs.Screen name="index" options={{ title: 'Tessere', tabBarIcon: icon('wallet-outline') }} />
        <Tabs.Screen name="qr" options={{ title: 'Il mio QR', tabBarIcon: icon('qr-code-outline') }} />
      </Tabs.Protected>
      <Tabs.Protected guard={merchant}>
        <Tabs.Screen name="scan" options={{ title: 'Scansiona', tabBarIcon: icon('scan-outline') }} />
        <Tabs.Screen name="rewards" options={{ title: 'Premi', tabBarIcon: icon('gift-outline') }} />
        <Tabs.Screen name="activity" options={{ title: 'Attività', tabBarIcon: icon('stats-chart-outline') }} />
      </Tabs.Protected>
      <Tabs.Screen name="profile" options={{ title: 'Profilo', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
