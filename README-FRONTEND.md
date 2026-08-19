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
13. [Tutorial Modul Mata Kuliah: CRUD, Kode Auto-Sequential & Dropdown Ruangan](#13-tutorial-modul-mata-kuliah-crud-kode-auto-sequential--dropdown-ruangan)
14. [Tutorial Inti Perwalian: Builder KRS Matakuliah Dinamis & Approval Dosen](#14-tutorial-inti-perwalian-builder-krs-matakuliah-dinamis--approval-dosen)
15. [Tutorial Riwayat Bimbingan & Linimasa Audit Trail Log](#15-tutorial-riwayat-bimbingan--linimasa-audit-trail-log)
16. [Tutorial Profil Pengguna, Foto Upload & Kartu Dosen Wali](#16-tutorial-profil-pengguna-foto-upload--kartu-dosen-wali)
17. [Tutorial Pengaturan & Manajemen Pengguna/Role Spatie (Admin Only)](#17-tutorial-pengaturan--manajemen-penggunarole-spatie-admin-only)
18. [Tutorial Ekspor Seluruh Data ke PDF Multi-Page & Excel (.xlsx)](#18-tutorial-ekspor-seluruh-data-ke-pdf-multi-page--excel-xlsx)
19. [Tutorial Animasi UI Framer Motion, Toast Sonner & SweetAlert2](#19-tutorial-animasi-ui-framer-motion-toast-sonner--sweetalert2)
20. [Tutorial Penanganan Halaman Error (403, 404, 500)](#20-tutorial-penanganan-halaman-error-403-404-500)
21. [Tutorial Notifikasi Bahasa Indonesia Terpadu](#21-tutorial-notifikasi-bahasa-indonesia-terpadu)

---

## 🏛️ 1. ARSITEKTUR PROYEK & STRUKTUR FOLDER MODULAR

```
frontend/
├── public/
│   └── logo-stmik.png              # Logo Resmi STMIK Bandung & Favicon
├── src/
│   ├── assets/                     # Asset Gambar & Logo
│   ├── components/
│   │   ├── common/                 # Reusable Atoms: Button, Input, Select, Modal, Badge, Card, Skeleton, EmptyState, ErrorBoundary
│   │   ├── dashboard/              # Komponen Dashboard: StatCard, ActivityTimeline, ChartCards (Recharts)
│   │   └── layout/                 # Layout Shell: Sidebar (Role-aware), Navbar, Footer, PageHeader
│   ├── layouts/
│   │   ├── AuthLayout.jsx          # Template Wrapper Login/Register
│   │   └── DashboardLayout.jsx     # Template Wrapper Dashboard (Sidebar + Header + Body)
│   ├── pages/
│   │   ├── auth/                   # Login.jsx, RegisterAdmin.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   │   ├── dashboard/              # DashboardPage.jsx (multi-role adaptive)
│   │   ├── dosen/                  # DosenListPage.jsx
│   │   ├── mahasiswa/              # MahasiswaListPage.jsx
│   │   ├── matakuliah/             # MatakuliahListPage.jsx (BARU - CRUD, Auto Code, Room Dropdown)
│   │   ├── perwalian/              # PerwalianListPage.jsx
│   │   ├── profile/                # ProfilePage.jsx (Foto Upload, Kartu Dosen Wali)
│   │   ├── riwayat/                # RiwayatPage.jsx
│   │   ├── settings/               # SettingsPage.jsx, UserManagementPage.jsx (Dynamic NIM/NIDN)
│   │   └── errors/                 # Error403.jsx, Error404.jsx, Error500.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx           # Master Routing (termasuk /matakuliah)
│   │   ├── ProtectedRoute.jsx      # Sanctum Token Guard
│   │   └── RoleRoute.jsx           # Spatie Role Guard → 403
│   ├── services/
│   │   ├── api.js                  # Axios Client Instance & Interceptors
│   │   ├── authService.js          # API Login, Register, Profile, Reset Password, Avatar Upload
│   │   ├── dashboardService.js     # API Metrik Analitik Dashboard
│   │   ├── dosenService.js         # API CRUD Dosen & Assign Wali
│   │   ├── mahasiswaService.js     # API CRUD Mahasiswa & Import
│   │   ├── matakuliahService.js    # API CRUD Mata Kuliah & Last Code Query (BARU)
│   │   ├── perwalianService.js     # API Perwalian, Dynamic KRS, Approval & Scoped Export
│   │   └── userService.js          # API Kelola User & Spatie Roles
│   ├── store/
│   │   ├── authStore.js            # Zustand Auth Store (User, Token, Role, hasRole)
│   │   └── themeStore.js           # Zustand Dark Mode Store (localStorage persisted)
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
   Output build tersimpan di folder `dist/`.

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
- Validasi client-side menggunakan **Zod Schema**.
- Saat submit sukses, token Bearer dan objek User disimpan ke Zustand `authStore` dan `localStorage`.
- Toast sukses: *"Selamat datang kembali, [Nama User]!"*
- Toast error (Bahasa Indonesia): *"Kredensial email atau password yang Anda masukkan salah."*
- Mengarahkan otomatis ke `/dashboard`.

### B. Fitur Registrasi Administrator (`RegisterAdmin.jsx`)
- Mendaftarkan akun Administrator baru.
- Memvalidasi `name`, `email`, `password`, dan `password_confirmation`.

### C. Fitur Lupa Password (`ForgotPassword.jsx`)
- Mengirim email reset password ke alamat yang terdaftar.
- Menampilkan pesan informatif bahwa tautan hanya berlaku **5 menit**.

### D. Fitur Reset Password (`ResetPassword.jsx`)
- Memverifikasi keabsahan token sebelum menampilkan form reset.
- Jika token expired (> 5 menit), menampilkan pesan error dan meminta pengiriman ulang.
- Toast sukses: *"Password berhasil diperbarui! Silakan login dengan kata sandi baru."*

---

## 🛡️ 5. TUTORIAL MANAJEMEN RUTE & ROLE GUARDS

Lokasi Folder: **`src/routes/`**

### A. Route Guard Autentikasi (`ProtectedRoute.jsx`)
```jsx
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

### B. Role Permission Guard (`RoleRoute.jsx`)
Mencegah pengguna membuka rute yang bukan haknya. Jika role tidak diizinkan, otomatis dialihkan ke **halaman 403 Forbidden**:
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

### C. Penggunaan di AppRoutes
```jsx
// Hanya Admin yang bisa akses /matakuliah, /mahasiswa, /dosen
<Route element={<RoleRoute allowedRoles={['Admin']} />}>
  <Route path="/matakuliah" element={<MatakuliahListPage />} />
  <Route path="/mahasiswa" element={<MahasiswaListPage />} />
  <Route path="/dosen" element={<DosenListPage />} />
  <Route path="/settings/users" element={<UserManagementPage />} />
</Route>

// Admin & Dosen bisa akses /perwalian
<Route element={<RoleRoute allowedRoles={['Admin', 'Dosen', 'Mahasiswa']} />}>
  <Route path="/perwalian" element={<PerwalianListPage />} />
</Route>
```

### D. Pencegahan Active Link Bertabrakan (`Sidebar.jsx`)
Properti `end={item.path === '/settings' || item.path === '/dashboard'}` pada `<NavLink>` agar menu `/settings` tidak ikut aktif saat membuka `/settings/users`.

---

## ⚡ 6. TUTORIAL GLOBAL STATE MANAGEMENT (ZUSTAND)

Lokasi File: **`src/store/authStore.js`**

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
1. **Request Interceptor**: Token Bearer diambil dari `localStorage` dan dimasukkan ke header `Authorization`.
2. **Response Interceptor**: Jika backend mengembalikan HTTP `401`, sesi lokal dibersihkan dan halaman di-redirect ke `/login`.

```javascript
export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
- **Mutasi & Auto Invalidation**: Setelah menyimpan atau menghapus data, tabel otomatis me-refresh.

```javascript
// Query (Mengambil Data)
const { data, isLoading } = useQuery({
  queryKey: ['mahasiswa', page, search, prodiFilter],
  queryFn: () => mahasiswaService.getMahasiswa({ page, search, prodi: prodiFilter }),
});

// Mutasi (Simpan Data)
const saveMutation = useMutation({
  mutationFn: (formData) => selectedMhs
    ? mahasiswaService.updateMahasiswa(selectedMhs.id, formData)
    : mahasiswaService.createMahasiswa(formData),
  onSuccess: () => {
    toast.success(selectedMhs ? 'Data Mahasiswa berhasil diperbarui.' : 'Data Mahasiswa berhasil ditambahkan.');
    queryClient.invalidateQueries(['mahasiswa']); // Refresh otomatis
    setIsFormModalOpen(false);
  },
  onError: (err) => {
    const errorMsg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
      'Gagal menyimpan data mahasiswa.';
    toast.error(errorMsg);
  },
});
```

---

## 📊 9. TUTORIAL DASHBOARD MULTI-ROLE (ADMIN, DOSEN WALI, MAHASISWA)

Lokasi File: **`src/pages/dashboard/DashboardPage.jsx`**
Service: **`src/services/dashboardService.js`**

Tampilan dashboard bersifat adaptif sesuai role pengguna yang login:
1. **Tampilan Administrator**:
   - Kartu Metrik: Total Mahasiswa, Total Dosen Wali, Total Pengajuan Perwalian, Pending.
   - Grafik Bar Chart Statistik Per Semester & Donut Chart Rasio Status Persetujuan.
   - Linimasa Aktivitas Terkini (*Recent Activity Timeline*).
2. **Tampilan Dosen Wali**:
   - Kartu Kuota Bimbingan & Total Mahasiswa Bimbingan Aktif.
   - Antrian Perwalian yang membutuhkan review persetujuan.
3. **Tampilan Mahasiswa**:
   - Kartu Profil Dosen Wali Pembimbing Akademik (Nama, NIDN, Email, WhatsApp).
   - Informasi IPK Terakhir & Total SKS Lulus.
   - Status Pengajuan Perwalian Semester Aktif.

---

## 📈 10. TUTORIAL VISUALISASI GRAFIK ANALITIK (RECHARTS)

Lokasi File: **`src/components/dashboard/ChartCards.jsx`**

### A. Bar Chart (Pengajuan Per Semester)
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
1. **Pencarian Case-Insensitive**: Query string dikirim ke backend (diproses dengan `ILIKE` PostgreSQL).
2. **Filter Program Studi**: Dropdown `Teknik Informatika` atau `Sistem Informasi`.
3. **Pagination Tabel**: Kontrol *Sebelumnya* dan *Selanjutnya* berbasis metadata backend.
4. **Modal Form Tambah / Edit Mahasiswa**: Validasi NIM, Nama, Prodi, Angkatan, IPK, SKS, pilihan Dosen Wali.
5. **Modal Impor Massal JSON**: Tempel data array JSON untuk disimpan ke database secara massal.
6. **Reset Password Cepat**: Reset password mahasiswa ke default `Mahasiswa123` dari tabel.
7. **Hapus Data Terproteksi**: Modal konfirmasi SweetAlert2 sebelum menghapus data mahasiswa dan user terkait.
8. **Export Excel & PDF**: Download seluruh data mahasiswa ke file Excel atau PDF multi-halaman.

---

## 👨‍🏫 12. TUTORIAL KELOLA DATA DOSEN WALI & FITUR BULK ASSIGN WALI

Lokasi File: **`src/pages/dosen/DosenListPage.jsx`**
Service: **`src/services/dosenService.js`**

### Fitur Lengkap:
1. **CRUD Dosen Wali**: Kelola NIDN, Nama Lengkap, Gelar, Email, WhatsApp, dan Kuota Bimbingan.
2. **Fitur Bulk Assign Dosen Wali**:
   - Klik tombol **"Assign Wali"** pada baris dosen.
   - Modal menampilkan daftar mahasiswa yang belum dibimbing.
   - Admin memilih multi-checkbox lalu menyimpan penetapan sekaligus.
   - Toast sukses: *"Berhasil menugaskan [X] mahasiswa ke Dosen Wali [Nama Dosen]."*
3. **Reset Password Cepat**: Reset password dosen ke default `Dosen123`.
4. **Export Excel & PDF**: Download data seluruh dosen ke file Excel atau PDF.

---

## 📚 13. TUTORIAL MODUL MATA KULIAH: CRUD, KODE AUTO-SEQUENTIAL & DROPDOWN RUANGAN

Lokasi File: **`src/pages/matakuliah/MatakuliahListPage.jsx`**
Service: **`src/services/matakuliahService.js`**

> **MODUL BARU**: Halaman ini hanya dapat diakses oleh pengguna dengan role **Administrator**. Mahasiswa dan Dosen yang mencoba mengakses URL `/matakuliah` secara langsung akan diarahkan ke halaman **403 Forbidden**.

### A. Kode Mata Kuliah Auto-Sequential (Dropdown Cerdas)
Sistem secara otomatis mendeteksi kode terakhir berdasarkan kombinasi **Prodi** dan **Semester** yang dipilih, lalu menyarankan kode berikutnya:

```javascript
// Contoh logika di MatakuliahListPage.jsx
useEffect(() => {
  if (!formData.prodi || !formData.semester) return;

  const prefix = {
    'Teknik Informatika': 'IF',
    'Sistem Informasi': 'SI',
    'Umum (MKU)': 'MKU',
  }[formData.prodi] || 'MK';

  matakuliahService.getLastCode(formData.prodi, formData.semester)
    .then((lastCode) => {
      if (lastCode) {
        const lastNum = parseInt(lastCode.replace(/\D/g, '')) || 0;
        const nextNum = String(lastNum + 1).padStart(3, '0');
        setSuggestedCode(`${prefix}-${nextNum}`); // Contoh: "IF-304"
      } else {
        setSuggestedCode(`${prefix}-${formData.semester}01`); // Contoh: "IF-301"
      }
    });
}, [formData.prodi, formData.semester]);
```

**Tampilan Dropdown Kode:**
```
IF-304 ★ (Otomatis Berikutnya)
SI-304 ★ (Otomatis Berikutnya)
MKU-101 ★ (Otomatis Berikutnya)
--- Kustom ---
Ketik Kode Manual...
```

### B. Dropdown Ruangan Standar STMIK Bandung
Menggantikan input teks bebas dengan pilihan ruangan yang sudah standar:
```javascript
const RUANGAN_OPTIONS = [
  'Lab IF-1',
  'Lab IF-2',
  'Lab Multimedia',
  'Lab Jaringan',
  'Ruang 101',
  'Ruang 102',
  'Ruang 201',
  'Ruang 202',
  'Ruang 301',
  'Aula',
  'Ruang Seminar',
];
```

### C. Autocomplete Dosen Pengampu (`<datalist>`)
Field Dosen Pengampu menggunakan `<datalist>` HTML untuk memberikan saran nama dosen dari database master tanpa memaksakan pilihan (tetap bisa ketik manual untuk dosen baru):
```jsx
<input
  list="dosen-suggestions"
  value={formData.dosen_pengampu}
  onChange={(e) => setFormData({ ...formData, dosen_pengampu: e.target.value })}
  placeholder="Ketik nama dosen pengampu..."
/>
<datalist id="dosen-suggestions">
  {dosenList.map((d) => (
    <option key={d.id} value={d.nama_lengkap} />
  ))}
</datalist>
```

### D. Filter & Pencarian Mata Kuliah
- **Filter Prodi**: Dropdown filter Teknik Informatika / Sistem Informasi / Semua.
- **Filter Semester**: Dropdown filter Semester 1-8 / Semua.
- **Pencarian**: Pencarian real-time berdasarkan nama atau kode mata kuliah.

### E. Export Mata Kuliah
- **Export Excel**: Download data mata kuliah ke file `.xlsx`.
- **Export PDF**: Download laporan mata kuliah ke file `.pdf` berformat STMIK Bandung.

---

## 📝 14. TUTORIAL INTI PERWALIAN: BUILDER KRS MATAKULIAH DINAMIS & APPROVAL

Lokasi File: **`src/pages/perwalian/PerwalianListPage.jsx`**
Service: **`src/services/perwalianService.js`**

### A. Dynamic Course Row Builder (Mahasiswa)
```javascript
const totalSks = matakuliahList.reduce((acc, item) => acc + Number(item.sks || 0), 0);
```
- Tombol **`+ Tambah Matkul`**: Menambah baris baru ke array `matakuliahList`.
- Tombol **`🗑️`**: Menghapus baris tertentu dari array.
- Kolom: Kode Matkul, Nama Matkul, SKS (1–6), Kelas.
- **Total SKS** terhitung otomatis secara real-time.

### B. Aturan Proteksi Status Pending
- Tombol **Edit** dan **Hapus Pengajuan** hanya aktif jika status pengajuan masih `'Pending'`.
- Pengajuan `'Disetujui'` atau `'Ditolak'` tidak dapat diubah kembali.

### C. Modal Review & Catatan Evaluasi (Dosen Wali)
- Dosen membuka modal review untuk memeriksa rencana KRS mahasiswa bimbingannya.
- Memilih status (`Disetujui` / `Ditolak`) dan mengisi `catatan_dosen`.
- Keputusan langsung tersimpan dan memicu toast notifikasi serta audit log.

### D. Export Perwalian Scoped
```javascript
// Mahasiswa hanya bisa export datanya sendiri
// Dosen hanya bisa export mahasiswa bimbingannya
const handleExportExcel = async () => {
  const params = {};
  if (hasRole('Mahasiswa')) params.mahasiswa_id = user.mahasiswa?.id;
  if (hasRole('Dosen')) params.dosen_id = user.dosen?.id;

  const data = await perwalianService.exportExcel(params);
  if (!data || data.length === 0) {
    toast.warning('Belum ada data perwalian yang dapat diekspor.');
    return;
  }
  exportToExcel(rows, 'Rekap_Perwalian_STMIK_Bandung');
};
```

---

## 📜 15. TUTORIAL RIWAYAT BIMBINGAN & LINIMASA AUDIT TRAIL

Lokasi File: **`src/pages/riwayat/RiwayatPage.jsx`**

Menampilkan seluruh histori bimbingan dalam bentuk kartu linimasa (*timeline*) vertikal yang memuat:
- Nama & NIM Mahasiswa.
- Dosen Wali Pembimbing.
- Semester & Total SKS Rencana.
- **Badge Status** (`Disetujui` 🟢, `Pending` 🟡, `Ditolak` 🔴).
- Catatan / saran yang diberikan oleh Dosen Wali.
- Tanggal & waktu persetujuan diproses.

---

## 👤 16. TUTORIAL PROFIL PENGGUNA, FOTO UPLOAD & KARTU DOSEN WALI

Lokasi File: **`src/pages/profile/ProfilePage.jsx`**
Service: **`src/services/authService.js`**

### A. Form Update Profil
1. Memperbarui **Nama Lengkap**, **Email Resmi**, dan **Nomor Telepon/WhatsApp**.
2. Saat berhasil disimpan, state user di `authStore` dan `localStorage` langsung diperbarui secara instan.
3. Toast sukses: *"Informasi profil berhasil diperbarui!"*

### B. Upload Foto Profil
1. Klik area foto untuk memilih file gambar dari komputer.
2. Foto di-preview secara lokal sebelum diunggah.
3. Klik **"Simpan Foto"** untuk mengunggah ke server backend.
4. Toast sukses: *"Foto profil berhasil diunggah dan tersimpan!"*

### C. Kartu Dosen Wali Pembimbing (Khusus Mahasiswa)
Halaman Profil untuk pengguna Mahasiswa menampilkan kartu lengkap informasi **Dosen Wali Pembimbing Akademik**:
- Foto profil dosen.
- Nama lengkap & NIDN.
- Pendidikan terakhir.
- Email official.
- Nomor WhatsApp.
- Tempat & Tanggal Lahir.
- Alamat kantor/domisili (jika terisi).

---

## ⚙️ 17. TUTORIAL PENGATURAN & KELOLA USER/ROLE SPATIE (ADMIN ONLY)

Lokasi File:
- **Pengaturan Umum**: `src/pages/settings/SettingsPage.jsx`
- **Manajemen User & Role**: `src/pages/settings/UserManagementPage.jsx`
- **Service**: `src/services/userService.js`

### Fitur User Management (Khusus Administrator):
1. Daftar seluruh akun terdaftar beserta Role Spatie (`Admin`, `Dosen`, `Mahasiswa`).
2. **Tambah User Baru dengan Form Dinamis**:
   - Pilih **Role = Mahasiswa** → Muncul field: NIM, Program Studi, Tahun Angkatan, dan **Dropdown Dosen Wali**.
   - Pilih **Role = Dosen** → Muncul field: NIDN dan Gelar Akademik.
   - Pilih **Role = Admin** → Tidak ada field tambahan.
3. **Edit User**: Ubah nama, email, dan ganti role.
4. **Pencarian & Filter**: Cari user berdasarkan nama/email, filter berdasarkan role.
5. **Hapus User**: Konfirmasi SweetAlert2 sebelum menghapus akun beserta data terkait.

### Contoh Tampilan Form Dinamis:
```jsx
{selectedRole === 'Mahasiswa' && (
  <>
    <input placeholder="NIM Mahasiswa (contoh: 3200001)" ... />
    <select> {/* Pilihan Prodi */} </select>
    <input placeholder="Tahun Angkatan (contoh: 2023)" ... />
    <select> {/* Pilih Dosen Wali - opsional */}
      <option value="">— Belum ada Dosen Wali —</option>
      {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama_lengkap}</option>)}
    </select>
  </>
)}
{selectedRole === 'Dosen' && (
  <>
    <input placeholder="NIDN Dosen (contoh: 0123456789)" ... />
    <input placeholder="Gelar (contoh: S.Kom., M.T.)" ... />
  </>
)}
```

---

## 📥 18. TUTORIAL EKSPOR SELURUH DATA KE PDF MULTI-PAGE & FILE EXCEL

Lokasi File: **`src/utils/exportHelpers.js`**

### A. Ekspor ke File Excel (.xlsx)
```javascript
export const exportToExcel = (dataRows, fileName) => {
  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
```

### B. Ekspor ke Dokumen PDF Multi-Page (.pdf)
```javascript
export const exportToPDF = (headers, rows, title, fileName) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Header Resmi STMIK Bandung
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('STMIK BANDUNG', 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 40, 58);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} WIB`, 40, 72);

  // AutoTable Multi-Page
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 85,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
```

### C. Fitur Export Per Modul
| Modul | Excel | PDF | Scoped |
|:---|:---:|:---:|:---:|
| Data Mahasiswa | ✅ | ✅ | ❌ (Admin melihat semua) |
| Data Dosen | ✅ | ✅ | ❌ (Admin melihat semua) |
| Mata Kuliah | ✅ | ✅ | ❌ |
| Rekap Perwalian | ✅ | ✅ | ✅ (Scoped per role) |

---

## ✨ 19. TUTORIAL ANIMASI UI, TOAST NOTIFICATION & SWEETALERT2

### A. Toast Notification (Sonner)
Seluruh toast notification menggunakan **Bahasa Indonesia** yang sopan dan informatif:
```javascript
// Sukses
toast.success('Mata kuliah baru berhasil disimpan ke database!');
toast.success('Data Mahasiswa berhasil diperbarui.');
toast.success('Berhasil menugaskan 5 mahasiswa ke Dosen Wali Dr. Budi Santosa.');
toast.success('Foto profil berhasil diunggah dan tersimpan!');

// Error
toast.error('NIM sudah terdaftar dalam sistem.');
toast.error('Anda tidak memiliki hak akses untuk fitur ini.');
toast.error('Gagal menyimpan data mahasiswa.');

// Info
toast.info('Menyiapkan file Excel data dosen...');

// Warning
toast.warning('Belum ada data perwalian yang dapat diekspor.');
```

### B. SweetAlert2 Confirmation Dialog
```javascript
MySwal.fire({
  title: 'Hapus Data Mahasiswa?',
  text: `Apakah Anda yakin ingin menghapus data ${mhs.nama_lengkap} (${mhs.nim})? Akun user terkait juga akan terhapus.`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#ef4444',
  cancelButtonColor: '#64748b',
  confirmButtonText: 'Ya, Hapus Data',
  cancelButtonText: 'Batal',
});
```

### C. Error Handling yang Informatif
Setiap `onError` mutation menampilkan pesan yang relevan:
```javascript
onError: (err) => {
  const errorMsg =
    err.response?.data?.message ||                            // Pesan dari backend
    Object.values(err.response?.data?.errors || {})?.[0]?.[0] || // Pesan validasi pertama
    'Gagal menyimpan data. Silakan coba lagi.';               // Fallback
  toast.error(errorMsg);
},
```

---

## 🚫 20. TUTORIAL PENANGANAN HALAMAN ERROR (403, 404, 500)

Lokasi Folder: **`src/pages/errors/`**

1. **Error 403 Forbidden (`Error403.jsx`)**: Ditampilkan saat role pengguna tidak diizinkan membuka menu tertentu. Dilengkapi tombol **Kembali ke Dashboard** dan penjelasan bahwa fitur terbatas untuk role tertentu.

2. **Error 404 Not Found (`Error404.jsx`)**: Ditampilkan saat rute URL tidak ditemukan di sistem. Dilengkapi tombol kembali ke halaman utama.

3. **Error 500 Server Error (`Error500.jsx`)**: Ditampilkan saat terjadi kesalahan koneksi server. Dilengkapi tombol **Muat Ulang Halaman**.

> **Catatan Penting**: Jika pengguna mengetik URL halaman yang tidak sesuai dengan role-nya secara langsung di browser (misal Mahasiswa mengetik `/matakuliah`), `RoleRoute` akan mendeteksi dan mengarahkan otomatis ke halaman `Error403`.

---

## 🇮🇩 21. TUTORIAL NOTIFIKASI BAHASA INDONESIA TERPADU

Seluruh teks yang tampil kepada pengguna — baik dari frontend maupun yang dikembalikan backend — menggunakan **Bahasa Indonesia yang baku, sopan, dan mudah dipahami**:

### Peta Pesan Per Modul:

| Aksi | Pesan Toast |
|:---|:---|
| Login sukses | *"Selamat datang kembali, [Nama]!"* |
| Login gagal | *"Kredensial email atau password yang Anda masukkan salah."* |
| Email tidak terdaftar | *"Email tidak terdaftar dalam database sistem STMIK Bandung."* |
| Reset password sukses | *"Password berhasil diperbarui! Silakan login dengan kata sandi baru."* |
| Simpan matakuliah | *"Mata kuliah baru berhasil disimpan ke database!"* |
| Update matakuliah | *"Data mata kuliah berhasil diperbarui."* |
| Hapus matakuliah | *"Mata kuliah berhasil dihapus dari sistem."* |
| Kode matkul duplikat | *"Kode mata kuliah ini sudah terdaftar. Silakan gunakan kode lain."* |
| Simpan mahasiswa | *"Data Mahasiswa berhasil ditambahkan / diperbarui."* |
| Hapus mahasiswa | *"Data Mahasiswa berhasil dihapus."* |
| NIM duplikat | *"NIM sudah terdaftar dalam sistem."* |
| Assign dosen wali | *"Berhasil menugaskan [X] mahasiswa ke Dosen Wali [Nama]."* |
| Reset password mahasiswa | *"Password berhasil direset ke Mahasiswa123."* |
| Reset password dosen | *"Password berhasil direset ke Dosen123."* |
| Tambah user | *"Pengguna baru berhasil ditambahkan."* |
| Export kosong | *"Belum ada data perwalian yang dapat diekspor."* |
| Export sukses | *"Berhasil mengunduh [X] data ke Excel / PDF."* |
| Foto upload sukses | *"Foto profil berhasil diunggah dan tersimpan!"* |
| Profil update | *"Informasi profil berhasil diperbarui!"* |
| Pengajuan perwalian | *"Pengajuan perwalian berhasil dikirim!"* |
| Perwalian disetujui | *"Perwalian berhasil disetujui dan ditandai selesai."* |
| Sesi berakhir (401) | *"Sesi login Anda telah berakhir. Silakan login kembali."* |
| Tidak punya akses (403) | *"Anda tidak memiliki hak akses untuk membuka halaman atau fitur ini."* |
| Data tidak ditemukan (404) | *"Data yang Anda cari tidak ditemukan di dalam sistem."* |
