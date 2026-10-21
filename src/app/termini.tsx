import { LegalPage } from '@/ui/LegalPage';

const CONTACT = 'giuseppeluigiricci@gmail.com';

export default function Termini() {
  return (
    <LegalPage
      title="Termini d'uso"
      updated="21 ottobre 2026"
      intro="Questi termini regolano l'uso gratuito di PointEarner da parte dei clienti dei negozi. Il servizio è fornito da Giuseppe Luigi Ricci, Roma (Italia). I negozi che usano PointEarner per il proprio programma fedeltà firmano un contratto separato."
      sections={[
        {
          title: 'Il servizio',
          paragraphs: [
            'PointEarner ti permette di avere la tessera fedeltà dei negozi che lo usano e di accumulare punti mostrando in cassa un codice QR personale. Per te il servizio è gratuito.',
          ],
        },
        {
          title: 'Account',
          paragraphs: [
            "Serve un'email valida. Tieni riservato l'accesso alla tua email, perché il codice per entrare arriva lì. Puoi eliminare l'account in qualsiasi momento dall'app, in Profilo → Elimina account, o dalla pagina pointearner.expo.app/elimina-account.",
          ],
        },
        {
          title: 'Punti e premi',
          paragraphs: [
            'I punti valgono solo nel negozio dove sono stati assegnati. Non hanno valore in denaro, non si convertono in contanti e non si trasferiscono ad altri utenti o negozi.',
            'Punti per visita, premi e loro disponibilità li decide ciascun negozio, che ne risponde. Il negozio è il promotore del proprio programma fedeltà.',
            "I punti si perdono se elimini l'account, se la tessera resta senza movimenti per 24 mesi, o se il negozio smette di usare PointEarner. Nell'ultimo caso cerchiamo di avvisarti nell'app prima della chiusura.",
          ],
        },
        {
          title: 'Uso corretto',
          paragraphs: [
            "Non è consentito ottenere punti senza un acquisto reale, usare il QR di altre persone o tentare di aggirare i controlli dell'app. In questi casi possiamo annullare i punti ottenuti in modo scorretto. Se la violazione è grave o ripetuta possiamo sospendere l'account: ti avvisiamo via email indicando il motivo, e puoi rispondere entro 15 giorni prima che la sospensione diventi definitiva.",
          ],
        },
        {
          title: 'Disponibilità e responsabilità',
          paragraphs: [
            "Facciamo il possibile perché il servizio funzioni sempre, ma possono esserci interruzioni per manutenzione o cause esterne. Rispondiamo dei danni causati da nostro dolo o colpa grave e in ogni caso nei limiti previsti dalla legge. Restano salvi tutti i diritti che il Codice del consumo riconosce ai consumatori.",
          ],
        },
        {
          title: 'Modifiche',
          paragraphs: [
            "Ti avvisiamo nell'app almeno 30 giorni prima che una modifica a questi termini entri in vigore. Se non sei d'accordo puoi eliminare l'account senza costi prima di quella data.",
          ],
        },
        {
          title: 'Legge applicabile e controversie',
          paragraphs: [
            'Si applica la legge italiana. Per le controversie è competente il foro del luogo di residenza o domicilio del consumatore. Puoi anche ricorrere agli organismi di risoluzione alternativa delle controversie previsti dal Codice del consumo.',
          ],
        },
        {
          title: 'Contatti',
          paragraphs: [`Per assistenza e segnalazioni: ${CONTACT}.`],
        },
      ]}
    />
  );
}
