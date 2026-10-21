# PointEarner — app iOS e Android

App di fidelizzazione per il commercio di quartiere. Un solo codice per iOS e Android (Expo SDK 57, React Native 0.86), database e login su Supabase.

**Modello:** mono-merchant. I punti valgono solo nel negozio dove sono stati guadagnati.

**Un'app, due modalità**

| Modalità | Chi | Cosa fa |
|---|---|---|
| Cliente | Chiunque si registri | Vede le sue tessere, mostra il QR personale in cassa, controlla premi e movimenti |
| Negozio — titolare | Chi registra un'attività | Scansiona il QR del cliente con la fotocamera, assegna punti, riscatta premi, gestisce premi e collaboratori, vede le statistiche della settimana, storna errori |
| Negozio — collaboratore | Chi viene aggiunto dal titolare (*Profilo → Collaboratori*) | Scansiona, assegna punti, riscatta premi, vede le attività |

La modalità negozio si attiva da *Profilo* dopo aver registrato l'attività.

---

## 1. Cosa serve

| Account | Costo | Note |
|---|---|---|
| Expo (expo.dev) | Gratis per iniziare | Compila le app nel cloud: niente Mac né Android Studio |
| Supabase (supabase.com) | Gratis per il pilota | Database, login via email |
| Apple Developer Program | Già attivo | Lo stesso account del rifiuto di maggio |
| Google Play Console | Quota una tantum | Verificare lo stato dell'account |
| Node.js 20 o superiore | Gratis | Sul computer da cui lanci i comandi |

---

## 2. Database (Supabase) — 15 minuti

1. Crea un progetto su supabase.com. Regione: **Central EU (Frankfurt)**, per tenere i dati in UE.
2. *SQL Editor* → incolla tutto il file `supabase/migrations/0001_init.sql` → *Run*. Poi, in una nuova query, `supabase/migrations/0002_staff.sql` → *Run*.
3. *Authentication → Sign In / Providers → Email*: attivo. Lascia attiva la conferma email.
4. *Authentication → Emails → Magic Link*: sostituisci il testo con un'email che contenga il codice, per esempio:
   ```html
   <h2>Il tuo codice PointEarner</h2>
   <p>Inserisci questo codice nell'app: <strong>{{ .Token }}</strong></p>
   <p>Scade tra un'ora. Se non hai chiesto tu l'accesso, ignora questa email.</p>
   ```
   Fai lo stesso nel modello *Confirm signup*. Senza `{{ .Token }}` l'utente riceve un link invece del codice e non riesce ad accedere.
5. *Authentication → Emails → SMTP Settings*: collega un servizio email (Brevo, Resend, Postmark). Il servizio email incluso in Supabase ha limiti orari molto bassi, adatti solo ai test.
6. *Project Settings → API*: copia **Project URL** e **Publishable key**.
7. Account per la revisione degli store: *Authentication → Users → Add user → Create new user*, con email e password, e spunta *Auto Confirm User*. Apple e Google non possono ricevere il codice via email: entrano con *Accedi con password*.

---

## 3. Configurazione locale

```bash
npm install
cp .env.example .env.local     # poi compila i valori
```

`.env.local` contiene URL e chiave pubblica Supabase, i link a privacy e termini, l'email di assistenza. **Non inserire mai** la password del database o la chiave segreta (*secret / service_role*).

**Expo Go non serve su iPhone.** L'Expo Go dell'App Store supporta solo SDK 54 e non apre questo progetto (SDK 57). Su iPhone l'app si installa con TestFlight (sezione 4).

**Lato cliente dal computer**, quando non c'è un secondo telefono:

```bash
npx expo start --web
```

Si apre il browser su `http://localhost:8081`. Accedi con un'email diversa da quella del negozio e apri *Il mio QR*: l'iPhone in modalità negozio lo scansiona dallo schermo del computer. Nel browser fotocamera, luminosità e vibrazione non servono e restano spente.

---

## 4. Build e pubblicazione

Una volta sola:

```bash
npx eas-cli@latest login
npx eas-cli@latest init                 # collega il progetto al tuo account Expo
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://….supabase.co" --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_…" --visibility plaintext
# ripeti per EXPO_PUBLIC_PRIVACY_URL, EXPO_PUBLIC_TERMS_URL, EXPO_PUBLIC_SUPPORT_EMAIL
# e per gli ambienti "preview" e "development"
```

### Android

```bash
npx eas-cli@latest build -p android --profile production
```

Su Play Console: crea l'app → carica il file `.aab` nel canale **Test interno** → compila *Sicurezza dei dati*, *Classificazione dei contenuti*, *Pubblico di destinazione*, link alla privacy. Gli account sviluppatore personali creati di recente devono passare da un **test chiuso** con un numero minimo di tester per un periodo minimo prima della produzione: verifica i numeri attuali nella guida di Play Console.

### iOS — dall'iPhone di prova a TestFlight (nessun Mac richiesto)

```bash
npx eas-cli@latest build -p ios --profile production --auto-submit
```

Cosa succede, in ordine:

1. EAS chiede il login Apple (con codice a due fattori) e crea da solo certificati e profili.
2. La build gira nel cloud Expo; al termine viene caricata su App Store Connect.
3. Al primo caricamento EAS crea su App Store Connect una **nuova app** con bundle ID `it.pointearner.app`, separata da quella bloccata. Se il nome *PointEarner* risulta già usato da un'altra app sullo Store, EAS lo segnala: si sceglie un nome visibile diverso (es. *PointEarner Fedeltà*) senza cambiare il bundle ID.
4. Apple elabora la build; compare in App Store Connect → *TestFlight* dopo un'attesa variabile, di solito sotto l'ora.

