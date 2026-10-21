import { useCallback, useRef, useState } from 'react';
import { AppState, Platform, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Brightness from 'expo-brightness';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { QR_REFRESH_MS } from '@/lib/config';
import { useSession } from '@/lib/session';
import { Body, Button, Notice, Screen, Title } from '@/ui/components';
import { radius, space, type, usePalette } from '@/ui/theme';

export default function MyQr() {
  const c = usePalette();
  const { width } = useWindowDimensions();
  const { displayName } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [now, setNow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const previousBrightness = useRef<number | null>(null);
  const expiresRef = useRef(0);

  const issue = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('issue_qr_token');
    if (e) {
      setError(friendlyError(e));
      return;
    }
    const row = (data as { token: string; expires_at: string }[])[0];
    const exp = new Date(row.expires_at).getTime();
    expiresRef.current = exp;
    setToken(row.token);
    setExpiresAt(exp);
    setNow(Date.now());
    setError(null);
  }, []);

  // Schermo luminoso solo mentre il QR è visibile
  useFocusEffect(
    useCallback(() => {
      let active = true;
      issue();
      (async () => {
        try {
          if (!(await Brightness.isAvailableAsync())) return;
          previousBrightness.current = await Brightness.getBrightnessAsync();
          if (active) await Brightness.setBrightnessAsync(1);
        } catch {
          // la luminosità è un aiuto, non un requisito
        }
      })();
      const refresh = setInterval(issue, QR_REFRESH_MS);
      const tick = setInterval(() => {
        const t = Date.now();
        setNow(t);
        if (expiresRef.current && t > expiresRef.current) {
          expiresRef.current = 0;
          issue();
        }
      }, 1000);
      const appState = AppState.addEventListener('change', (s) => {
        if (s === 'active') issue();
      });
      return () => {
        active = false;
        clearInterval(refresh);
        clearInterval(tick);
        appState.remove();
        (async () => {
          try {
            if (Platform.OS === 'android') await Brightness.restoreSystemBrightnessAsync();
            else if (previousBrightness.current != null) await Brightness.setBrightnessAsync(previousBrightness.current);
          } catch {
            // nessuna azione
          }
        })();
      };
    }, [issue]),
  );

  const seconds = Math.max(0, Math.round((expiresAt - now) / 1000));
  const size = Math.min(width - space.lg * 4, 300);

  return (
    <Screen>
      <Title sub="Mostralo in cassa: il negozio lo scansiona e ti assegna i punti">La tua tessera</Title>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <View
        style={{ alignSelf: 'center', backgroundColor: '#FFFFFF', padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line }}
        accessible
        accessibilityLabel="Codice QR personale"
      >
        {token ? <QRCode value={token} size={size} backgroundColor="#FFFFFF" color="#000000" ecl="M" /> : <View style={{ width: size, height: size }} />}
      </View>
      <View style={{ alignItems: 'center', gap: space.xs }}>
        {displayName ? <Text style={[type.h2, { color: c.ink }]}>{displayName}</Text> : null}
        <Body muted style={type.small}>
          {token ? `Si rinnova da solo · valido ancora ${seconds} s` : 'Generazione del codice…'}
        </Body>
      </View>
      <Button title="Rinnova ora" variant="secondary" onPress={issue} />
      <Body muted style={type.small}>
        Il codice cambia ogni due minuti, così una foto del QR non basta a usare i tuoi punti.
      </Body>
    </Screen>
  );
}
