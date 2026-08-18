# 📘 MASTER TUTORIAL & DOKUMENTASI LENGKAP BACKEND (LARAVEL 10 / PHP 8.1 API)

**Sistem Pencatatan Perwalian Mahasiswa STMIK Bandung**

Dokumen ini merupakan **Buku Panduan Teknis & Tutorial Komprehensif** untuk seluruh arsitektur, fitur, dan komponen yang ada di Backend Laravel 10. Dibuat dengan standar industri *software house* menggunakan **Clean Architecture (Repository & Service Pattern)**, **PostgreSQL**, **Laravel Sanctum**, **Spatie Permission**, **Swagger OpenAPI**, dan **PHPUnit Test**.

---

## 📑 DAFTAR ISI TUTORIAL BACKEND

1. [Arsitektur Clean Architecture & Alur Eksekusi Kode](#1-arsitektur-clean-architecture--alur-eksekusi-kode)
2. [Panduan Instalasi & Konfigurasi Lingkungan (Environment)](#2-panduan-instalasi--konfigurasi-lingkungan-environment)
3. [Tutorial Database PostgreSQL, Migrasi & Seeder Data](#3-tutorial-database-postgresql-migrasi--seeder-data)
4. [Tutorial Autentikasi Sanctum & Role Permission Spatie](#4-tutorial-autentikasi-sanctum--role-permission-spatie)
5. [Tutorial Lapisan Repository & Service Pattern (Aturan Bisnis)](#5-tutorial-lapisan-repository--service-pattern-aturan-bisnis)
6. [Tutorial Validasi Form Request & JSON API Transformer (Resource)](#6-tutorial-validasi-form-request--json-api-transformer-resource)
7. [Tutorial Alur Kerja (Workflow) Inti Perwalian & Audit Log](#7-tutorial-alur-kerja-workflow-inti-perwalian--audit-log)
8. [Tutorial Lengkap Swagger OpenAPI (Install, Anotasi, UI Web)](#8-tutorial-lengkap-swagger-openapi-install-anotasi-ui-web)
9. [Tutorial Pengujian Otomatis (PHPUnit Feature Tests)](#9-tutorial-pengujian-otomatis-phpunit-feature-tests)
10. [Standar Format Kode & Penanganan Error Terpusat](#10-standar-format-kode--penanganan-error-terpusat)

---

## 🏛️ 1. ARSITEKTUR CLEAN ARCHITECTURE & ALUR EKSEKUSI KODE

Aplikasi tidak menumpuk logika di Controller, melainkan membaginya menjadi lapisan-lapisan independen (*Separation of Concerns*):

```
[HTTP Request dari Frontend/Postman/Swagger]
         │
         ▼
[1. Routes (routes/api.php)] ──▶ Menerapkan Middleware (Sanctum, Role Spatie)
         │
         ▼
[2. Form Requests (app/Http/Requests/)] ──▶ Validasi format input, tipe data, & rule Zod-equivalent
         │
         ▼
[3. Controllers (app/Http/Controllers/Api/v1/)] ──▶ Menerima request & memanggil Service
         │
         ▼
[4. Services Layer (app/Services/)] ──▶ Aturan Bisnis Inti (Validasi status Pending, Log Audit, dll)
         │
         ▼
[5. Repositories Layer (app/Repositories/Eloquent/)] ──▶ Query Database (ILIKE search, Eloquent ORM)
         │
         ▼
[6. Eloquent Models (app/Models/)] ──▶ Representasi Tabel PostgreSQL
         │
         ▼
[7. API Resources (app/Http/Resources/)] ──▶ Transformasi struktur JSON standar
         │
         ▼
[HTTP Response JSON 200/201/422/403 ke Frontend]
```

### Lokasi File-File Arsitektur:
- **Routes**: `routes/api.php`
- **Controllers**: `app/Http/Controllers/Api/v1/` (`AuthController.php`, `DashboardController.php`, `DosenController.php`, `MahasiswaController.php`, `PerwalianController.php`, `UserController.php`, `ExportImportController.php`)
- **Services**: `app/Services/` (`AuthService.php`, `DosenService.php`, `MahasiswaService.php`, `PerwalianService.php`, `UserService.php`, `ExportImportService.php`)
- **Interfaces**: `app/Interfaces/` (`AuthRepositoryInterface.php`, `DosenRepositoryInterface.php`, `MahasiswaRepositoryInterface.php`, `PerwalianRepositoryInterface.php`, `UserRepositoryInterface.php`)
- **Repositories**: `app/Repositories/Eloquent/` (`AuthRepository.php`, `DosenRepository.php`, `MahasiswaRepository.php`, `PerwalianRepository.php`, `UserRepository.php`)
- **Providers**: `app/Providers/RepositoryServiceProvider.php` (Menghubungkan Interface dengan Implementasi Repository di IoC Container)
- **Traits**: `app/Traits/ApiResponseTrait.php` (Standarisasi response JSON API)

---

## ⚙️ 2. PANDUAN INSTALASI & KONFIGURASI LINGKUNGAN (ENVIRONMENT)

### Langkah 1: Kebutuhan Sistem Operasi
- PHP 8.1.10+
- Ekstensi PHP yang wajib aktif di `php.ini`:
  `extension=pdo_pgsql`, `extension=pgsql`, `extension=mbstring`, `extension=openssl`, `extension=curl`, `extension=fileinfo`, `extension=gd`, `extension=zip`
- PostgreSQL 18.x running pada port `5432`
- Composer 2.x

### Langkah 2: Install Dependensi
```bash
cd backend
composer install
```

### Langkah 3: Konfigurasi File `.env`
Buka file `backend/.env` dan pastikan konfigurasi berikut terisi:
```env
APP_NAME="Perwalian STMIK Bandung"
APP_ENV=local
APP_KEY=base64:X5Hajtsl5D8xhPjuJ5qNTYEvccSY0wsUAWM7HF4QG/8=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
L5_SWAGGER_CONST_HOST=http://127.0.0.1:8000/api/v1

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=db_perwalian_stmik
DB_USERNAME=postgres
DB_PASSWORD=
```

---

## 🗄️ 3. TUTORIAL DATABASE POSTGRESQL, MIGRASI & SEEDER DATA

### A. Konsep Relasi Antar Tabel
1. `users`: Menyimpan kredensial login (Email, Password hash, Phone, Status Aktif).
2. `roles & permissions` (Spatie): Menyimpan hak akses `Admin`, `Dosen`, dan `Mahasiswa`.
3. `dosen`: Terhubung 1-to-1 dengan `users` (NIDN, Nama, Gelar, Kuota Bimbingan).
4. `mahasiswa`: Terhubung 1-to-1 dengan `users` dan Foreign Key `dosen_wali_id` ke tabel `dosen`.
5. `perwalian`: Foreign Key ke `mahasiswa_id` dan `dosen_id`, menyimpan semester, IPK, SKS, data rencana matakuliah (JSON format), status (`Pending`, `Disetujui`, `Ditolak`), serta catatan mahasiswa & dosen.
6. `perwalian_logs`: Menyimpan jejak histori perubahan status perwalian (*audit trail*).

### B. Menjalankan Migrasi & Seeder Lengkap
Jalankan satu perintah ini di terminal:
```bash
php artisan migrate:fresh --seed
```

### C. Data Seeder Siap Pakai untuk Testing:
- **1 Akun Admin**: `admin@stmikbandung.ac.id` | Password: `Admin123!`
- **5 Dosen Wali**: `dosen1@stmikbandung.ac.id` s.d `dosen5@stmikbandung.ac.id` | Password: `Dosen123!`
- **50 Mahasiswa**: `mhs1@student.stmikbandung.ac.id` s.d `mhs50@student.stmikbandung.ac.id` | Password: `Mahasiswa123!`
- **100 Transaksi Perwalian** dengan status bervariasi (Disetujui, Pending, Ditolak) beserta audit log.

---

## 🔐 4. TUTORIAL AUTENTIKASI SANCTUM & ROLE PERMISSION SPATIE

### A. Autentikasi Laravel Sanctum
Sanctum menghasilkan Bearer Token unik setiap kali pengguna berhasil login via endpoint `POST /api/v1/auth/login`.

- **Masa Berlaku Token**: Disimpan di tabel `personal_access_tokens`.
- **Penggunaan Token**: Setiap request API ke route terproteksi wajib menyertakan header:
  ```http
  Authorization: Bearer 1|abcdef123456...
  ```
- **Logout**: Endpoint `POST /api/v1/auth/logout` akan menghapus token saat ini dari database.

### B. Proteksi Route Berdasarkan Role Spatie
Di file `routes/api.php`, rute dikelompokkan menggunakan middleware `role:Admin`, `role:Dosen`, atau `role:Mahasiswa`:

```php
// Rute Khusus Administrator
Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::post('dosen/assign-wali', [DosenController::class, 'assignWali']);
    Route::post('mahasiswa/import', [MahasiswaController::class, 'import']);
});

// Rute Khusus Dosen Wali
Route::middleware(['auth:sanctum', 'role:Dosen'])->group(function () {
    Route::post('perwalian/{id}/approve-reject', [PerwalianController::class, 'approveReject']);
});
```

---

## 🧩 5. TUTORIAL LAPISAN REPOSITORY & SERVICE PATTERN

### Mengapa Menggunakan Pattern Ini?
1. **Repository Pattern**: Mengisolasi operasi database. Jika ingin mengganti query atau menambahkan caching, cukup ubah di Repository tanpa menyentuh Controller.
2. **Service Pattern**: Menyimpan logika bisnis. Controller hanya bertugas menerima input dan mengembalikan output JSON.

### Contoh Implementasi:
**Interface (`app/Interfaces/MahasiswaRepositoryInterface.php`)**:
```php
namespace App\Interfaces;

interface MahasiswaRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10);
    public function findById(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
}
```

**Implementasi Repository (`app/Repositories/Eloquent/MahasiswaRepository.php`)**:
Menggunakan operator **`ILIKE`** agar pencarian nama/NIM di PostgreSQL bersifat *Case-Insensitive* (tidak membedakan huruf besar/kecil):
```php
public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
{
    $query = Mahasiswa::with(['user', 'dosenWali']);

    if (!empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
            $q->where('nama_lengkap', 'ilike', "%{$search}%")
              ->orWhere('nim', 'ilike', "%{$search}%");
        });
    }

    return $query->paginate($perPage);
}
```

**Registrasi Binding di IoC Container (`app/Providers/RepositoryServiceProvider.php`)**:
```php
public function register(): void
{
    $this->app->bind(MahasiswaRepositoryInterface::class, MahasiswaRepository::class);
    $this->app->bind(PerwalianRepositoryInterface::class, PerwalianRepository::class);
    $this->app->bind(DosenRepositoryInterface::class, DosenRepository::class);
    $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
}
```

---

## 📋 6. TUTORIAL VALIDASI FORM REQUEST & JSON API RESOURCE

### A. Validasi Input Terpisah (Form Requests)
Lokasi: `app/Http/Requests/Perwalian/StorePerwalianRequest.php`  
Setiap input divalidasi dengan pesan kesalahan berbahasa Indonesia yang jelas:

```php
public function rules(): array
{
    return [
        'semester' => ['required', 'string', 'max:50'],
        'ipk_semester' => ['required', 'numeric', 'min:0.00', 'max:4.00'],
        'sks_diambil' => ['required', 'integer', 'min:1', 'max:24'],
        'matakuliah_rencana' => ['required', 'array', 'min:1'],
        'matakuliah_rencana.*.kode' => ['required', 'string'],
        'matakuliah_rencana.*.nama' => ['required', 'string'],
        'matakuliah_rencana.*.sks' => ['required', 'integer', 'min:1', 'max:6'],
        'catatan_mahasiswa' => ['nullable', 'string', 'max:500'],
    ];
}
```

### B. Standardisasi JSON Output (API Resources)
Lokasi: `app/Http/Resources/PerwalianResource.php`  
Memastikan output JSON selalu rapi dan konsisten:

```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'semester' => $this->semester,
        'ipk_semester' => (string) $this->ipk_semester,
        'sks_diambil' => (int) $this->sks_diambil,
        'matakuliah_rencana' => $this->matakuliah_rencana,
        'status' => $this->status,
        'catatan_mahasiswa' => $this->catatan_mahasiswa,
        'catatan_dosen' => $this->catatan_dosen,
        'tgl_persetujuan' => $this->tgl_persetujuan ? $this->tgl_persetujuan->toISOString() : null,
        'mahasiswa' => new MahasiswaResource($this->whenLoaded('mahasiswa')),
        'dosen' => new DosenResource($this->whenLoaded('dosen')),
    ];
}
```

---

## 🔄 7. TUTORIAL ALUR KERJA (WORKFLOW) INTI PERWALIAN & AUDIT LOG

Lokasi File: **`app/Services/PerwalianService.php`**

### A. Aturan Bisnis Workflow Perwalian:
1. **Pengajuan Perwalian (Mahasiswa)**:
   - Mahasiswa hanya bisa mengajukan perwalian jika sudah memiliki Dosen Wali.
   - SKS yang diajukan dihitung dari total array `matakuliah_rencana`.
   - Status awal otomatis disetel menjadi `'Pending'`.
2. **Edit & Hapus Pengajuan**:
   - Mahasiswa **HANYA** boleh mengedit atau membatalkan pengajuan saat statusnya masih `'Pending'`.
   - Jika status sudah `'Disetujui'` atau `'Ditolak'`, sistem akan melempar exception:
     ```php
     if ($perwalian->status !== 'Pending') {
         throw ValidationException::withMessages([
             'status' => ['Perwalian yang sudah diproses tidak dapat diubah atau dihapus.'],
         ]);
     }
     ```
3. **Persetujuan / Penolakan (Dosen Wali)**:
   - Dosen Wali mereview pengajuan mahasiswa bimbingannya.
   - Dosen mengisi keputusan (`Disetujui` / `Ditolak`) beserta `catatan_dosen`.
   - Sistem secara otomatis mencatat riwayat perubahan status ke tabel `perwalian_logs` sebagai jejak audit.

---

### B. Tutorial Fitur Operasi Massal (Bulk Operations & Import/Export Data)

1. **Penetapan Dosen Wali Massal (`DosenService::assignWali`)**:
   - Lokasi: `app/Services/DosenService.php`
   - Memungkinkan Admin memilih banyak ID mahasiswa sekaligus (`mahasiswa_ids = [1, 2, 3, ...]`) dan mengaitkannya ke satu Dosen Wali:
     ```php
     public function assignWali(array $data): bool
     {
         return Mahasiswa::whereIn('id', $data['mahasiswa_ids'])
             ->update(['dosen_wali_id' => $data['dosen_id']]);
     }
     ```
2. **Impor Massal Data Mahasiswa (`MahasiswaService::importMahasiswa`)**:
   - Lokasi: `app/Services/MahasiswaService.php`
   - Menerima payload array data JSON / Excel, membuat akun User otomatis jika belum ada, dan memasukkan data mahasiswa ke tabel PostgreSQL.
3. **Ekspor Data Rekapitulasi (`ExportImportService::exportPerwalianData`)**:
   - Lokasi: `app/Services/ExportImportService.php`
   - Menyiapkan data rekap tabular untuk di-download ke format file spreadsheet dan PDF.

---

## 📖 8. TUTORIAL LENGKAP SWAGGER OPENAPI (INSTALL, ANOTASI, UI WEB)

### ❓ Apakah Butuh Menulis File HTML Manual untuk Swagger?
> **TIDAK BUTUH HTML MANUAL.**  
> Package `darkaonline/l5-swagger` secara otomatis menghasilkan tampilan antarmuka web interaktif melalui Blade View bawaan. Kita hanya perlu menulis komentar anotasi PHP di Controller!

### 🛠️ Langkah-Langkah Lengkap Setup Swagger:

#### Step 1: Install Package
```bash
composer require "darkaonline/l5-swagger:^8.6"
```

#### Step 2: Publish Konfigurasi
```bash
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
```

#### Step 3: Pasang Anotasi Root di Base Controller (`app/Http/Controllers/Controller.php`)
```php
/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="API Sistem Perwalian Mahasiswa STMIK Bandung",
 *     description="Dokumentasi REST API Enterprise Sistem Perwalian Mahasiswa STMIK Bandung.",
 *     @OA\Contact(email="admin@stmikbandung.ac.id")
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api/v1",
 *     description="Server API Lokal STMIK Bandung"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Masukkan token Bearer Sanctum (Contoh: 'Bearer {token}')"
 * )
 */
class Controller extends BaseController { ... }
```

#### Step 4: Pasang Anotasi Endpoint pada Controller Method
Contoh pada `app/Http/Controllers/Api/v1/PerwalianController.php`:
```php
/**
 * @OA\Get(
 *     path="/perwalian",
 *     summary="Daftar Data Perwalian",
 *     description="Mengambil daftar perwalian dengan filter status, semester, dan pagination.",
 *     tags={"Perwalian"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="status", in="query", required=false, description="Pending / Disetujui / Ditolak"),
 *     @OA\Parameter(name="semester", in="query", required=false, description="Contoh: 2025/2026 Ganjil"),
 *     @OA\Parameter(name="page", in="query", required=false, example=1),
 *     @OA\Response(response=200, description="Daftar perwalian berhasil diambil")
 * )
 */
public function index(Request $request): JsonResponse { ... }
```

#### Step 5: Generate File Dokumentasi
Jalankan perintah ini setiap kali ada perubahan anotasi:
```bash
php artisan l5-swagger:generate
```

#### Step 6: Akses & Testing Swagger UI di Browser
1. Jalankan `php artisan serve --port=8000`.
2. Buka link: **[http://127.0.0.1:8000/api/documentation](http://127.0.0.1:8000/api/documentation)**.
3. Klik tombol hijau **"Authorize"** 🔓 di kanan atas, masukkan token Bearer Sanctum, dan klik **"Authorize"**. Semua endpoint siap diuji langsung!

---

## 🧪 9. TUTORIAL PENGUJIAN OTOMATIS (PHPUNIT FEATURE TESTS)

Lokasi Folder: **`backend/tests/Feature/`**

### Skenario Pengujian yang Dibuat:
1. `AuthenticationTest.php`: Menguji login valid, login invalid password, dan profile me.
2. `MahasiswaCrudTest.php`: Menguji CRUD Mahasiswa oleh Admin dan filtering prodi.
3. `PerwalianWorkflowTest.php`: Menguji pengajuan perwalian baru, proteksi edit status Disetujui, dan approval dosen wali.
4. `PermissionTest.php`: Menguji bahwa Mahasiswa mendapat error 403 Forbidden saat membuka menu kelola user Admin.

### Menjalankan Pengujian:
```bash
vendor/bin/phpunit
```
*Seluruh pengujian berjalan cepat menggunakan database in-memory SQLite yang dikonfigurasi pada file `phpunit.xml`.*

---

## 🧹 10. STANDAR FORMAT KODE & PENANGANAN ERROR TERPUSAT

### A. Format Otomatis dengan Laravel Pint
Untuk memastikan kode selalu rapi sesuai standar PSR-12:
```bash
vendor/bin/pint
```

### B. Trait Respon API Standar (`app/Traits/ApiResponseTrait.php`)
Semua controller mengembalikan format JSON yang seragam:
```php
trait ApiResponseTrait
{
    public function successResponse($data = null, string $message = 'Berhasil', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public function errorResponse(string $message = 'Terjadi kesalahan', int $code = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
```
