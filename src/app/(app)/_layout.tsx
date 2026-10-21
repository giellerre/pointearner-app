import { Stack } from 'expo-router';
import { usePalette } from '@/ui/theme';

export default function AppLayout() {
  const c = usePalette();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.ink,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: c.bg },
        headerBackTitle: 'Indietro',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="card/[id]" options={{ title: 'Tessera' }} />
      <Stack.Screen name="merchant-new" options={{ title: 'Registra il negozio', presentation: 'modal' }} />
      <Stack.Screen name="customer" options={{ title: 'Cliente', presentation: 'modal' }} />
      <Stack.Screen name="staff" options={{ title: 'Collaboratori' }} />
    </Stack>
  );
}
