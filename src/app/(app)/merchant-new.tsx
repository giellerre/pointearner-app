import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { useSession } from '@/lib/session';
import { CATEGORIES, type Category } from '@/lib/types';
import { Body, Button, Field, Label, Notice, Screen } from '@/ui/components';
import { radius, space, type, usePalette } from '@/ui/theme';

export default function MerchantNew() {
  const c = usePalette();
  const { refresh, setActiveMerchant, setMode } = useSession();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<Category>('Bar');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (name.trim().length < 2) {
      setError('Scrivi il nome dell’attività.');
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc('create_merchant', { p_name: name.trim(), p_category: category, p_address: address.trim() || null });
    if (e) {
      setBusy(false);
      setError(friendlyError(e));
      return;
    }
    await refresh();
    setActiveMerchant(data as string);
    setMode('merchant');
    setBusy(false);
    router.back();
  }

  return (
    <Screen edges={['bottom']}>
      <Body muted>Registra la tua attività per assegnare punti ai consumatori. Durante la fase pilota il servizio è gratuito.</Body>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Field label="Nome dell’attività" value={name} onChangeText={setName} placeholder="Bar Centrale" maxLength={80} />
      <View style={{ gap: space.sm }}>
        <Label>Categoria</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CATEGORIES.map((cat) => {
            const on = cat === category;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={{ paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accentSoft : c.surface }}
              >
                <Text style={[type.small, { color: on ? c.accent : c.ink, fontWeight: '600' }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Field label="Indirizzo" value={address} onChangeText={setAddress} placeholder="Via Roma 1, Milano" maxLength={160} />
      <Button title="Registra" onPress={create} loading={busy} />
    </Screen>
  );
}
