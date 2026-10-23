import { LegalPage } from '@/ui/LegalPage';

const CONTACT = 'giuseppeluigiricci@gmail.com';

export default function Privacy() {
  return (
    <LegalPage
      title="Informativa privacy"
      updated="21 ottobre 2026"
      intro="Questa informativa spiega quali dati personali tratta PointEarner, chi ne è responsabile, perché e per quanto tempo, ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR). PointEarner è uno strumento che gli esercenti usano per gestire il proprio programma fedeltà: per questo i ruoli sono due, descritti qui sotto."
      sections={[
        {
          title: 'Chi tratta i tuoi dati',
          bullets: [
            `Account PointEarner. Per l'account (email, nome che scegli, accesso all'app) il titolare del trattamento è Giuseppe Luigi Ricci, Roma (Italia), che gestisce PointEarner. Contatto: ${CONTACT}.`,
            "Tessera fedeltà di ciascun esercente. Per i dati della tessera presso un esercente (visite, punti, premi) il titolare è l’esercente che gestisce quel programma fedeltà. PointEarner tratta questi dati per conto dell’esercente, come responsabile del trattamento (art. 28 GDPR), sulla base di un accordo scritto con l’esercente.",
            "Collaboratori di un esercente. Per i dati dei collaboratori che un esercente aggiunge all'app il titolare è l’esercente; PointEarner è responsabile del trattamento.",
          ],
          paragraphs: [
            "Nome e indirizzo di ogni esercente sono visibili nell'app, sulla tessera di quell’esercente. Puoi esercitare i tuoi diritti sia nei confronti dell’esercente sia scrivendo a PointEarner: inoltriamo noi la richiesta all’esercente quando serve.",
          ],
        },
        {
          title: 'Quali dati trattiamo',
          bullets: [
            "Email, per creare l'account e inviarti il codice di accesso.",
            'Nome che scegli di mostrare agli esercenti, facoltativo.',
            'Per ogni esercente presso cui usi la tessera: visite registrate, punti assegnati, premi riscattati, con data e ora, e il collaboratore che ha registrato il movimento.',
            'Codici QR temporanei, validi due minuti e poi cancellati.',
            "Per chi registra un’attività: nome, categoria e indirizzo dell’attività, email dei collaboratori aggiunti.",
          ],
          paragraphs: [
            'Non trattiamo posizione, contatti o audio. La fotocamera serve solo a leggere i codici QR in cassa e non salva immagini. Non usiamo strumenti di pubblicità, profilazione o tracciamento, né analisi statistiche di terzi.',
            "Nell'app e nella versione web usiamo solo la memoria locale del dispositivo per tenerti collegato. È uno strumento tecnico necessario al servizio: non usiamo cookie di profilazione né cookie di terzi.",
          ],
        },
        {
          title: 'Perché e su quale base',
          bullets: [
            "Gestire l'account e la tessera di ciascun esercente (punti, premi, storico): esecuzione del contratto, art. 6.1.b GDPR. Non serve il tuo consenso e non lo chiediamo.",
            'Prevenire frodi e abusi sui punti (doppi accrediti, uso del QR di altri): legittimo interesse dell’esercente e di PointEarner, art. 6.1.f GDPR.',
            'Rispondere alle richieste di assistenza: esecuzione del contratto, art. 6.1.b GDPR.',
          ],
          paragraphs: [
            "Non usiamo i dati della tessera per profilazione o marketing. Se in futuro un esercente volesse inviarti promozioni, ti chiederemo un consenso separato e facoltativo: l'uso della tessera non dipenderà da quel consenso.",
          ],
        },
        {
          title: 'Chi vede i tuoi dati',
          paragraphs: [
            'L’esercente a cui mostri il QR vede il nome che hai scelto, il tuo saldo e le tue visite presso quell’esercente, non presso altri esercenti.',
            "I dati sono conservati su server di Supabase nell'Unione europea (Irlanda). Le email con il codice di accesso sono inviate tramite Brevo (Francia). Questi fornitori agiscono come sub-responsabili del trattamento. I dati non sono trasferiti fuori dallo Spazio economico europeo.",
            'Non vendiamo né cediamo i dati a terzi.',
          ],
        },
        {
          title: 'Per quanto tempo',
          bullets: [
            'Tessera di un esercente: finché la usi. Se una tessera resta senza movimenti per 24 mesi, la cancelliamo insieme al suo storico e ai punti.',
            "Account: finché lo tieni. Se non accedi per 24 mesi e non hai tessere attive né attività registrate, cancelliamo l'account.",
            "Se elimini l'account cancelliamo subito account, tessere, punti e storico.",
            'Se un esercente smette di usare PointEarner, le tessere di quell’esercente vengono cancellate entro 30 giorni.',
            'Codici QR: due minuti.',
          ],
        },
        {
          title: 'I tuoi diritti',
          paragraphs: [
            `Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione (artt. 15–22 GDPR) scrivendo a ${CONTACT}. Rispondiamo entro 30 giorni.`,
            "Puoi eliminare l'account in qualsiasi momento dall'app, in Profilo → Elimina account, oppure dalla pagina web pointearner.expo.app/elimina-account, senza reinstallare l'app.",
            'Puoi proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).',
          ],
        },
        {
          title: 'Sicurezza',
          paragraphs: [
            "Accedi con un codice monouso via email, senza password. I codici QR scadono dopo due minuti e valgono una volta sola. Ogni esercente vede solo le proprie tessere. In caso di violazione dei dati avvisiamo il Garante entro 72 ore e, se il rischio è alto, anche te.",
          ],
        },
        {
          title: 'Età',
          paragraphs: ['Il servizio è rivolto a persone maggiorenni.'],
        },
        {
          title: 'Modifiche',
          paragraphs: [
            "Le modifiche a questa informativa sono pubblicate su questa pagina con la nuova data e, se sostanziali, comunicate nell'app.",
          ],
        },
      ]}
    />
  );
}
