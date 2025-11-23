import React from 'react';
import './App.css'; // Usa lo stesso stile del resto del sito
import { X } from 'lucide-react';

const PrivacyPage = ({ onClose }) => {
    return (
        <div className="glass-container" style={{ maxWidth: '800px', textAlign: 'left', maxHeight: '80vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Privacy Policy</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={24} color="#333" />
                </button>
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#444' }}>
                <p><strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString()}</p>

                <h3>1. Introduzione</h3>
                <p>
                    Benvenuto su <strong>[https://pdf-sito.vercel.app/]</strong> (di seguito "il Sito").
                    La tua privacy è fondamentale per noi. Questa Privacy Policy spiega come gestiamo le tue informazioni
                    quando utilizzi il nostro strumento di modifica PDF.
                </p>

                <h3>2. I Tuoi File e Dati (Elaborazione Locale)</h3>
                <p>
                    <strong>Punto fondamentale:</strong> I file PDF che carichi su questo sito <strong>NON vengono inviati ai nostri server</strong>.
                    <br /><br />
                    Tutta l'elaborazione (unione, separazione, rotazione) avviene <strong>localmente nel tuo browser</strong>
                    utilizzando la tecnologia JavaScript. I tuoi documenti non lasciano mai il tuo dispositivo e noi non ne abbiamo mai accesso.
                    Una volta chiusa la pagina, i dati vengono cancellati dalla memoria del browser.
                </p>

                <h3>3. Dati che Raccogliamo Automaticamente</h3>
                <p>
                    Sebbene non raccogliamo i tuoi file, utilizziamo servizi di terze parti che potrebbero raccogliere dati tecnici:
                </p>
                <ul>
                    <li><strong>Log di Sistema:</strong> Il nostro provider di hosting (Vercel) potrebbe registrare il tuo indirizzo IP per fini di sicurezza.</li>
                    <li><strong>Cookie Pubblicitari:</strong> Utilizziamo Google AdSense per mostrare annunci pubblicitari.</li>
                </ul>

                <h3>4. Google AdSense e Cookie DoubleClick</h3>
                <p>
                    Questo sito utilizza Google AdSense per mostrare annunci.
                </p>
                <ul>
                    <li>Google, come fornitore di terze parti, utilizza i cookie per pubblicare annunci sul nostro sito.</li>
                    <li>L'uso del cookie DART consente a Google di pubblicare annunci per i nostri utenti in base alla loro visita al nostro sito e ad altri siti su Internet.</li>
                    <li>Gli utenti possono scegliere di non utilizzare il cookie DART visitando la Privacy Policy della rete di annunci e contenuti di Google.</li>
                </ul>

                <h3>5. I Tuoi Diritti (GDPR)</h3>
                <p>
                    In conformità con il GDPR, hai il diritto di accedere, rettificare o cancellare i tuoi dati personali.
                    Tuttavia, poiché non memorizziamo i tuoi file né i tuoi dati personali sui nostri server, non abbiamo nulla da cancellare.
                    Per i dati gestiti da Google AdSense, fai riferimento alla privacy policy di Google.
                </p>

                <h3>6. Contatti</h3>
                <p>
                    Per qualsiasi domanda su questa Privacy Policy, puoi contattarci a: <br />
                    <strong>Email:</strong> [danielrot190607@gmail.com]
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;