Poi, una volta sola:

5. App Store Connect → *TestFlight* → *Test interno* → crea il gruppo *Founder* → aggiungi te stesso (e gli altri founder, che devono essere utenti del team in *Utenti e accessi*).
6. Sull'iPhone installa **TestFlight** dall'App Store, apri l'invito ricevuto via email, installa PointEarner.

**Il test interno di TestFlight non passa da App Review.** Nessun invio, nessun rischio per l'account. Il test esterno e la pubblicazione sullo Store passano invece dalla revisione.

**Aggiornamenti:** ogni nuova versione si ripubblica con lo stesso comando; il numero di build sale da solo. TestFlight avvisa i tester.

### Prima prova incrociata (iPhone + computer)

| Dove | Account | Cosa fai |
|---|---|---|
| iPhone (TestFlight) | email A | Accedi → *Profilo → Registra il tuo negozio* → *Premi* → crea «Caffè omaggio» a 20 punti |
| Browser del computer (`npx expo start --web`) | email B | Accedi → *Il mio QR* |
| iPhone | email A | *Scansiona* → inquadra lo schermo del computer → *Assegna punti* |
| Browser | email B | *Tessere*: compare il negozio con 10 punti |
| (ripeti dopo 5 minuti) | | Al secondo passaggio il cliente arriva a 20 punti e l'iPhone mostra *Riscatta* |

Riuscito quando il saldo nel browser cambia dopo l'azione sull'iPhone.

---

## 5. Prima di inviare ad App Review (gate)

Il rifiuto di maggio (Guideline 5.6) dice che un nuovo invio con gli stessi problemi può costare l'account sviluppatore. Si invia **una volta sola**, quando tutto è vero:

- [ ] App usata per almeno 4 settimane da merchant e clienti reali tramite TestFlight e test Android
- [ ] Nessun testo segnaposto, nessuna schermata vuota senza spiegazione
- [ ] Privacy, termini e assistenza raggiungibili dall'app (*Profilo*)
- [ ] Cancellazione account funzionante (*Profilo → Elimina account*) — **già presente**
- [ ] Account di prova con password creato (sezione 2, punto 7), con un negozio registrato e due premi
- [ ] Screenshot presi dall'uso reale del pilota, non da dati inventati
- [ ] Testato su almeno 3 iPhone di generazioni diverse

**Note per la revisione (da incollare in App Store Connect):**

> PointEarner is a loyalty app for local shops in Italy. Customers show a personal QR code at checkout; the shop scans it with the in-app camera scanner and assigns points, which can be redeemed for rewards at that same shop.
>
> Demo account: [email] / [password] — use "Accedi con password" on the sign-in screen.
> The demo account owns a test shop. To see the shop side: Profilo → enable "Modalità negozio" → Scansiona.
> To test the full flow you need two devices, or scan the QR shown in the attached screenshot with the shop account.
> Account deletion: Profilo → Elimina account.

---

## 6. Come funziona la sicurezza dei punti

| Rischio | Contromisura |
|---|---|
| Foto del QR riusata | Il QR cambia ogni 2 minuti; dopo un riscatto il codice viene invalidato |
| Punti inventati dal telefono | L'app non scrive mai i punti: solo le funzioni sul server, che controllano chi chiama |
| Doppia scansione in cassa | Una sola assegnazione per cliente ogni 5 minuti nello stesso negozio |
| Titolare che si dà punti da solo | Bloccato |
| Errore di cassa | Il titolare storna dalle *Attività* entro 24 ore; lo storno è una nuova riga, il movimento originale resta |
| Riscatto con punti insufficienti o doppio | Verifica del saldo con blocco della riga durante il riscatto |
| Periodo di prova scaduto | Con abbonamento `PAST_DUE` non si assegnano punti; i premi restano riscattabili |

Ogni movimento è una riga del registro `ledger` (EARN, REDEEM, REVERSAL). Nessuna riga si modifica o si cancella dall'app.

---

## 7. Cosa non c'è ancora

| Funzione | Stato | Come si fa oggi |
|---|---|---|
| Pagamento abbonamento | Stato `TRIAL / ACTIVE / PAST_DUE` già nel database | Durante il pilota tutti i negozi hanno `pilot = true` e non pagano |
| Carta in Apple/Google Wallet | Non incluso | Richiede un certificato *Pass Type ID* Apple a nome tuo |
| Notifiche push | Non incluso | Da aggiungere dopo il pilota |
| Referral merchant→merchant | Non incluso | Da tracciare a mano nella cockpit durante il pilota |

---

## 8. Decisione da prendere prima del primo caricamento

Il **bundle ID** `it.pointearner.app` (in `app.json`) non si può cambiare dopo il primo caricamento sugli store. Se il nome del prodotto cambia (decisione D7), va cambiato **prima** del primo `eas build`.

---

## Struttura

```
src/app/                 schermate (Expo Router)
  sign-in.tsx            accesso con codice email o password
  (app)/(tabs)/          Tessere, Il mio QR · Scansiona, Premi, Attività · Profilo
  (app)/card/[id].tsx    dettaglio tessera cliente
  (app)/customer.tsx     cliente scansionato: assegna punti, riscatta
  (app)/merchant-new.tsx registrazione negozio
src/lib/                 Supabase, sessione, errori in italiano
src/ui/                  tema chiaro/scuro e componenti
supabase/migrations/     schema del database
```

Comandi utili: `npm run typecheck` · `npm run lint` · `npx expo-doctor`
