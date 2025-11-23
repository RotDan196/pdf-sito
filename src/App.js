import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import download from 'downloadjs';
import { Upload, FileText, Layers, Scissors, RotateCw, Trash2, X, Info } from 'lucide-react';
import './App.css';
import InfoSection from './InfoSection';
import PrivacyPage from './PrivacyPage';

// Componente per l'Annuncio Pubblicitario
const AdBanner = () => (
  <div className="glass-card ad-banner">
    <div className="ad-content">
      <small>Spazio Pubblicitario</small>
      {/* 
         QUI ANDRÀ IL TUO CODICE GOOGLE ADSENSE 
         <ins className="adsbygoogle" ... ></ins>
      */}
      <div className="fake-ad">Google Ads Banner (728x90)</div>
    </div>
  </div>
);

function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Gestione File
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setFiles([...files, ...pdfFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const clearAll = () => setFiles([]);

  // --- FUNZIONI CORE ---
  const mergePDFs = async () => {
    if (files.length < 2) return alert("Serve almeno un'altra pagina per unire!");
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, "merged-doc.pdf", "application/pdf");
    } catch (err) { alert("Errore! File corrotto o protetto."); }
    setIsProcessing(false);
  };

  const splitPDF = async () => {
    if (files.length === 0) return alert("Nessun file selezionato!");
    setIsProcessing(true);
    try {
      const file = files[0];
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const newPdf = await PDFDocument.create();
      const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
      newPdf.addPage(firstPage);
      const pdfBytes = await newPdf.save();
      download(pdfBytes, "page-1-extracted.pdf", "application/pdf");
    } catch (err) { alert("Errore estrazione."); }
    setIsProcessing(false);
  };

  const rotatePDF = async () => {
    if (files.length === 0) return alert("Nessun file selezionato!");
    setIsProcessing(true);
    try {
      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      pages.forEach(page => page.setRotation(degrees(page.getRotation().angle + 90)));
      const pdfBytes = await pdfDoc.save();
      download(pdfBytes, "rotated.pdf", "application/pdf");
    } catch (err) { alert("Errore rotazione."); }
    setIsProcessing(false);
  };

  return (
    <div className="main-wrapper">
      <div className="liquid-bg"></div>
      <div className="liquid-bg-2"></div>

      {/* SE showPrivacy è VERO, mostra la pagina Privacy */}
      {showPrivacy ? (
        <PrivacyPage onClose={() => setShowPrivacy(false)} />
      ) : (
        /* ALTRIMENTI mostra il Tool normale */
        <div className="glass-container">
          <header>
            <div className="logo-badge">PDF PRO</div>
            <h1>Gestione Documenti</h1>
            <p>Potente. Veloce. Sicuro. Elaborazione Locale.</p>
          </header>

          <div className="upload-section">
            <label htmlFor="upload" className="glass-button upload-btn">
              <Upload size={24} />
              <span>Seleziona File PDF</span>
            </label>
            <input id="upload" type="file" multiple accept="application/pdf" onChange={handleFileChange} />
          </div>

          {files.length > 0 && (
            <div className="workspace fade-in">
              <div className="toolbar">
                <span>{files.length} Documenti caricati</span>
                <button onClick={clearAll} className="clear-btn">Pulisci tutto</button>
              </div>

              <div className="file-list">
                {files.map((file, i) => (
                  <div key={i} className="file-item">
                    <div className="file-icon"><FileText size={20} /></div>
                    <span className="filename">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="delete-btn"><X size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="actions-grid">
                <button onClick={mergePDFs} disabled={isProcessing} className="action-card">
                  <div className="icon-box"><Layers size={24} /></div>
                  <span>Unisci</span>
                </button>
                <button onClick={splitPDF} disabled={isProcessing} className="action-card">
                  <div className="icon-box"><Scissors size={24} /></div>
                  <span>Estrai Pag. 1</span>
                </button>
                <button onClick={rotatePDF} disabled={isProcessing} className="action-card">
                  <div className="icon-box"><RotateCw size={24} /></div>
                  <span>Ruota 90°</span>
                </button>
              </div>
            </div>
          )}

          {/* Sezione info per Google */}
          <InfoSection />

          {/* Banner Pubblicitario */}
          <AdBanner />

        </div>
      )}

      {/* Footer che attiva la Privacy */}
      <footer className="glass-footer">
        <div>
          <Info size={14} /> La privacy prima di tutto: i file non lasciano mai il tuo dispositivo.
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.7rem' }}>
          {/* Al click, imposta showPrivacy su true */}
          <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: '#86868b', cursor: 'pointer', textDecoration: 'underline' }}>
            Privacy Policy
          </button>
          {' | '}
          <span>Termini di Servizio</span>
        </div>
      </footer>
    </div>
  );
}

export default App;