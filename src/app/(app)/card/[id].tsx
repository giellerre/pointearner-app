import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import type { HistoryRow, Merchant, Reward } from '@/lib/types';
import { Body, Card, Label, Notice, PointsBadge, Screen, formatDate } from '@/ui/components';
import { space, type, usePalette } from '@/ui/theme';

const KIND_LABEL = { EARN: 'Visita', REDEEM: 'Premio', REVERSAL: 'Storno' } as const;

export default function CardDetail() {
  const c = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [m, r, h] = await Promise.all([
          supabase.from('merchants').select('*').eq('id', id).maybeSingle(),
          supabase.from('rewards').select('*').eq('merchant_id', id).eq('active', true).order('cost_points'),
          supabase.rpc('my_history', { p_merchant: id }),
        ]);
        const e = m.error ?? r.error ?? h.error;
        if (e) setError(friendlyError(e));
        setMerchant(m.data as Merchant | null);
        setRewards((r.data as Reward[]) ?? []);
        setHistory((h.data as HistoryRow[]) ?? []);
      })();
    }, [id]),
  );

  const balance = history.reduce((s, row) => s + row.points, 0);

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: merchant?.name ?? 'Tessera' }} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Card>
        <Label>Saldo</Label>
        <Text style={[type.number, { color: c.ink }]}>{balance} pt</Text>
        {merchant ? <Body muted style={type.small}>{merchant.points_per_visit} punti a ogni visita · validi solo qui</Body> : null}
      </Card>

      <View style={{ gap: space.sm }}>
        <Label>Premi</Label>
        {rewards.length === 0 ? <Body muted>L’esercente non ha ancora pubblicato premi.</Body> : null}
        {rewards.map((r) => (
          <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Body>{r.title}</Body>
              <Body muted style={type.small}>
                {balance >= r.cost_points ? 'Disponibile: chiedilo in cassa' : `Mancano ${r.cost_points - balance} punti`}
              </Body>
            </View>
            <PointsBadge points={r.cost_points} />
          </Card>
        ))}
      </View>

      <View style={{ gap: space.sm }}>
        <Label>Movimenti</Label>
        {history.map((row) => (
          <View key={row.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <View style={{ flex: 1 }}>
              <Body>{row.reward_title ?? KIND_LABEL[row.kind]}</Body>
              <Body muted style={type.small}>{formatDate(row.created_at)}</Body>
            </View>
            <Text style={[type.body, { color: row.points > 0 ? c.ok : c.ink, fontWeight: '700', fontVariant: ['tabular-nums'] }]}>
              {row.points > 0 ? `+${row.points}` : row.points}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
