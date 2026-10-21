import { useCallback, useState } from 'react';
import { Switch, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { useActiveMerchant, useSession } from '@/lib/session';
import type { Reward } from '@/lib/types';
import { Body, Button, Card, Empty, Field, Label, Notice, PointsBadge, Screen, Title } from '@/ui/components';
import { space, type, usePalette } from '@/ui/theme';

export default function Rewards() {
  const c = usePalette();
  const { refresh } = useSession();
  const membership = useActiveMerchant();
  const merchantId = membership?.merchant_id;
  const isOwner = membership?.role === 'owner';
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [perVisit, setPerVisit] = useState(String(membership?.merchants.points_per_visit ?? 10));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) return;
    const { data, error: e } = await supabase.from('rewards').select('*').eq('merchant_id', merchantId).order('cost_points');
    if (e) setError(friendlyError(e));
    setRewards((data as Reward[]) ?? []);
  }, [merchantId]);

  useFocusEffect(
    useCallback(() => {
      load();
      setPerVisit(String(membership?.merchants.points_per_visit ?? 10));
    }, [load, membership?.merchants.points_per_visit]),
  );

  async function addReward() {
    const n = parseInt(cost, 10);
    if (title.trim().length < 2 || !Number.isFinite(n) || n < 1) {
      setError('Scrivi il nome del premio e quanti punti costa.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.from('rewards').insert({ merchant_id: merchantId, title: title.trim(), cost_points: n });
    setBusy(false);
    if (e) setError(friendlyError(e));
    else {
      setTitle('');
      setCost('');
      setSaved('Premio aggiunto.');
      load();
    }
  }

  async function toggle(r: Reward) {
    const { error: e } = await supabase.from('rewards').update({ active: !r.active }).eq('id', r.id);
    if (e) setError(friendlyError(e));
    else load();
  }

  async function savePerVisit() {
    const n = parseInt(perVisit, 10);
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      setError('I punti per visita vanno da 1 a 1000.');
      return;
    }
    const { error: e } = await supabase.from('merchants').update({ points_per_visit: n }).eq('id', merchantId);
    if (e) setError(friendlyError(e));
    else {
      setSaved('Punti per visita aggiornati.');
      refresh();
    }
  }

  return (
    <Screen>
      <Title sub={membership?.merchants.name}>Premi</Title>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="ok">{saved}</Notice> : null}

      {isOwner ? (
        <Card>
          <Label>Punti a ogni visita</Label>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field label="Punti" value={perVisit} onChangeText={(t) => setPerVisit(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={4} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Salva" variant="secondary" onPress={savePerVisit} />
            </View>
          </View>
        </Card>
      ) : null}

      {rewards.length === 0 ? (
        <Empty title="Nessun premio">Aggiungi il primo: per esempio «Caffè omaggio» a 100 punti, cioè la decima visita.</Empty>
      ) : (
        rewards.map((r) => (
          <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Body style={{ color: r.active ? c.ink : c.muted }}>{r.title}</Body>
              <Body muted style={type.small}>{r.active ? 'Visibile ai clienti' : 'Nascosto'}</Body>
            </View>
            <PointsBadge points={r.cost_points} />
            {isOwner ? (
              <Switch value={r.active} onValueChange={() => toggle(r)} accessibilityLabel={`Premio ${r.title} attivo`} trackColor={{ true: c.accent, false: c.line }} />
            ) : null}
          </Card>
        ))
      )}

      {isOwner ? (
        <Card>
          <Label>Nuovo premio</Label>
          <Notice tone="info">
            Sconti o prodotti dello stesso tipo di quelli che vendi (caffè omaggio, 10% sul prossimo taglio) non richiedono adempimenti. Un premio diverso, come un gadget o un buono di un altro negozio, è un&apos;operazione a premio: servono un regolamento scritto e una cauzione del 20% del valore dei premi (DPR 430/2001). Ne rispondi tu come promotore.
          </Notice>
          <Field label="Nome" value={title} onChangeText={setTitle} placeholder="Caffè omaggio" maxLength={60} />
          <Field label="Costo in punti" value={cost} onChangeText={(t) => setCost(t.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="100" maxLength={6} />
          <Button title="Aggiungi premio" onPress={addReward} loading={busy} />
        </Card>
      ) : (
        <Body muted>Solo il titolare può modificare i premi.</Body>
      )}
    </Screen>
  );
}
