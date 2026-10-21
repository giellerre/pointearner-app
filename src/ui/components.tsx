import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, space, type, usePalette } from './theme';

export function Screen({ children, scroll = true, edges }: { children: ReactNode; scroll?: boolean; edges?: ('top' | 'bottom')[] }) {
  const c = usePalette();
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenContent, { flex: 1 }]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={edges ?? ['top']}>
      {body}
    </SafeAreaView>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  const c = usePalette();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={[type.title, { color: c.ink }]} accessibilityRole="header">
        {children}
      </Text>
      {sub ? <Text style={[type.body, { color: c.muted }]}>{sub}</Text> : null}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  const c = usePalette();
  return <Text style={[type.label, { color: c.muted }]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  const c = usePalette();
  return <Text style={[type.body, { color: muted ? c.muted : c.ink }, style]}>{children}</Text>;
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: ViewStyle; onPress?: () => void; accessibilityLabel?: string }) {
  const c = usePalette();
  const base = [styles.card, { backgroundColor: c.surface, borderColor: c.line }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const c = usePalette();
  const bg = variant === 'primary' ? c.accent : variant === 'danger' ? c.critSoft : c.surface;
  const fg = variant === 'primary' ? c.accentInk : variant === 'danger' ? c.crit : c.ink;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: variant === 'secondary' ? c.line : bg, opacity: off ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string | null }) {
  const c = usePalette();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={[type.small, { color: c.muted, fontWeight: '600' }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.muted}
        accessibilityLabel={label}
        {...props}
        style={[styles.input, { color: c.ink, backgroundColor: c.surface, borderColor: error ? c.crit : c.line }]}
      />
      {error ? <Text style={[type.small, { color: c.crit }]}>{error}</Text> : null}
    </View>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'ok' | 'error'; children: ReactNode }) {
  const c = usePalette();
  const bg = tone === 'ok' ? c.okSoft : tone === 'error' ? c.critSoft : c.accentSoft;
  const fg = tone === 'ok' ? c.ok : tone === 'error' ? c.crit : c.ink;
  return (
    <View style={[styles.notice, { backgroundColor: bg }]} accessibilityLiveRegion="polite">
      <Text style={[type.small, { color: fg }]}>{children}</Text>
    </View>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  const c = usePalette();
  return (
    <View style={[styles.empty, { borderColor: c.line }]}>
      <Text style={[type.h2, { color: c.ink, textAlign: 'center' }]}>{title}</Text>
      {children ? <Text style={[type.body, { color: c.muted, textAlign: 'center' }]}>{children}</Text> : null}
    </View>
  );
}

export function Loading() {
  const c = usePalette();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.accent} />
    </View>
  );
}

export function PointsBadge({ points }: { points: number }) {
  const c = usePalette();
  return (
    <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
      <Text style={{ color: c.accent, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{points} pt</Text>
    </View>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  screenContent: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  button: { minHeight: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg, borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, fontSize: 16 },
  notice: { borderRadius: radius.md, padding: space.md },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: space.xl, gap: space.sm, alignItems: 'center' },
  badge: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs, alignSelf: 'flex-start' },
});
