import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from './components';
import { space, type, usePalette } from './theme';

export type LegalSection = { title: string; paragraphs?: string[]; bullets?: string[] };

export function LegalPage({ title, updated, intro, sections, children }: { title: string; updated: string; intro: string; sections: LegalSection[]; children?: ReactNode }) {
  const c = usePalette();
  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title, headerShown: true }} />
      <View style={{ gap: space.sm, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        <Text style={[type.title, { color: c.ink }]} accessibilityRole="header">{title}</Text>
        <Text style={[type.small, { color: c.muted }]}>Ultimo aggiornamento: {updated}</Text>
        <Text style={[type.body, { color: c.ink }]}>{intro}</Text>
        {sections.map((s) => (
          <View key={s.title} style={{ gap: space.sm, marginTop: space.md }}>
            <Text style={[type.h2, { color: c.ink }]} accessibilityRole="header">{s.title}</Text>
            {s.paragraphs?.map((p) => (
              <Text key={p} style={[type.body, { color: c.ink }]} selectable>{p}</Text>
            ))}
            {s.bullets?.map((b) => (
              <Text key={b} style={[type.body, { color: c.ink }]} selectable>•  {b}</Text>
            ))}
          </View>
        ))}
        {children ? <View style={{ gap: space.sm, marginTop: space.md }}>{children}</View> : null}
      </View>
    </Screen>
  );
}
