import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/lib/config';
import { useSession } from '@/lib/session';
import { Body, Button, Card, Field, Label, Notice, Screen, Title } from '@/ui/components';
import { radius, space, type, usePalette } from '@/ui/theme';

export default function Profile() {
  const c = usePalette();
  const { session, displayName, memberships, activeMerchantId, mode, setMode, setActiveMerchant, refresh } = useSession();
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveName(name: string) {
    const clean = name.trim();
    const { error: e } = await supabase.from('profiles').update({ display_name: clean || null }).eq('id', session!.user.id);
    if (e) setError(friendlyError(e));
    else {
      setError(null);
      setSaved('Nome salvato.');
      refresh();
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    const { error: e } = await supabase.rpc('delete_my_account');
    if (e) {
      setDeleting(false);
      setError(friendlyError(e));
      return;
    }
    await supabase.auth.signOut({ scope: 'local' });
  }

  return (
    <Screen>
      <Title sub={session?.user.email}>Profilo</Title>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="ok">{saved}</Notice> : null}

      <NameEditor key={displayName ?? ''} initial={displayName ?? ''} onSave={saveName} />

      {memberships.length > 0 ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Body>Modalità esercente</Body>
              <Body muted style={type.small}>Leggi il QR dei consumatori, gestisci premi e attività</Body>
            </View>
            <Switch
              value={mode === 'merchant'}
              onValueChange={(v) => setMode(v ? 'merchant' : 'customer')}
              trackColor={{ true: c.accent, false: c.line }}
              accessibilityLabel="Modalità esercente"
            />
          </View>
          {memberships.length > 1 ? (
            <View style={{ gap: space.sm }}>
              <Label>Attività selezionata</Label>
              {memberships.map((m) => {
                const on = m.merchant_id === activeMerchantId;
                return (
                  <Pressable
                    key={m.merchant_id}
                    onPress={() => setActiveMerchant(m.merchant_id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={{ padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accentSoft : c.surface }}
                  >
                    <Text style={[type.body, { color: c.ink }]}>{m.merchants.name}</Text>
                    <Text style={[type.small, { color: c.muted }]}>{m.role === 'owner' ? 'Titolare' : 'Collaboratore'}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {memberships.find((m) => m.merchant_id === activeMerchantId)?.role === 'owner' ? (
            <Button title="Collaboratori" variant="secondary" onPress={() => router.push('/staff')} />
          ) : null}
          <Button title="Registra un’altra attività" variant="secondary" onPress={() => router.push('/merchant-new')} />
        </Card>
      ) : (
        <Card>
          <Body>Hai un bar, una pasticceria o un ristorante?</Body>
          <Body muted style={type.small}>Registra l’attività e assegna punti ai consumatori dal telefono.</Body>
          <Button title="Registra la tua attività" variant="secondary" onPress={() => router.push('/merchant-new')} />
        </Card>
      )}

      <View style={{ gap: space.md }}>
        {PRIVACY_URL ? <Button title="Informativa privacy" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} /> : null}
        {TERMS_URL ? <Button title="Termini d’uso" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} /> : null}
        {SUPPORT_EMAIL ? (
          <Card>
            <Label>Assistenza</Label>
            <Text selectable style={[type.body, { color: c.ink }]}>{SUPPORT_EMAIL}</Text>
          </Card>
        ) : null}
        <Button title="Esci" variant="secondary" onPress={() => supabase.auth.signOut()} />
      </View>

      <Card>
        <Label>Elimina account</Label>
        <Body muted style={type.small}>
          Cancella il tuo account, le tue tessere e i tuoi punti in modo definitivo. Se sei l’unico titolare di un’attività, anche l’attività viene chiusa.
        </Body>
        {confirmDelete ? (
          <View style={{ gap: space.sm }}>
            <Notice tone="error">Questa operazione non si può annullare.</Notice>
            <Button title="Elimina definitivamente" variant="danger" onPress={deleteAccount} loading={deleting} />
            <Button title="Annulla" variant="secondary" onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <Button title="Elimina account" variant="danger" onPress={() => setConfirmDelete(true)} />
        )}
      </Card>

      <Body muted style={[type.small, { textAlign: 'center' }]}>PointEarner {Constants.expoConfig?.version ?? ''}</Body>
    </Screen>
  );
}

function NameEditor({ initial, onSave }: { initial: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial);
  return (
    <Card>
      <Field label="Nome visibile all’esercente" value={name} onChangeText={setName} placeholder="Facoltativo" maxLength={60} />
      <Button title="Salva nome" variant="secondary" onPress={() => onSave(name)} />
    </Card>
  );
}
