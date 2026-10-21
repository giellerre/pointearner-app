import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Membership } from './types';

type Mode = 'customer' | 'merchant';

type SessionState = {
  ready: boolean;
  session: Session | null;
  displayName: string | null;
  memberships: Membership[];
  activeMerchantId: string | null;
  mode: Mode;
  setMode: (mode: Mode) => void;
  setActiveMerchant: (id: string) => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

const PREFS_KEY = 'pe.prefs';
type Prefs = { mode?: Mode; activeMerchantId?: string };

function readPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Prefs;
  } catch {
    return {};
  }
}
function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // preferenza locale: se non si salva, l'app riparte in modalità cliente
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) {
      setMemberships([]);
      setDisplayName(null);
      return;
    }
    const [profile, staff] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
      supabase
        .from('merchant_staff')
        .select('merchant_id, role, merchants(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
    ]);
    setDisplayName(profile.data?.display_name ?? null);
    setMemberships((staff.data as unknown as Membership[] | null) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await refresh();
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (!next) {
        setMemberships([]);
        setDisplayName(null);
        setPrefs({});
        writePrefs({});
      } else if (event === 'SIGNED_IN') {
        // Supabase sconsiglia chiamate al database dentro questo callback: si rimanda al ciclo successivo
        setTimeout(() => {
          refresh();
        }, 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const activeMerchantId =
    memberships.find((m) => m.merchant_id === prefs.activeMerchantId)?.merchant_id ?? memberships[0]?.merchant_id ?? null;
  const mode: Mode = prefs.mode === 'merchant' && activeMerchantId ? 'merchant' : 'customer';

  const value = useMemo<SessionState>(
    () => ({
      ready,
      session,
      displayName,
      memberships,
      activeMerchantId,
      mode,
      refresh,
      setMode: (next) => {
        const p = { ...prefs, mode: next };
        setPrefs(p);
        writePrefs(p);
      },
      setActiveMerchant: (id) => {
        const p = { ...prefs, activeMerchantId: id };
        setPrefs(p);
        writePrefs(p);
      },
    }),
    [ready, session, displayName, memberships, activeMerchantId, mode, refresh, prefs],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession fuori da SessionProvider');
  return ctx;
}

export function useActiveMerchant() {
  const { memberships, activeMerchantId } = useSession();
  return memberships.find((m) => m.merchant_id === activeMerchantId) ?? null;
}
