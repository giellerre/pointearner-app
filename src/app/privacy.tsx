import { LegalPage } from '@/ui/LegalPage';

const CONTACT = 'giuseppeluigiricci@gmail.com';

export default function Privacy() {
  return (
    <LegalPage
      title="Informativa privacy"
      updated="21 ottobre 2026"
      intro="Questa informativa spiega quali dati personali tratta PointEarner, perché e per quanto tempo, ai sensi del Regolamento (UE) 2016/679 (GDPR)."
      sections={[
        {
          title: 'Titolare del trattamento',
          paragraphs: [`Giuseppe Luigi Ricci, Roma (Italia). Contatto per la privacy: ${CONTACT}.`],
        },
        {
          title: 'Quali dati trattiamo',
          bullets: [
            "Email, per creare l'account e inviarti il codice di accesso.",
            'Nome che scegli di mostrare ai negozi, facoltativo.',
            'Per ogni negozio dove usi la tessera: visite registrate, punti assegnati, premi riscattati, con data e ora.',
            'Codici QR temporanei, validi due minuti e poi cancellati.',
            "Per chi registra un negozio: nome, categoria e indirizzo dell'attività e collaboratori aggiunti.",
          ],
          paragraphs: [
            "Non trattiamo posizione, contatti o audio. La fotocamera serve solo a leggere i codici QR in cassa e non salva immagini. Non usiamo strumenti di pubblicità, profilazione o tracciamento.",
          ],
        },
        {
          title: 'Perché e su quale base',
          bullets: [
            'Fornirti il servizio (account, tessere, punti, premi): esecuzione del contratto, art. 6.1.b GDPR.',
            'Prevenire frodi e abusi sui punti: legittimo interesse, art. 6.1.f GDPR.',
            'Rispondere alle richieste di assistenza: esecuzione del contratto, art. 6.1.b GDPR.',
          ],
        },
        {
          title: 'Chi vede i tuoi dati',
          paragraphs: [
            'Il negozio a cui mostri il QR vede il nome che hai scelto, il tuo saldo e le tue visite presso quel negozio, non presso altri.',
            "I dati sono conservati su server di Supabase nell'Unione europea (Irlanda). Le email di accesso sono inviate tramite Brevo. Questi fornitori trattano i dati per conto del titolare come responsabili del trattamento.",
          ],
        },
        {
          title: 'Per quanto tempo',
          paragraphs: [
            "Conserviamo i dati finché l'account esiste. Se elimini l'account cancelliamo subito account, tessere, punti e storico. I codici QR durano due minuti.",
          ],
        },
        {
          title: 'I tuoi diritti',
          paragraphs: [
            `Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione (artt. 15–22 GDPR) scrivendo a ${CONTACT}.`,
            "Puoi eliminare l'account in qualsiasi momento dall'app, in Profilo → Elimina account, oppure chiederlo via email senza reinstallare l'app.",
            'Puoi proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).',
          ],
        },
        {
          title: 'Età',
          paragraphs: ['Il servizio è rivolto a persone maggiorenni.'],
        },
        {
          title: 'Modifiche',
          paragraphs: ["Le modifiche a questa informativa sono pubblicate su questa pagina e comunicate nell'app."],
        },
      ]}
    />
  );
}
