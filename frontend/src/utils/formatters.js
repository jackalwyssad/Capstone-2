/**
 * Helper Utility Formatters
 * Berfungsi untuk memformat data tampilan pada komponen UI (Tanggal, Status Badge Color, IPK, SKS, Prodi).
 */

/**
 * Format tanggal ISO 8601 ke format Indonesia (contoh: "14 Agustus 2025, 14:30 WIB")
 */
export const formatDateIndonesian = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Mendapatkan class Tailwind CSS badge warna berdasarkan status perwalian ('Pending', 'Disetujui', 'Ditolak')
 */
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Disetujui':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Ditolak':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Pending':
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
};

/**
 * Format angka IPK 2 desimal
 */
export const formatIPK = (ipk) => {
  if (ipk === null || ipk === undefined) return '0.00';
  return Number(ipk).toFixed(2);
};
