import React from 'react';
import { X, ShieldCheck, Lock, EyeOff } from 'lucide-react';
import './App.css';

const PrivacyPage = ({ onClose }) => {
    // Chiudi se clicchi fuori dal box bianco
    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-overlay') onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}><X size={20} /></button>

                <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '10px' }}>Privacy & Sicurezza</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>La tua fiducia è la nostra priorità. Ecco come gestiamo i tuoi dati.</p>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ background: '#F9F9FB', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                        <Lock color="#007AFF" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>Crittografia Client-Side</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                I tuoi file <strong>non lasciano mai il tuo dispositivo</strong>.
                                Tutto il processo avviene nel browser. Non abbiamo server che vedono i tuoi PDF.
                            </p>
                        </div>
                    </div>

                    <div style={{ background: '#F9F9FB', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                        <EyeOff color="#007AFF" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>Nessuna raccolta dati</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                Non conserviamo copie dei tuoi documenti. Una volta chiusa la pagina, tutto svanisce.
                            </p>
                        </div>
                    </div>

                    <div style={{ background: '#F9F9FB', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                        <ShieldCheck color="#007AFF" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>Servizi Terzi</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                Usiamo Firebase (Google) solo per il login e per contare quanti file elabori (statistica anonima).
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#999', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    Questo sito è conforme al GDPR. Per domande legali: [tua-email@esempio.com]
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;