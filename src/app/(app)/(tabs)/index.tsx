import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import type { Card as CardT } from '@/lib/types';
import { Body, Button, Card, Empty, Label, Notice, PointsBadge, Title } from '@/ui/components';
import { space, type, usePalette } from '@/ui/theme';

export default function Cards() {
  const c = usePalette();
  const [cards, setCards] = useState<CardT[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('my_cards');
    if (e) setError(friendlyError(e));
    else {
      setError(null);
      setCards((data as CardT[]) ?? []);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={c.accent} />}
      >
        <Title sub="Una tessera per ogni esercente presso cui accumuli punti">Le tue tessere</Title>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {cards && cards.length === 0 ? (
          <Empty title="Nessuna tessera, per ora">
            Al prossimo acquisto mostra il tuo QR alla cassa: la tessera dell’esercente comparirà qui.
          </Empty>
        ) : null}
        {cards && cards.length === 0 ? <Button title="Mostra il mio QR" onPress={() => router.navigate('/qr')} /> : null}
        {cards?.map((card) => {
          const progress = card.next_reward_cost ? Math.min(1, card.balance / card.next_reward_cost) : 1;
          return (
            <Card key={card.merchant_id} onPress={() => router.push(`/card/${card.merchant_id}`)} accessibilityLabel={`${card.merchant_name}, ${card.balance} punti`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Label>{card.category}</Label>
                  <Text style={[type.h2, { color: c.ink }]} numberOfLines={2}>{card.merchant_name}</Text>
                  {card.address ? <Body muted style={type.small}>{card.address}</Body> : null}
                </View>
                <PointsBadge points={card.balance} />
              </View>
              {card.reward_available ? (
                <Notice tone="ok">Hai già punti per un premio: chiedilo in cassa.</Notice>
              ) : card.next_reward_title && card.next_reward_cost ? (
                <View style={{ gap: space.xs }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: 'hidden' }}>
                    <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: c.accent }} />
                  </View>
                  <Body muted style={type.small}>
                    {card.next_reward_cost - card.balance} punti a «{card.next_reward_title}»
                  </Body>
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
