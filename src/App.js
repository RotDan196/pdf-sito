import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import download from 'downloadjs';
import { Upload, FileText, Layers, Scissors, RotateCw, Trash2 } from 'lucide-react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 1. FUNZIONE UNISCI (MERGE)
  const mergePDFs = async () => {
    if (files.length < 2) return alert("Per unire servono almeno 2 file!");
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
      download(pdfBytes, "pdf-unito.pdf", "application/pdf");
    } catch (err) { alert("Errore durante l'unione"); }
    setIsProcessing(false);
  };

  // 2. FUNZIONE SEPARA (Estrae solo la pagina 1 del primo file)
  const splitPDF = async () => {
    if (files.length === 0) return alert("Carica un file!");
    setIsProcessing(true);
    try {
      const file = files[0]; // Prende il primo file
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);

      const newPdf = await PDFDocument.create();
      // Copia la pagina 0 (che è la prima pagina)
      const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);

      newPdf.addPage(firstPage);
      const pdfBytes = await newPdf.save();
      download(pdfBytes, "pagina-estratta.pdf", "application/pdf");
    } catch (err) { alert("Il file ha una sola pagina o è protetto!"); }
    setIsProcessing(false);
  };

  // 3. FUNZIONE RUOTA (Ruota tutto di 90 gradi)
  const rotatePDF = async () => {
    if (files.length === 0) return alert("Carica un file!");
    setIsProcessing(true);
    try {
      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const rotation = page.getRotation();
        page.setRotation(degrees(rotation.angle + 90));
      });

      const pdfBytes = await pdfDoc.save();
      download(pdfBytes, "ruotato.pdf", "application/pdf");
    } catch (err) { alert("Errore rotazione"); }
    setIsProcessing(false);
  };

  return (
    <div className="container">
      <h1>🛠️ PDF Multi-Tool</h1>
      <p>Unisci, Separa e Ruota i tuoi documenti.</p>

      <div className="upload-area">
        <label htmlFor="upload">
          <Upload size={40} />
          <span>Clicca per aggiungere PDF</span>
        </label>
        <input id="upload" type="file" multiple accept="application/pdf" onChange={handleFileChange} />
      </div>

      <div className="files-list">
        {files.map((file, i) => (
          <div key={i} className="file-item">
            <span><FileText size={16} /> {file.name}</span>
            <button onClick={() => removeFile(i)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {/* GRIGLIA PULSANTI */}
      <div className="buttons-grid">
        <button onClick={mergePDFs} disabled={isProcessing} className="btn-action">
          <Layers size={20} /> UNISCI TUTTO
        </button>

        <button onClick={splitPDF} disabled={isProcessing} className="btn-action btn-secondary">
          <Scissors size={20} /> ESTRAI PAGINA 1
        </button>

        <button onClick={rotatePDF} disabled={isProcessing} className="btn-action btn-secondary">
          <RotateCw size={20} /> RUOTA 90°
        </button>
      </div>
    </div>
  );
}

export default App;