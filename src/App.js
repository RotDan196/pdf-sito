import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import download from 'downloadjs';
import { auth, loginWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import {
  Upload, FileText, Layers, Scissors, RotateCw, Image as ImageIcon,
  Trash2, LogOut, User, Lock, Eraser, Hash, FileCheck
} from 'lucide-react';
import './App.css';
import InfoSection from './InfoSection';
import PrivacyPage from './PrivacyPage';

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- LOGICA TIPI DI FILE ---
  const allPDFs = files.length > 0 && files.every(f => f.type === 'application/pdf');
  const allImages = files.length > 0 && files.every(f => f.type.startsWith('image/'));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    // Accetta solo PDF e Immagini
    const valid = selected.filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    setFiles([...files, ...valid]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const updateStats = async () => {
    if (user) {
      try { await updateDoc(doc(db, "users", user.uid), { filesProcessed: increment(1) }); }
      catch (e) { console.log("Stat update error", e); }
    }
  };

  // --- FUNZIONI PDF ---

  const mergePDFs = async () => {
    if (files.length < 2) return alert("Servono almeno 2 PDF per unire.");
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const saved = await mergedPdf.save();
      download(saved, "unito.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore unione: file forse protetti."); }
    setIsProcessing(false);
  };

  const splitPDF = async () => {
    setIsProcessing(true);
    try {
      // Estrae solo la prima pagina del primo file
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [0]);
      newPdf.addPage(page);
      download(await newPdf.save(), "pagina-estratta.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore estrazione."); }
    setIsProcessing(false);
  };

  const rotatePDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      pdf.getPages().forEach(p => p.setRotation(degrees(p.getRotation().angle + 90)));
      download(await pdf.save(), "ruotato.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore rotazione."); }
    setIsProcessing(false);
  };

  const cleanMetadata = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('PDF Pro Tool');
      pdf.setCreator('PDF Pro Tool');
      download(await pdf.save(), "clean-metadata.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore pulizia."); }
    setIsProcessing(false);
  }

  const addPageNumbers = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();

      pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx + 1} / ${pages.length}`, {
          x: width - 50,
          y: 20,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      });

      download(await pdf.save(), "numerato.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore numerazione."); }
    setIsProcessing(false);
  }

  // --- FUNZIONI IMMAGINI ---

  const imagesToPDF = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(bytes);
        else if (file.type === 'image/png') image = await pdfDoc.embedPng(bytes);
        else continue;

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      download(await pdfDoc.save(), "immagini-convertite.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore conversione."); }
    setIsProcessing(false);
  };

  return (
    <div className="main-wrapper">
      <div className="liquid-bg"></div>
      <div className="liquid-bg-2"></div>

      {showPrivacy && <PrivacyPage onClose={() => setShowPrivacy(false)} />}

      <nav className="glass-nav">
        <div className="logo">PDF PRO</div>
        {user ? (
          <div className="user-menu">
            <img src={user.photoURL} alt="User" className="avatar" />
            <button onClick={logout} className="logout-btn"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={loginWithGoogle} className="login-btn"><User size={16} /> Accedi</button>
        )}
      </nav>

      <div className="glass-container">
        <header>
          <h1>{user ? `Ciao, ${user.displayName.split(' ')[0]}!` : "Tutti i tuoi PDF."}</h1>
          <p className="subtitle">{user ? "Ecco i tuoi strumenti professionali." : "Semplice. Veloce. Privato."}</p>
        </header>

        {files.length === 0 ? (
          <div className="upload-section">
            <label htmlFor="upload" className="glass-button">
              <Upload size={24} /> <span>Carica File</span>
            </label>
            <input id="upload" type="file" multiple accept="application/pdf, image/png, image/jpeg" onChange={handleFileChange} />
            <p style={{ fontSize: '0.85rem', color: '#888' }}>Supportiamo PDF, JPG e PNG</p>
          </div>
        ) : (
          <div className="workspace fade-in">
            <div className="toolbar">
              <span className="status-badge">
                {files.length} {files.length === 1 ? 'File' : 'File'} {allPDFs ? '(PDF)' : allImages ? '(IMG)' : '(Misti)'}
              </span>
              <div>
                <label htmlFor="add-more" className="add-btn">+ Aggiungi</label>
                <input id="add-more" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                <button onClick={() => setFiles([])} className="clear-btn">Svuota</button>
              </div>
            </div>

            <div className="file-list">
              {files.map((file, i) => (
                <div key={i} className="file-item">
                  <div style={{ marginRight: '10px', color: '#007AFF' }}>
                    {file.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <span className="filename">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="delete-btn"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            {/* --- SEZIONE STRUMENTI PDF --- */}
            {allPDFs && (
              <div className="functions-wrapper">
                <span className="section-label">Strumenti PDF</span>
                <div className="actions-grid">
                  <button onClick={mergePDFs} disabled={isProcessing || files.length < 2} className="action-card">
                    <div className="icon-box"><Layers /></div>
                    <div className="text-box"><strong>Unisci</strong><small>Combina più file</small></div>
                  </button>

                  <button onClick={splitPDF} disabled={isProcessing} className="action-card">
                    <div className="icon-box"><Scissors /></div>
                    <div className="text-box"><strong>Estrai Pag. 1</strong><small>Salva singola pag</small></div>
                  </button>

                  <button onClick={rotatePDF} disabled={isProcessing} className="action-card">
                    <div className="icon-box"><RotateCw /></div>
                    <div className="text-box"><strong>Ruota</strong><small>Gira di 90°</small></div>
                  </button>

                  <button onClick={addPageNumbers} disabled={isProcessing} className="action-card">
                    <div className="icon-box"><Hash /></div>
                    <div className="text-box"><strong>Numera</strong><small>Aggiungi pag 1/n</small></div>
                  </button>

                  <button onClick={cleanMetadata} disabled={isProcessing} className="action-card">
                    <div className="icon-box"><Eraser /></div>
                    <div className="text-box"><strong>Pulisci Dati</strong><small>Rimuovi autore</small></div>
                  </button>
                </div>
              </div>
            )}

            {/* --- SEZIONE STRUMENTI IMMAGINI --- */}
            {(allImages || (!allPDFs && !allImages)) && (
              <div className="functions-wrapper">
                <span className="section-label">Strumenti Immagini</span>
                <div className="actions-grid">
                  <button onClick={imagesToPDF} disabled={isProcessing || !allImages} className="action-card">
                    <div className="icon-box"><ImageIcon /></div>
                    <div className="text-box"><strong>Img to PDF</strong><small>Crea documento</small></div>
                  </button>

                  {/* Placeholder per future funzioni */}
                  <button disabled className="action-card">
                    <div className="icon-box" style={{ background: '#eee', color: '#ccc' }}><Lock /></div>
                    <div className="text-box"><strong style={{ color: '#ccc' }}>Comprimi</strong><small>Coming Soon</small></div>
                  </button>
                </div>
              </div>
            )}

            {!allPDFs && !allImages && (
              <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '10px', fontSize: '0.9rem' }}>
                ⚠️ Hai caricato file misti (PDF e Immagini). Rimuovi alcuni file per vedere le opzioni specifiche.
              </div>
            )}

          </div>
        )}

        {files.length === 0 && <InfoSection />}
      </div>

      <footer className="glass-footer">
        <button className="footer-link" onClick={() => setShowPrivacy(true)}>Privacy Policy & Termini</button>
      </footer>
    </div>
  );
}

export default App;