import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { useActiveMerchant } from '@/lib/session';
import type { CustomerLookup, Reward } from '@/lib/types';
import { Body, Button, Card, Field, Label, Notice, PointsBadge, Screen } from '@/ui/components';
import { space, type, usePalette } from '@/ui/theme';

export default function Customer() {
  const c = usePalette();
  const { token } = useLocalSearchParams<{ token: string }>();
  const membership = useActiveMerchant();
  const merchantId = membership?.merchant_id;
  const [info, setInfo] = useState<CustomerLookup | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId || !token) return;
    (async () => {
      const [l, r] = await Promise.all([
        supabase.rpc('lookup_customer', { p_merchant: merchantId, p_token: token }),
        supabase.from('rewards').select('*').eq('merchant_id', merchantId).eq('active', true).order('cost_points'),
      ]);
      if (l.error) setError(friendlyError(l.error));
      else setInfo(l.data as CustomerLookup);
      setRewards((r.data as Reward[]) ?? []);
      setPoints(String(membership?.merchants.points_per_visit ?? 10));
    })();
  }, [merchantId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function earn() {
    const n = parseInt(points, 10);
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      setError('Inserisci un numero di punti tra 1 e 1000.');
      return;
    }
    setBusy('earn');
    setError(null);
    const { data, error: e } = await supabase.rpc('earn_points', { p_merchant: merchantId, p_token: token, p_points: n });
    setBusy(null);
    if (e) {
      setError(friendlyError(e));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    const res = data as { points: number; balance: number };
    setInfo((prev) => (prev ? { ...prev, balance: res.balance, visits: prev.visits + 1 } : prev));
    setDone(`+${res.points} punti assegnati. Nuovo saldo: ${res.balance}.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  async function redeem(reward: Reward) {
    setBusy(reward.id);
    setError(null);
    const { data, error: e } = await supabase.rpc('redeem_reward', { p_merchant: merchantId, p_token: token, p_reward: reward.id });
    setBusy(null);
    if (e) {
      setError(friendlyError(e));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    const res = data as { reward: string; balance: number };
    setInfo((prev) => (prev ? { ...prev, balance: res.balance } : prev));
    setDone(`Premio «${res.reward}» riscattato. Saldo residuo: ${res.balance}.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  return (
    <Screen edges={['bottom']}>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {done ? <Notice tone="ok">{done}</Notice> : null}

      {info ? (
        <>
          <Card>
            <Label>Consumatore</Label>
            <Text style={[type.h2, { color: c.ink }]}>{info.display_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md }}>
              <Text style={[type.number, { color: c.ink }]}>{info.balance}</Text>
              <Body muted>punti · {info.visits} {info.visits === 1 ? 'visita' : 'visite'}</Body>
            </View>
          </Card>

          {!info.can_operate ? (
            <Notice tone="error">Il periodo di prova è finito: puoi far riscattare premi ma non assegnare nuovi punti.</Notice>
          ) : (
            <View style={{ gap: space.md }}>
              <Field label="Punti da assegnare" value={points} onChangeText={(t) => setPoints(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={4} />
              <Button title="Assegna punti" onPress={earn} loading={busy === 'earn'} disabled={!!done && done.startsWith('+')} />
            </View>
          )}

          <View style={{ gap: space.sm }}>
            <Label>Riscatta un premio</Label>
            {rewards.length === 0 ? <Body muted>Nessun premio attivo. Aggiungili dalla scheda Premi.</Body> : null}
            {rewards.map((r) => {
              const ok = info.balance >= r.cost_points;
              return (
                <Card key={r.id} style={{ gap: space.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md }}>
                    <Body style={{ flex: 1 }}>{r.title}</Body>
                    <PointsBadge points={r.cost_points} />
                  </View>
                  <Button
                    title={ok ? 'Riscatta' : `Mancano ${r.cost_points - info.balance} punti`}
                    variant={ok ? 'primary' : 'secondary'}
                    disabled={!ok}
                    loading={busy === r.id}
                    onPress={() => redeem(r)}
                  />
                </Card>
              );
            })}
          </View>
        </>
      ) : !error ? (
        <Body muted>Lettura del QR del consumatore…</Body>
      ) : null}

      <Button title="Nuova scansione" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
