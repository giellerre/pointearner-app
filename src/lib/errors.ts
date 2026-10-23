const MESSAGES: Record<string, string> = {
  NON_AUTENTICATO: 'Accedi di nuovo per continuare.',
  NON_AUTORIZZATO: 'Il tuo account non è abilitato a gestire questa attività.',
  QR_SCADUTO: 'Il QR è scaduto. Chiedi al consumatore di riaprire la tessera.',
  GIA_ASSEGNATO: 'Punti già assegnati a questo consumatore negli ultimi 5 minuti.',
  AUTOASSEGNAZIONE: 'Non puoi assegnare punti alla tua stessa tessera.',
  ABBONAMENTO_NON_ATTIVO: 'Il periodo di prova è finito. Attiva l’abbonamento per assegnare punti.',
  PUNTI_NON_VALIDI: 'Inserisci un numero di punti tra 1 e 1000.',
  PREMIO_NON_DISPONIBILE: 'Questo premio non è più disponibile.',
  PUNTI_INSUFFICIENTI: 'Il consumatore non dispone di punti sufficienti per questo premio.',
  MOVIMENTO_NON_TROVATO: 'Movimento non trovato.',
  GIA_STORNO: 'Uno storno non si può stornare.',
  GIA_STORNATO: 'Questo movimento è già stato stornato.',
  TROPPO_VECCHIO: 'Si possono stornare solo i movimenti delle ultime 24 ore.',
  SALDO_NEGATIVO: 'I punti di questa visita sono già stati spesi: lo storno non è possibile.',
  TROPPI_NEGOZI: 'Ogni account può gestire al massimo 5 attività.',
  UTENTE_NON_TROVATO: 'Nessun account con questa email. Il collaboratore deve prima accedere all’app una volta.',
  GIA_COLLABORATORE: 'Questa persona è già registrata come collaboratore dell’attività.',
  TROPPI_COLLABORATORI: 'Ogni attività può avere al massimo 20 collaboratori.',
  TITOLARE_NON_RIMOVIBILE: 'Il titolare non si può rimuovere.',
};

export function friendlyError(error: unknown): string {
  const message =
    typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : String(error);
  const code = Object.keys(MESSAGES).find((k) => message.includes(k));
  if (code) return MESSAGES[code];
  if (/network|fetch/i.test(message)) return 'Connessione assente. Controlla la rete e riprova.';
  if (/token has expired|invalid.*otp|otp.*invalid/i.test(message)) return 'Codice non valido o scaduto. Richiedine uno nuovo.';
  if (/rate limit|too many/i.test(message)) return 'Troppi tentativi. Aspetta un minuto e riprova.';
  return 'Qualcosa non ha funzionato. Riprova tra poco.';
}
