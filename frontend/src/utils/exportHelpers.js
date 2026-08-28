import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Helper Utility Export Data
 * Berfungsi untuk mengunduh laporan rekapitulasi ke format File Excel (.xlsx) atau File PDF (.pdf) secara langsung.
 */

/**
 * Ekspor array data JavaScript ke file Excel (.xlsx)
 * @param {Array} headersOrData Array of arrays data atau array string header
 * @param {Array|String} rowsOrFileName Array baris data ATAU nama file
 * @param {String} maybeFileName Nama file jika dipanggil dengan 3 argumen (headers, rows, fileName)
 */
export const exportToExcel = (headersOrData, rowsOrFileName = 'Rekap_Perwalian_STMIK_Bandung', maybeFileName) => {
  let aoa = [];
  let fileName = 'Rekap_Perwalian_STMIK_Bandung';

  if (Array.isArray(rowsOrFileName)) {
    // Dipanggil dengan 3 argumen: (headers, rows, fileName)
    aoa = [headersOrData, ...rowsOrFileName];
    fileName = typeof maybeFileName === 'string' ? maybeFileName : 'Rekap_Perwalian_STMIK_Bandung';
  } else {
    // Dipanggil dengan 2 argumen: (aoa_data, fileName)
    aoa = Array.isArray(headersOrData) ? headersOrData : [];
    fileName = typeof rowsOrFileName === 'string' ? rowsOrFileName : 'Rekap_Perwalian_STMIK_Bandung';
  }

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Perwalian');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Membaca file Excel (.xlsx / .xls / .csv) dan mengonversinya menjadi format data array of objects standar
 * @param {File} file File Excel dari input file
 * @returns {Promise<Array>}
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Ambil array of rows
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Normalisasi key kolom secara fleksibel
        const normalized = rawJson.map((row) => {
          const item = {};
          
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = typeof row[key] === 'string' ? row[key].trim() : row[key];

            if (cleanKey.includes('nim') || cleanKey.includes('nomor induk') || cleanKey.includes('no induk') || cleanKey.includes('student id')) {
              item.nim = String(val);
            } else if (cleanKey.includes('nama') || cleanKey.includes('name') || cleanKey.includes('mahasiswa')) {
              item.nama_lengkap = String(val);
            } else if (cleanKey.includes('kelamin') || cleanKey.includes('gender') || cleanKey === 'jk' || cleanKey.includes('sex')) {
              const lowerVal = String(val).toLowerCase().trim();
              if (lowerVal.startsWith('p') || lowerVal.includes('wanita') || lowerVal.includes('perempuan') || lowerVal === 'f' || lowerVal === 'female') {
                item.jenis_kelamin = 'Perempuan';
              } else {
                item.jenis_kelamin = 'Laki-laki';
              }
            } else if (
              cleanKey.includes('prodi') ||
              cleanKey.includes('studi') ||
              cleanKey.includes('program') ||
              cleanKey.includes('jurusan') ||
              cleanKey.includes('major') ||
              cleanKey.includes('study')
            ) {
              const lowerProdi = String(val).toLowerCase().trim();
              if (
                lowerProdi.includes('sistem') ||
                lowerProdi.includes('informasi') ||
                lowerProdi === 'si' ||
                lowerProdi === 'is' ||
                lowerProdi.startsWith('sistem')
              ) {
                item.prodi = 'Sistem Informasi';
              } else {
                item.prodi = 'Teknik Informatika';
              }
            } else if (cleanKey.includes('angkatan') || cleanKey.includes('tahun') || cleanKey.includes('year') || cleanKey.includes('cohort')) {
              item.angkatan = String(val);
            } else if (cleanKey.includes('ipk') || cleanKey.includes('gpa') || cleanKey.includes('indeks')) {
              item.ipk_terakhir = parseFloat(val) || 0.00;
            } else if (cleanKey.includes('sks') || cleanKey.includes('kredit') || cleanKey.includes('credit')) {
              item.sks_lulus = parseInt(val, 10) || 0;
            }
          }

          // Fallback default jika tidak terdeteksi
          if (!item.nama_lengkap && row['Nama']) item.nama_lengkap = String(row['Nama']);
          if (!item.prodi) item.prodi = 'Teknik Informatika';
          if (!item.angkatan) item.angkatan = String(new Date().getFullYear());
          if (!item.jenis_kelamin) item.jenis_kelamin = 'Laki-laki';

          // Otomatis deteksi Prodi & Angkatan dari Awalan NIM (Prefix Standar STMIK Bandung) jika NIM diisi
          if (item.nim) {
            const cleanNim = String(item.nim).trim();
            if (
              cleanNim.startsWith('32') ||
              cleanNim.startsWith('31') ||
              cleanNim.startsWith('21') ||
              cleanNim.startsWith('22') ||
              cleanNim.toUpperCase().startsWith('SI') ||
              cleanNim.toUpperCase().startsWith('IS')
            ) {
              item.prodi = 'Sistem Informasi';
            } else if (
              cleanNim.startsWith('12') ||
              cleanNim.startsWith('11') ||
              cleanNim.startsWith('10') ||
              cleanNim.toUpperCase().startsWith('IF') ||
              cleanNim.toUpperCase().startsWith('TI')
            ) {
              item.prodi = 'Teknik Informatika';
            }

            // Jika angkatan tidak spesifik, ekstrak tahun dari 2 digit NIM (misal 3226001 -> 2026, 1224001 -> 2024)
            if (cleanNim.length >= 4) {
              const yearDigits = cleanNim.slice(2, 4);
              if (/^\d{2}$/.test(yearDigits)) {
                item.angkatan = `20${yearDigits}`;
              }
            }
          }

          return item;
        }).filter((row) => Boolean(row.nama_lengkap));

        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Membuat dan mengunduh Template Resmi Excel (.xlsx) untuk Impor Data Mahasiswa
 */
export const downloadMahasiswaExcelTemplate = () => {
  const headers = [
    ['NIM (Opsional - Kosongkan jika ingin dibuat otomatis)', 'Nama Lengkap (Wajib)', 'Jenis Kelamin (Laki-laki/Perempuan)', 'Program Studi (Teknik Informatika/Sistem Informasi)', 'Angkatan (Tahun)', 'IPK Terakhir', 'SKS Lulus'],
    ['', 'Rahmat Hidayat', 'Laki-laki', 'Teknik Informatika', '2026', '3.65', '48'],
    ['3226001', 'Siti Nurhaliza', 'Perempuan', 'Sistem Informasi', '2026', '3.75', '48'],
    ['', 'Dimas Prasetyo', 'Laki-laki', 'Teknik Informatika', '2026', '3.50', '24'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  
  // Set lebar kolom otomatis
  worksheet['!cols'] = [
    { wch: 45 }, // NIM
    { wch: 28 }, // Nama
    { wch: 32 }, // Jenis Kelamin
    { wch: 40 }, // Prodi
    { wch: 18 }, // Angkatan
    { wch: 15 }, // IPK
    { wch: 12 }, // SKS
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Mahasiswa');
  XLSX.writeFile(workbook, `Template_Import_Mahasiswa_STMIK_Bandung.xlsx`);
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
