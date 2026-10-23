import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/errors';
import { PRIVACY_URL, TERMS_URL } from '@/lib/config';
import { Body, Button, Field, Notice, Screen } from '@/ui/components';
import { Logo } from '@/ui/Logo';
import { space, type, usePalette } from '@/ui/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const c = usePalette();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError('Inserisci un indirizzo email valido.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithOtp({ email: clean, options: { shouldCreateUser: true } });
    setBusy(false);
    if (e) setError(friendlyError(e));
    else {
      setEmail(clean);
      setStep('code');
    }
  }

  async function verify() {
    if (code.trim().length < 6) {
      setError('Il codice ha almeno 6 cifre.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setBusy(false);
    if (e) setError(friendlyError(e));
  }

  // Accesso con password: serve agli account di prova per la revisione degli store
  async function signInWithPassword() {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean) || !password) {
      setError('Inserisci email e password.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email: clean, password });
    setBusy(false);
    if (e) setError(/invalid login/i.test(e.message) ? 'Email o password non corrette.' : friendlyError(e));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ gap: space.md, marginTop: space.xxl }}>
          <Logo size={56} />
          <Text style={[type.title, { color: c.ink }]}>PointEarner</Text>
          <Body muted>Le tessere fedeltà degli esercenti di quartiere, in un unico QR.</Body>
        </View>

        {step === 'email' ? (
          <View style={{ gap: space.md }}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="nome@esempio.it"
              returnKeyType="send"
              onSubmitEditing={sendCode}
              error={error}
            />
            <Button title="Ricevi il codice" onPress={sendCode} loading={busy} />
            <Body muted style={type.small}>
              Ti mandiamo un codice di accesso via email. Nessuna password da ricordare.
            </Body>
            <Pressable accessibilityRole="button" onPress={() => { setStep('password'); setError(null); }}>
              <Text style={[type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Accedi con password</Text>
            </Pressable>
          </View>
        ) : step === 'password' ? (
          <View style={{ gap: space.md }}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={signInWithPassword}
              error={error}
            />
            <Button title="Accedi" onPress={signInWithPassword} loading={busy} />
            <Button title="Usa il codice via email" variant="secondary" onPress={() => { setStep('email'); setError(null); }} />
          </View>
        ) : (
          <View style={{ gap: space.md }}>
            <Notice>Codice inviato a {email}. Controlla anche lo spam.</Notice>
            <Field
              label="Codice"
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="123456"
              returnKeyType="done"
              onSubmitEditing={verify}
              error={error}
            />
            <Button title="Accedi" onPress={verify} loading={busy} />
            <Button title="Cambia email" variant="secondary" onPress={() => { setStep('email'); setCode(''); setError(null); }} />
          </View>
        )}

        {PRIVACY_URL || TERMS_URL ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
            {PRIVACY_URL ? (
              <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
                <Text style={[type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Privacy</Text>
              </Pressable>
            ) : null}
            {TERMS_URL ? (
              <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
                <Text style={[type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Termini d’uso</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
