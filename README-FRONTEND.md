# 🎨 MASTER TUTORIAL LENGKAP SELURUH FITUR FRONTEND (REACT JS + VITE SPA)

**Sistem Pencatatan Perwalian Mahasiswa STMIK Bandung**

Dokumen ini merupakan **Buku Panduan Teknis & Tutorial Komprehensif Seluruh Fitur Frontend**. Setiap fitur dijelaskan secara mendalam mencakup fungsi, lokasi file, potongan kode (*code snippet*), alur state, hingga cara interaksinya dengan API Backend.

---

## 📑 DAFTAR ISI TUTORIAL SELURUH FITUR FRONTEND

1. [Arsitektur Proyek & Struktur Folder Modular](#1-arsitektur-proyek--struktur-folder-modular)
2. [Instalasi & Menjalankan Aplikasi](#2-instalasi--menjalankan-aplikasi)
3. [Tutorial Desain Sistem, Glassmorphism, Logo Resmi & Dark Mode](#3-tutorial-desain-sistem-glassmorphism-logo-resmi--dark-mode)
4. [Tutorial Autentikasi: Login, Register Admin, Lupa & Reset Password](#4-tutorial-autentikasi-login-register-admin-lupa--reset-password)
5. [Tutorial Manajemen Rute & Role Guards (ProtectedRoute & RoleRoute 403)](#5-tutorial-manajemen-rute--role-guards-protectedroute--roleroute-403)
6. [Tutorial State Management Global (Zustand Auth & Theme Store)](#6-tutorial-state-management-global-zustand-auth--theme-store)
7. [Tutorial Central HTTP Client Axios & Interceptor Otomatis](#7-tutorial-central-http-client-axios--interceptor-otomatis)
8. [Tutorial Server State, Caching & Mutasi (TanStack React Query v5)](#8-tutorial-server-state-caching--mutasi-tanstack-react-query-v5)
9. [Tutorial Dashboard Multi-Role (Admin, Dosen Wali, Mahasiswa)](#9-tutorial-dashboard-multi-role-admin-dosen-wali-mahasiswa)
10. [Tutorial Visualisasi Grafik Analitik (Recharts Bar Chart & Pie Chart)](#10-tutorial-visualisasi-grafik-analitik-recharts-bar-chart--pie-chart)
11. [Tutorial Kelola Data Mahasiswa: CRUD, Search, Filter Prodi & Import Data](#11-tutorial-kelola-data-mahasiswa-crud-search-filter-prodi--import-data)
12. [Tutorial Kelola Data Dosen Wali & Fitur Bulk Assign Dosen Wali](#12-tutorial-kelola-data-dosen-wali--fitur-bulk-assign-dosen-wali)
13. [Tutorial Inti Perwalian: Builder KRS Matakuliah Dinamis & Approval Dosen](#13-tutorial-inti-perwalian-builder-krs-matakuliah-dinamis--approval-dosen)
14. [Tutorial Riwayat Bimbingan & Linimasa Audit Trail Log](#14-tutorial-riwayat-bimbingan--linimasa-audit-trail-log)
15. [Tutorial Profil Pengguna & Pembaruan Biodata Akun](#15-tutorial-profil-pengguna--pembaruan-biodata-akun)
16. [Tutorial Pengaturan & Manajemen Pengguna/Role Spatie (Admin Only)](#16-tutorial-pengaturan--manajemen-penggunarole-spatie-admin-only)
17. [Tutorial Ekspor Seluruh Data ke Dokumen PDF Multi-Page & File Excel (.xlsx)](#17-tutorial-ekspor-seluruh-data-ke-dokumen-pdf-multi-page--file-excel-xlsx)
18. [Tutorial Animasi UI Framer Motion, Toast Sonner & SweetAlert2](#18-tutorial-animasi-ui-framer-motion-toast-sonner--sweetalert2)
19. [Tutorial Penanganan Halaman Error (403, 404, 500)](#19-tutorial-penanganan-halaman-error-403-404-500)

---

## 🏛️ 1. ARSITEKTUR PROYEK & STRUKTUR FOLDER MODULAR

```
frontend/
├── public/
│   └── logo-stmik.png              # Logo Resmi STMIK Bandung 1993 & Favicon
├── src/
│   ├── assets/                     # Asset Gambar & Logo
│   ├── components/
│   │   ├── common/                 # Reusable Atoms: Button, Input, Select, Modal, Badge, Card, Skeleton, EmptyState
│   │   ├── dashboard/              # Komponen Dashboard: StatCard, ActivityTimeline, ChartCards (Recharts)
│   │   └── layout/                 # Layout Shell: Sidebar (Role-aware), Navbar, Footer, PageHeader
│   ├── layouts/
│   │   ├── AuthLayout.jsx          # Template Wrapper Login/Register
│   │   └── DashboardLayout.jsx     # Template Wrapper Dashboard (Sidebar + Header + Body)
│   ├── pages/
│   │   ├── auth/                   # Login.jsx, RegisterAdmin.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   │   ├── dashboard/              # DashboardPage.jsx
│   │   ├── dosen/                  # DosenListPage.jsx
│   │   ├── mahasiswa/              # MahasiswaListPage.jsx
│   │   ├── perwalian/              # PerwalianListPage.jsx
│   │   ├── profile/                # ProfilePage.jsx
│   │   ├── riwayat/                # RiwayatPage.jsx
│   │   ├── settings/               # SettingsPage.jsx, UserManagementPage.jsx
│   │   └── errors/                 # Error403.jsx, Error404.jsx, Error500.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx           # Master Routing
│   │   ├── ProtectedRoute.jsx      # Sanctum Guard
│   │   └── RoleRoute.jsx           # Spatie Role Guard
│   ├── services/
│   │   ├── api.js                  # Axios Client Instance & Interceptors
│   │   ├── authService.js          # API Login, Register, Profile, Reset Password
│   │   ├── dashboardService.js     # API Metrik Analitik Dashboard
│   │   ├── dosenService.js         # API CRUD Dosen & Assign Wali
│   │   ├── mahasiswaService.js     # API CRUD Mahasiswa & Import
│   │   ├── perwalianService.js     # API Perwalian, Dynamic KRS & Approval
│   │   └── userService.js          # API Kelola User & Spatie Roles
│   ├── store/
│   │   ├── authStore.js            # Zustand Auth Store (User, Token, Role)
│   │   └── themeStore.js           # Zustand Dark Mode Store
│   └── utils/
│       ├── exportHelpers.js        # jsPDF AutoTable & SheetJS XLSX Generator
│       └── formatters.js           # Format Tanggal Indonesia & Status Badges
├── package.json
└── vite.config.js
```

---

## ⚙️ 2. INSTALASI & MENJALANKAN APLIKASI

1. **Install Node Package**:
   ```bash
   cd frontend
   npm install
   ```
2. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi aktif di: `http://localhost:5173`
3. **Kompilasi Production Build**:
   ```bash
   npm run build
   ```

---

## 🎨 3. TUTORIAL DESAIN SISTEM, GLASSMORPHISM, LOGO RESMI & DARK MODE

### A. Konfigurasi Warna & Glassmorphism
- **Primary Blue**: `#2563eb` (Warna identitas tombol dan chart).
- **Secondary Slate**: `#0f172a` (Gelap) & `#f8fafc` (Terang).
- **Glassmorphism Effect** (`src/index.css`): Memberikan efek kaca transparan bertekstur blur modern:
  ```css
  .glass-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(226, 232, 240, 0.8);
  }
  .dark .glass-panel {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(30, 41, 59, 0.8);
  }
  ```

### B. Logo Resmi STMIK Bandung
Tersimpan di `public/logo-stmik.png` dan ditampilkan di:
- **Header Sidebar** (`src/components/layout/Sidebar.jsx`)
- **Header Card Login** (`src/layouts/AuthLayout.jsx`)
- **Favicon Tab Browser** (`index.html`)

### C. Dark Mode Persisten (`src/store/themeStore.js`)
Menggunakan Zustand untuk menyimpan preferensi tema di `localStorage` dan secara dinamis mengubah class `dark` pada root dokumen HTML:
```javascript
export const useThemeStore = create((set, get) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  toggleDarkMode: () => {
    const nextMode = !get().isDarkMode;
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    if (nextMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ isDarkMode: nextMode });
  },
}));
```

---

## 🔐 4. TUTORIAL AUTENTIKASI: LOGIN, REGISTER ADMIN, LUPA & RESET PASSWORD

Lokasi Folder: **`src/pages/auth/`**  
Service: **`src/services/authService.js`**

### A. Fitur Login (`Login.jsx`)
- Menerima `email` dan `password`.
- Saat submit sukses, token Bearer dan objek User disimpan ke Zustand `authStore` dan `localStorage`.
- Menampilkan pesan notifikasi toast sukses dari Sonner dan me-redirect otomatis ke `/dashboard`.

### B. Fitur Registrasi Administrator (`RegisterAdmin.jsx`)
- Digunakan untuk mendaftarkan akun Administrator baru.
- Memvalidasi input `name`, `email`, `password`, dan `password_confirmation`.

### C. Fitur Lupa Password (`ForgotPassword.jsx`)
- Memvalidasi apakah email pengguna terdaftar di sistem sebelum melanjutkan ke tahap reset password.

### D. Fitur Reset Password Baru (`ResetPassword.jsx`)
- Mengubah kata sandi pengguna secara langsung di backend dan memberikan konfirmasi berhasil untuk login kembali.

---

## 🛡️ 5. TUTORIAL MANAJEMEN RUTE & ROLE GUARDS

Lokasi Folder: **`src/routes/`**

### A. Route Guard Autentikasi (`ProtectedRoute.jsx`)
Mengecek apakah state `isAuthenticated` bernilai `true`. Jika `false`, user otomatis di-redirect ke halaman `/login`:
```jsx
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

### B. Role Permission Guard (`RoleRoute.jsx`)
Mencegah pengguna membuka rute yang bukan haknya (misalnya Mahasiswa membuka menu Kelola User Admin). Jika role tidak diizinkan, otomatis dialihkan ke halaman **403 Forbidden**:
```jsx
export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuthStore();
  const userRole = user?.roles?.[0];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
};
```

### C. Pencegahan Active Link Bertabrakan (`Sidebar.jsx`)
Menambahkan properti `end={item.path === '/settings' || item.path === '/dashboard'}` pada komponen `<NavLink>` agar menu *Pengaturan* (`/settings`) tidak ikut berubah menjadi biru saat user membuka submenu *Kelola User & Role* (`/settings/users`).

---

## ⚡ 6. TUTORIAL GLOBAL STATE MANAGEMENT (ZUSTAND)

Lokasi File: **`src/store/authStore.js`**

Menyediakan fungsi global untuk menyimpan sesi autentikasi, mengupdate profil, logout, dan memverifikasi role:
```javascript
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasRole: (roleName) => {
    const user = get().user;
    return user?.roles?.includes(roleName) || false;
  },
}));
```

---

## 🌐 7. TUTORIAL CENTRAL HTTP CLIENT AXIOS & INTERCEPTOR

Lokasi File: **`src/services/api.js`**

### Alur Kerja Interceptor:
1. **Request Interceptor**: Sebelum request dikirim ke backend, token Bearer diambil dari `localStorage` dan dimasukkan ke header `Authorization: Bearer <token>`.
2. **Response Interceptor**: Jika backend mengembalikan status HTTP `401 Unauthorized` (misalnya token sudah expired atau dihapus), sesi lokal otomatis dibersihkan dan halaman di-redirect ke `/login`.

```javascript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🔄 8. TUTORIAL SERVER STATE, CACHING & MUTASI (TANSTACK REACT QUERY V5)

### Mengapa Menggunakan React Query?
- **Otomatis Caching**: Data tidak perlu diambil ulang jika berpindah-pindah tab.
- **Mutasi & Auto Invalidation**: Setelah menyimpan atau menghapus data, tabel otomatis me-refresh data terbaru tanpa perlu me-reload halaman browser.

```javascript
// Contoh Query (Mengambil Data)
const { data, isLoading } = useQuery({
  queryKey: ['mahasiswa', page, search, prodiFilter],
  queryFn: () => mahasiswaService.getMahasiswa({ page, search, prodi: prodiFilter }),
});

// Contoh Mutasi (Hapus Data)
const deleteMutation = useMutation({
  mutationFn: (id) => mahasiswaService.deleteMahasiswa(id),
  onSuccess: () => {
    toast.success('Data berhasil dihapus');
    queryClient.invalidateQueries(['mahasiswa']); // Refresh query otomatis
  },
});
```

---

## 📊 9. TUTORIAL DASHBOARD MULTI-ROLE (ADMIN, DOSEN WALI, MAHASISWA)

Lokasi File: **`src/pages/dashboard/DashboardPage.jsx`**  
Service: **`src/services/dashboardService.js`**

Tampilan dashboard bersifat adaptif sesuai role pengguna yang login:
1. **Tampilan Administrator**:
   - Kartu Metrik: Total Mahasiswa, Total Dosen Wali, Total Pengajuan Perwalian, dan Pengajuan Pending.
   - Grafik Bar Chart Statistik Per Semester & Donut Chart Rasio Status Persetujuan.
   - Linimasa Aktivitas Terkini (*Recent Activity Timeline*).
2. **Tampilan Dosen Wali**:
   - Kartu Kuota Bimbingan & Total Mahasiswa Bimbingan Aktif.
   - Antrian Perwalian yang membutuhkan review persetujuan (*Pending Action*).
3. **Tampilan Mahasiswa**:
   - Kartu Profil Dosen Wali Pembimbing Akademik.
   - Informasi IPK Terakhir & Total SKS Lulus.
   - Status Pengajuan Perwalian Semester Aktif.

---

## 📈 10. TUTORIAL VISUALISASI GRAFIK ANALITIK (RECHARTS)

Lokasi File: **`src/components/dashboard/ChartCards.jsx`**

### A. Bar Chart (Pengajuan Per Semester)
Menggunakan komponen `ResponsiveContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, dan `Bar`:
```jsx
<ResponsiveContainer width="100%" height={260}>
  <BarChart data={semesterData}>
    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
    <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
    <YAxis stroke="#94a3b8" fontSize={11} />
    <Tooltip />
    <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} name="Total Pengajuan" />
  </BarChart>
</ResponsiveContainer>
```

### B. Pie / Donut Chart (Distribusi Status)
Menggunakan `PieChart`, `Pie`, `Cell`, `Tooltip`, dan `Legend` dengan pemetaan warna status:
```jsx
const STATUS_COLORS = {
  Disetujui: '#10b981', // Hijau
  Pending: '#f59e0b',   // Kuning
  Ditolak: '#ef4444',   // Merah
};

<ResponsiveContainer width="100%" height={260}>
  <PieChart>
    <Pie data={statusData} dataKey="total" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={75}>
      {statusData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#64748b'} />
      ))}
    </Pie>
    <Tooltip />
    <Legend verticalAlign="bottom" height={36} />
  </PieChart>
</ResponsiveContainer>
```

---

## 👥 11. TUTORIAL KELOLA DATA MAHASISWA: CRUD, SEARCH, FILTER & IMPORT

Lokasi File: **`src/pages/mahasiswa/MahasiswaListPage.jsx`**  
Service: **`src/services/mahasiswaService.js`**

### Fitur Lengkap:
1. **Pencarian Cerdas Case-Insensitive**: Input search mengirim query string ke backend (diproses dengan operator PostgreSQL `ILIKE`).
2. **Filter Program Studi**: Dropdown memilih `Teknik Informatika` atau `Sistem Informasi`.
3. **Pagination Tabel**: Kontrol tombol *Sebelumnya* dan *Selanjutnya* berbasis metadata backend.
4. **Modal Form Tambah / Edit Mahasiswa**: Form validasi data NIM, Nama, Prodi, Angkatan, IPK, SKS, dan pilihan Dosen Wali.
5. **Modal Impor Massal JSON/Excel**: Memungkinkan administrator menempelkan data array JSON untuk disimpan ke database secara massal.
6. **Hapus Data Terproteksi**: Modal konfirmasi SweetAlert2 sebelum menghapus data mahasiswa dan user terkait.

---

## 👨‍🏫 12. TUTORIAL KELOLA DATA DOSEN WALI & FITUR BULK ASSIGN WALI

Lokasi File: **`src/pages/dosen/DosenListPage.jsx`**  
Service: **`src/services/dosenService.js`**

### Fitur Lengkap:
1. **CRUD Dosen Wali**: Pengelolaan NIDN, Nama Lengkap beserta Gelar, Email Official, Nomor WhatsApp, dan Kuota Maksimal Bimbingan.
2. **Fitur Bulk Assign Dosen Wali**:
   - Administrator mengklik tombol **"Assign Wali"** pada salah satu Dosen Wali.
   - Modal menampilkan daftar seluruh mahasiswa yang belum dibimbing atau ingin dialihkan.
   - Admin memilih multi-checkbox mahasiswa lalu menyimpan penetapan sekaligus via endpoint `POST /api/v1/dosen/assign-wali`.

---

## 📝 13. TUTORIAL INTI PERWALIAN: BUILDER KRS MATAKULIAH DINAMIS & APPROVAL

Lokasi File: **`src/pages/perwalian/PerwalianListPage.jsx`**  
Service: **`src/services/perwalianService.js`**

### A. Dynamic Course Row Builder (Mahasiswa)
Mahasiswa dapat menyusun rencana studi semester secara dinamis:
- Menambah baris matkul (`+ Tambah Matkul`).
- Menghapus baris matkul.
- **Kalkulasi Otomatis Total SKS**: Menghitung total beban SKS secara *real-time*:
  ```javascript
  const totalSks = matakuliahList.reduce((acc, item) => acc + Number(item.sks || 0), 0);
  ```

### B. Aturan Proteksi Status Pending
- Tombol **Edit** dan **Hapus Pengajuan** hanya aktif jika status pengajuan masih `'Pending'`.
- Pengajuan yang sudah `'Disetujui'` atau `'Ditolak'` tidak dapat diubah kembali.

### C. Modal Review & Catatan Evaluasi (Dosen Wali)
- Dosen Wali membuka modal review untuk memeriksa rencana KRS mahasiswa bimbingannya.
- Dosen memilih status (`Disetujui` / `Ditolak`) dan memberikan masukan pada kolom `catatan_dosen`.
- Keputusan langsung tersimpan dan memicu notifikasi toast serta pencatatan ke audit log.

---

## 📜 14. TUTORIAL RIWAYAT BIMBINGAN & LINIMASA AUDIT TRAIL

Lokasi File: **`src/pages/riwayat/RiwayatPage.jsx`**

Menampilkan seluruh histori bimbingan dalam bentuk kartu linimasa (*timeline*) vertikal yang memuat:
- Nama & NIM Mahasiswa.
- Dosen Wali Pembimbing.
- Semester & Total SKS Rencana.
- Badge Status (`Disetujui`, `Pending`, `Ditolak`).
- Catatan / saran yang diberikan oleh Dosen Wali.
- Tanggal & waktu persetujuan diproses.

---

## 👤 15. TUTORIAL PROFIL PENGGUNA & PEMBARUAN BIODATA

Lokasi File: **`src/pages/profile/ProfilePage.jsx`**  
Service: **`src/services/authService.js`**

1. Menampilkan kartu identitas avatar inisial nama, email, dan badge role pengguna.
2. Form untuk memperbarui Nama Lengkap, Email Resmi, dan Nomor Telepon/WhatsApp.
3. Saat berhasil disimpan, state user di `authStore` dan `localStorage` langsung diperbarui secara instan.

---

## ⚙️ 16. TUTORIAL PENGATURAN & KELOLA USER/ROLE SPATIE (ADMIN ONLY)

Lokasi File:
- **Pengaturan Umum**: `src/pages/settings/SettingsPage.jsx`
- **Manajemen User & Role**: `src/pages/settings/UserManagementPage.jsx`
- **Service**: `src/services/userService.js`

### Fitur User Management (Khusus Administrator):
1. Menampilkan daftar seluruh akun terdaftar di sistem beserta Role Spatie masing-masing (`Admin`, `Dosen`, `Mahasiswa`).
2. Modal pembuatan user baru dan penetapan role Spatie.
3. Modal edit nama, email, dan penggantian role.
4. Fitur pencarian user dan filter berdasarkan Role.

---

## 📥 17. TUTORIAL EKSPOR SELURUH DATA KE PDF MULTI-PAGE & FILE EXCEL

Lokasi File: **`src/utils/exportHelpers.js`**

### A. Ekspor ke File Excel Asli (.xlsx)
Menggunakan pustaka `xlsx` (SheetJS) untuk mengubah array data JavaScript menjadi file workbook spreadsheet:
```javascript
export const exportToExcel = (dataRows, fileName) => {
  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Perwalian');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
```

### B. Ekspor Seluruh Data ke Dokumen PDF Asli Multi-Page (.pdf)
Fungsi `handleExportPDF` mengambil **seluruh data dari halaman 1 sampai 5 (50 mahasiswa / 100 perwalian)**, lalu men-generate dokumen PDF asli dengan header resmi STMIK Bandung dan memecah halaman secara otomatis (*multi-page auto table*):

```javascript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (headers, rows, title, fileName) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Header Surat STMIK Bandung
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('STMIK BANDUNG', 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 40, 58);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} WIB`, 40, 72);

  // AutoTable Multi-Page Renderer
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 85,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Otomatis men-download file PDF ke komputer
  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
```

---

## ✨ 18. TUTORIAL ANIMASI UI, TOAST NOTIFICATION & SWEETALERT2

1. **Framer Motion Micro-Interactions**:
   - Tombol interaktif memiliki animasi sentuh `whileTap={{ scale: 0.98 }}` dan hover `whileHover={{ scale: 1.01 }}`.
   - Dialog Modal memiliki transisi smooth zoom dan fade-in.
2. **Sonner Toast**: Memberikan respon visual cepat di sudut layar:
   ```javascript
   toast.success('Pengajuan perwalian berhasil disimpan!');
   toast.error('Gagal memproses data.');
   ```
3. **SweetAlert2 Confirmation**: Dialog konfirmasi modern sebelum melakukan aksi berbahaya (penghapusan data).

---

## 🚫 19. TUTORIAL PENANGANAN HALAMAN ERROR (403, 404, 500)

Lokasi Folder: **`src/pages/errors/`**

1. **Error 403 Forbidden (`Error403.jsx`)**: Ditampilkan saat role pengguna tidak diizinkan membuka menu tertentu (dilengkapi tombol kembali ke Dashboard).
2. **Error 404 Not Found (`Error404.jsx`)**: Ditampilkan saat rute URL tidak ditemukan di sistem.
3. **Error 500 Server Error (`Error500.jsx`)**: Ditampilkan saat terjadi kesalahan koneksi server dengan tombol muat ulang (*reload*).
