import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist'; // Importa la v5
import JSZip from 'jszip';
import download from 'downloadjs';
import { auth, loginWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import {
  Upload, Layers, Scissors, RotateCw, Image as ImageIcon,
  Trash2, LogOut, User, Type, FileImage, Grid, ArrowLeft, ArrowRight,
  X, Loader2, FileText as TextIcon, Wrench, SortAsc, RefreshCcw
} from 'lucide-react';
import './App.css';
import InfoSection from './InfoSection';
import PrivacyPage from './PrivacyPage';

// --- PATCH FONDAMENTALE PER PDF.JS v5 ---
// 1. Polyfill per Promise.withResolvers (necessario per v5 su alcuni browser/ambienti)
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 2. Configurazione Worker v5 (Punta al file .mjs)
// Usiamo unpkg per prendere l'esatta versione installata
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- ANTEPRIME ---
  const generatePreview = async (file) => {
    if (file.type.startsWith('image/')) return URL.createObjectURL(file);
    if (file.type === 'text/plain') return null;

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Caricamento documento
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 0.3; // Anteprima leggera
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) {
      console.warn("Anteprima non disponibile:", error);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    setIsProcessing(true);

    const newFiles = await Promise.all(selected.map(async (file) => {
      const previewUrl = await generatePreview(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        type: file.type,
        name: file.name
      };
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  // --- GESTIONE LISTA ---
  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const sortFiles = () => {
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    setFiles(sorted);
  };

  const removeFile = (id) => setFiles(files.filter(f => f.id !== id));

  const updateStats = async () => {
    if (user) {
      try { await updateDoc(doc(db, "users", user.uid), { filesProcessed: increment(1) }); }
      catch (e) { }
    }
  };

  // --- FUNZIONI AVANZATE ---

  const mergePDFs = async () => {
    if (files.length < 2) return alert("Servono almeno 2 PDF.");
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const f of files) {
        if (f.type !== 'application/pdf') continue;
        const bytes = await f.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      download(await mergedPdf.save(), "unito_pdfpro.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore unione."); }
    setIsProcessing(false);
  };

  const imagesToPDF = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const bytes = await f.file.arrayBuffer();
        let image;
        if (f.type.includes('jpeg') || f.type.includes('jpg')) image = await pdfDoc.embedJpg(bytes);
        else if (f.type.includes('png')) image = await pdfDoc.embedPng(bytes);
        else continue;

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      download(await pdfDoc.save(), "album.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore conversione immagini."); }
    setIsProcessing(false);
  };

  const txtToPDF = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const text = await files[0].file.text();
      const lines = text.split('\n');
      let page = pdfDoc.addPage();
      let y = page.getHeight() - 50;

      for (const line of lines) {
        if (y < 50) { page = pdfDoc.addPage(); y = page.getHeight() - 50; }
        page.drawText(line.substring(0, 90), { x: 50, y, size: 12, font });
        y -= 15;
      }
      download(await pdfDoc.save(), "testo.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore TXT."); }
    setIsProcessing(false);
  };

  const pdfToImages = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const arrayBuffer = await files[0].file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        zip.file(`pagina-${i}.jpg`, imgData, { base64: true });
      }
      download(await zip.generateAsync({ type: "blob" }), "immagini.zip", "application/zip");
      updateStats();
    } catch (err) { alert("Errore conversione."); }
    setIsProcessing(false);
  };

  const extractAllPages = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();

      for (let i = 0; i < count; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        zip.file(`pagina-${i + 1}.pdf`, await newPdf.save());
      }
      download(await zip.generateAsync({ type: "blob" }), "pagine.zip", "application/zip");
      updateStats();
    } catch (err) { alert("Errore estrazione."); }
    setIsProcessing(false);
  };

  const rotatePDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      pdf.getPages().forEach(p => p.setRotation(degrees(p.getRotation().angle + 90)));
      download(await pdf.save(), "ruotato.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore rotazione."); }
    setIsProcessing(false);
  };

  const reversePDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();
      const newPdf = await PDFDocument.create();
      for (let i = count - 1; i >= 0; i--) {
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
      }
      download(await newPdf.save(), "inverso.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore inversione."); }
    setIsProcessing(false);
  };

  const flattenPDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      try { pdf.getForm().flatten(); } catch (e) { }
      download(await pdf.save(), "flatten.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore."); }
    setIsProcessing(false);
  };

  const addWatermark = async () => {
    const text = prompt("Testo:", "DRAFT");
    if (!text) return;
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      pdf.getPages().forEach(p => {
        const { width, height } = p.getSize();
        p.drawText(text, { x: width / 6, y: height / 2, size: 50, font, color: rgb(0.9, 0.2, 0.2), opacity: 0.3, rotate: degrees(45) });
      });
      download(await pdf.save(), "watermark.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore."); }
    setIsProcessing(false);
  };

  // --- RENDER UI ---
  const allPDFs = files.length > 0 && files.every(f => f.type === 'application/pdf');
  const allImages = files.length > 0 && files.every(f => f.type.startsWith('image/'));
  const isTxt = files.length === 1 && files[0].type === 'text/plain';

  return (
    <div className="main-wrapper">
      <div className="liquid-bg"></div>
      <div className="liquid-bg-2"></div>
      {showPrivacy && <PrivacyPage onClose={() => setShowPrivacy(false)} />}

      <nav className="glass-nav">
        <div className="logo">PDF PRO <span style={{ color: '#ff3b30', fontSize: '0.6em', verticalAlign: 'super' }}>ULTRA</span></div>
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
          <h1>Il tuo editor PDF definitivo.</h1>
          <p className="subtitle">Tutte le funzioni. Massima privacy. Zero costi.</p>
        </header>

        {files.length === 0 ? (
          <div className="upload-section">
            <label htmlFor="upload" className="glass-button big-upload">
              <Upload size={32} /> <span>Carica Documenti</span>
            </label>
            <input id="upload" type="file" multiple accept=".pdf, .jpg, .jpeg, .png, .txt" onChange={handleFileChange} />
            <p className="drop-text">PDF, Immagini e Testo</p>
          </div>
        ) : (
          <div className="workspace fade-in">
            <div className="toolbar">
              <div className="toolbar-left">
                <button onClick={() => setFiles([])} className="back-btn"><X size={18} /> Chiudi</button>
                <span className="count-badge">{files.length} File</span>
                {files.length > 1 && (
                  <button onClick={sortFiles} className="back-btn" title="Ordina A-Z">
                    <SortAsc size={18} /> A-Z
                  </button>
                )}
              </div>
              <label htmlFor="add-more" className="add-btn-icon"><Upload size={18} /></label>
              <input id="add-more" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="preview-grid">
              {files.map((item, i) => (
                <div key={item.id} className="preview-card fade-in">
                  <div className="thumb-box">
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt="Preview" />
                    ) : (
                      <div className="generic-icon">
                        {item.type === 'text/plain' ? <TextIcon size={40} /> : <FileImage size={40} />}
                      </div>
                    )}
                    <div className="overlay-actions">
                      {i > 0 && <button onClick={() => moveFile(i, -1)} className="move-btn"><ArrowLeft size={14} /></button>}
                      <button onClick={() => removeFile(item.id)} className="delete-btn-mini"><Trash2 size={14} /></button>
                      {i < files.length - 1 && <button onClick={() => moveFile(i, 1)} className="move-btn"><ArrowRight size={14} /></button>}
                    </div>
                    <div className="page-number">{i + 1}</div>
                  </div>
                  <div className="card-name">{item.name}</div>
                </div>
              ))}
            </div>

            {isProcessing ? (
              <div className="processing-box">
                <Loader2 className="spin" size={40} color="#007AFF" />
                <p>Sto elaborando...</p>
              </div>
            ) : (
              <div className="functions-panel">
                <div className="action-group">
                  {allPDFs && files.length > 1 && <button onClick={mergePDFs} className="ilove-btn primary"><Layers size={20} /> UNISCI PDF</button>}
                  {allImages && <button onClick={imagesToPDF} className="ilove-btn primary"><ImageIcon size={20} /> CREA PDF</button>}
                  {isTxt && <button onClick={txtToPDF} className="ilove-btn primary"><Type size={20} /> CONVERTI IN PDF</button>}
                </div>

                {files.length === 1 && allPDFs && (
                  <div className="grid-options">
                    <button onClick={pdfToImages} className="ilove-card"><FileImage size={24} color="#E879F9" /> <span>PDF in JPG</span></button>
                    <button onClick={extractAllPages} className="ilove-card"><Grid size={24} color="#34C759" /> <span>Dividi Tutto</span></button>
                    <button onClick={rotatePDF} className="ilove-card"><RotateCw size={24} color="#FF9500" /> <span>Ruota</span></button>
                    <button onClick={addWatermark} className="ilove-card"><Type size={24} color="#FF3B30" /> <span>Watermark</span></button>
                    <button onClick={reversePDF} className="ilove-card"><RefreshCcw size={24} color="#007AFF" /> <span>Inverti</span></button>
                    <button onClick={flattenPDF} className="ilove-card"><Wrench size={24} color="#8E8E93" /> <span>Ripara</span></button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {files.length === 0 && <InfoSection />}
      </div>
      <footer className="glass-footer">
        <button className="footer-link" onClick={() => setShowPrivacy(true)}>Privacy & Sicurezza</button>
      </footer>
    </div>
  );
}

export default App;