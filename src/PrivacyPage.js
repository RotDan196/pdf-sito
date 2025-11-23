import React from 'react';
import { X } from 'lucide-react';

const PrivacyPage = ({ onClose }) => {
    return (
        <div className="glass-container" style={{ textAlign: 'left', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>

            {/* Header del Modale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Privacy & Termini</h2>
                <button onClick={onClose} style={{ background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={20} color="#333" />
                </button>
            </div>

            {/* Contenuto Testuale */}
            <div style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#333' }}>
                <p><strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString()}</p>

                <h3>1. Elaborazione Locale (Client-Side)</h3>
                <p>
                    A differenza di altri servizi, <strong>[Tuo Sito]</strong> non carica i tuoi file su nessun server cloud.
                    Tutto il processo di modifica (unione, divisione, rotazione) avviene all'interno del tuo browser utilizzando JavaScript.
                    Ciò significa che i tuoi documenti sensibili non lasciano mai il tuo computer.
                </p>

                <h3>2. Raccolta Dati</h3>
                <p>
                    Non raccogliamo dati personali o file. Tuttavia, utilizziamo servizi terzi per il funzionamento del sito:
                </p>
                <ul style={{ paddingLeft: '20px', color: '#555' }}>
                    <li><strong>Hosting (Vercel):</strong> Può raccogliere log anonimi di accesso (IP) per sicurezza.</li>
                    <li><strong>Google AdSense:</strong> Utilizza i cookie per mostrare annunci pertinenti.</li>
                </ul>

                <h3>3. Cookie DoubleClick</h3>
                <p>
                    Google utilizza i cookie per migliorare la pubblicità. Gli utenti possono scegliere di non utilizzare il cookie DART visitando le impostazioni degli annunci Google.
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />

                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Per contatti o rimozione dati (anche se non ne conserviamo): <strong>danielrot190607@gmail.com</strong>
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;