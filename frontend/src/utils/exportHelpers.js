import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Helper Utility Export Data
 * Berfungsi untuk mengunduh laporan rekapitulasi ke format File Excel (.xlsx) atau File PDF (.pdf) secara langsung.
 */

/**
 * Ekspor array data JavaScript ke file Excel (.xlsx)
 * @param {Array} data Array of objects atau array of arrays
 * @param {String} fileName Nama file output (tanpa ekstensi)
 */
export const exportToExcel = (data, fileName = 'Rekap_Perwalian_STMIK_Bandung') => {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Perwalian');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Ekspor data ke File PDF (.pdf) asli yang otomatis di-download
 * @param {Array} headers Array string header kolom tabel (contoh: ['NIM', 'Nama Mahasiswa', 'Prodi', ...])
 * @param {Array} rows Array of arrays data baris
 * @param {String} title Judul dokumen laporan
 * @param {String} fileName Nama file PDF yang di-download
 */
export const exportToPDF = (
  headers = [],
  rows = [],
  title = 'Laporan Rekapitulasi Data STMIK Bandung',
  fileName = 'Laporan_STMIK_Bandung'
) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Header Dokumen
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('STMIK BANDUNG', 40, 40);

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(title, 40, 58);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB`, 40, 74);

  // Garis Pembatas
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, 85, 555, 85);

  // Render Tabel dengan autoTable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 95,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Primary Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
  });

  // Download file PDF langsung ke komputer user
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`${fileName}_${dateStr}.pdf`);
};
