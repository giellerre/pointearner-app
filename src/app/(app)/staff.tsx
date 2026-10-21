import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { useActiveMerchant } from '@/lib/session';
import { Body, Button, Card, Field, Label, Notice, Screen } from '@/ui/components';
import { space, type, usePalette } from '@/ui/theme';

type StaffRow = { user_id: string; role: 'owner' | 'staff'; display_name: string | null; email: string; is_me: boolean };

export default function Staff() {
  const c = usePalette();
  const membership = useActiveMerchant();
  const merchantId = membership?.merchant_id;
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!merchantId) return;
    const { data, error: e } = await supabase.rpc('list_staff', { p_merchant: merchantId });
    if (e) setError(friendlyError(e));
    else setRows((data as StaffRow[]) ?? []);
  }, [merchantId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function add() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Inserisci l’email del collaboratore.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.rpc('add_staff', { p_merchant: merchantId, p_email: email.trim() });
    setBusy(false);
    if (e) setError(friendlyError(e));
    else {
      setEmail('');
      setNotice('Collaboratore aggiunto. Trova il negozio in Profilo → Modalità negozio.');
      load();
    }
  }

  async function remove(userId: string) {
    setConfirmId(null);
    const { error: e } = await supabase.rpc('remove_staff', { p_merchant: merchantId, p_user: userId });
    if (e) setError(friendlyError(e));
    else {
      setNotice('Collaboratore rimosso.');
      load();
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Body muted>
        I collaboratori scansionano i clienti, assegnano punti e riscattano premi. Premi, storni e collaboratori restano al titolare.
      </Body>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="ok">{notice}</Notice> : null}

      <View style={{ gap: space.xs }}>
        <Label>{membership?.merchants.name}</Label>
        {rows.map((r) => (
          <View key={r.user_id} style={{ paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: c.line, gap: space.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Body>{r.display_name || r.email}{r.is_me ? ' (tu)' : ''}</Body>
                {r.display_name ? <Body muted style={type.small}>{r.email}</Body> : null}
              </View>
              <Body muted style={type.small}>{r.role === 'owner' ? 'Titolare' : 'Collaboratore'}</Body>
            </View>
            {r.role === 'staff' ? (
              confirmId === r.user_id ? (
                <View style={{ flexDirection: 'row', gap: space.lg }}>
                  <Pressable accessibilityRole="button" onPress={() => remove(r.user_id)}>
                    <Text style={[type.small, { color: c.crit, fontWeight: '700' }]}>Conferma rimozione</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setConfirmId(null)}>
                    <Text style={[type.small, { color: c.muted }]}>Annulla</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable accessibilityRole="button" onPress={() => setConfirmId(r.user_id)}>
                  <Text style={[type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Rimuovi</Text>
                </Pressable>
              )
            ) : null}
          </View>
        ))}
      </View>

      <Card>
        <Label>Aggiungi collaboratore</Label>
        <Body muted style={type.small}>Prima chiedi al collaboratore di scaricare l’app e accedere una volta con la sua email.</Body>
        <Field label="Email del collaboratore" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Button title="Aggiungi" onPress={add} loading={busy} />
      </Card>
    </Screen>
  );
}
