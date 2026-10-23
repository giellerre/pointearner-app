import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { useActiveMerchant } from '@/lib/session';
import type { ActivityRow, MerchantStats } from '@/lib/types';
import { Body, Card, Label, Notice, Title, formatDate } from '@/ui/components';
import { radius, space, type, usePalette } from '@/ui/theme';

const KIND_LABEL = { EARN: 'Visita', REDEEM: 'Premio', REVERSAL: 'Storno' } as const;
const NORTH_STAR = 20; // scansioni a settimana per considerare attivo un esercente del pilota

export default function Activity() {
  const c = usePalette();
  const membership = useActiveMerchant();
  const merchantId = membership?.merchant_id;
  const isOwner = membership?.role === 'owner';
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  const load = useCallback(async () => {
    if (!merchantId) return;
    setLoadedAt(Date.now());
    const [s, a] = await Promise.all([
      supabase.rpc('merchant_stats', { p_merchant: merchantId }),
      supabase.rpc('merchant_activity', { p_merchant: merchantId }),
    ]);
    const e = s.error ?? a.error;
    setError(e ? friendlyError(e) : null);
    setStats(s.data as MerchantStats | null);
    setRows((a.data as ActivityRow[]) ?? []);
  }, [merchantId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function reverse(id: string) {
    setConfirmId(null);
    const { error: e } = await supabase.rpc('reverse_entry', { p_entry: id, p_note: 'Storno da app' });
    if (e) setError(friendlyError(e));
    else {
      setNotice('Movimento stornato.');
      load();
    }
  }

  const scans = stats?.scans_7d ?? 0;
  const progress = Math.min(1, scans / NORTH_STAR);
  const canReverse = (row: ActivityRow) =>
    isOwner && row.kind !== 'REVERSAL' && !row.reversed && loadedAt - new Date(row.created_at).getTime() < 24 * 3600 * 1000;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={c.accent} />}
      >
        <Title sub={membership?.merchants.name}>Attività</Title>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {notice ? <Notice tone="ok">{notice}</Notice> : null}

        <Card>
          <Label>Ultimi 7 giorni</Label>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
            <Text style={[type.number, { color: c.ink }]}>{scans}</Text>
            <Body muted>visite registrate</Body>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: scans >= NORTH_STAR ? c.ok : c.accent }} />
          </View>
          <Body muted style={type.small}>
            {scans >= NORTH_STAR ? 'Obiettivo settimanale raggiunto.' : `${NORTH_STAR - scans} visite all’obiettivo settimanale di ${NORTH_STAR}.`}
          </Body>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {[
            ['Consumatori (7 gg)', stats?.customers_7d],
            ['Premi (7 gg)', stats?.redemptions_7d],
            ['Consumatori totali', stats?.customers_total],
            ['Tornati 2+ volte', stats?.returning_customers],
          ].map(([label, value]) => (
            <View key={label as string} style={{ flexGrow: 1, flexBasis: '45%', backgroundColor: c.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: c.line }}>
              <Text style={[type.h2, { color: c.ink, fontVariant: ['tabular-nums'] }]}>{value ?? '–'}</Text>
              <Body muted style={type.small}>{label as string}</Body>
            </View>
          ))}
        </View>

        <View style={{ gap: space.xs }}>
          <Label>Movimenti recenti</Label>
          {rows.length === 0 ? <Body muted>Nessun movimento. Il primo arriva con la prima scansione.</Body> : null}
          {rows.map((row) => (
            <View key={row.id} style={{ paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: c.line, gap: space.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <Body>{row.customer_name} · {row.reward_title ?? KIND_LABEL[row.kind]}</Body>
                  <Body muted style={type.small}>{formatDate(row.created_at)}{row.reversed ? ' · stornato' : ''}</Body>
                </View>
                <Text style={[type.body, { color: row.points > 0 ? c.ok : c.ink, fontWeight: '700', fontVariant: ['tabular-nums'], textDecorationLine: row.reversed ? 'line-through' : 'none' }]}>
                  {row.points > 0 ? `+${row.points}` : row.points}
                </Text>
              </View>
              {canReverse(row) ? (
                confirmId === row.id ? (
                  <View style={{ flexDirection: 'row', gap: space.lg }}>
                    <Pressable accessibilityRole="button" onPress={() => reverse(row.id)}>
                      <Text style={[type.small, { color: c.crit, fontWeight: '700' }]}>Conferma storno</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => setConfirmId(null)}>
                      <Text style={[type.small, { color: c.muted }]}>Annulla</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" onPress={() => setConfirmId(row.id)}>
                    <Text style={[type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Storna</Text>
                  </Pressable>
                )
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
