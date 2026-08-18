<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Perwalian;
use App\Models\PerwalianLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

/**
 * Class DatabaseSeeder
 * Seeder utama untuk mengisi dummy data awal Sistem Perwalian STMIK Bandung:
 * - Roles & Permissions (Admin, Dosen, Mahasiswa)
 * - 1 Akun Admin
 * - 5 Akun Dosen Wali
 * - 50 Akun Mahasiswa
 * - 100 Transaksi Perwalian & Audit Log Histori
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Inisialisasi Role & Permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $dosenRole = Role::firstOrCreate(['name' => 'Dosen']);
        $mhsRole = Role::firstOrCreate(['name' => 'Mahasiswa']);

        // 2. Buat 1 Akun Admin
        $adminUser = User::create([
            'name' => 'Administrator STMIK Bandung',
            'email' => 'admin@stmikbandung.ac.id',
            'password' => bcrypt('Admin123!'),
            'phone_number' => '081234567890',
            'is_active' => true,
        ]);
        $adminUser->assignRole($adminRole);

        // 3. Buat 5 Dosen Wali STMIK Bandung
        $dosenData = [
            ['nidn' => '0401018501', 'nama' => 'Dr. Irwan Setiawan, M.T.', 'gelar' => 'M.T.', 'email' => 'dosen1@stmikbandung.ac.id'],
            ['nidn' => '0412058802', 'nama' => 'Hj. Nurasiah, M.Kom.', 'gelar' => 'M.Kom.', 'email' => 'dosen2@stmikbandung.ac.id'],
            ['nidn' => '0420087903', 'nama' => 'Budi Raharjo, Ph.D.', 'gelar' => 'Ph.D.', 'email' => 'dosen3@stmikbandung.ac.id'],
            ['nidn' => '0415119004', 'nama' => 'Rina Andriani, S.Kom., M.T.', 'gelar' => 'M.T.', 'email' => 'dosen4@stmikbandung.ac.id'],
            ['nidn' => '0408038305', 'nama' => 'Ahmad Fauzi, M.Si.', 'gelar' => 'M.Si.', 'email' => 'dosen5@stmikbandung.ac.id'],
        ];

        $dosenModels = [];
        foreach ($dosenData as $idx => $d) {
            $user = User::create([
                'name' => $d['nama'],
                'email' => $d['email'],
                'password' => bcrypt('Dosen123!'),
                'phone_number' => '08219988'.(1000 + $idx),
                'is_active' => true,
            ]);
            $user->assignRole($dosenRole);

            $dosenModels[] = Dosen::create([
                'user_id' => $user->id,
                'nidn' => $d['nidn'],
                'nama_lengkap' => $d['nama'],
                'gelar' => $d['gelar'],
                'email' => $d['email'],
                'no_hp' => '08219988'.(1000 + $idx),
                'kuota_bimbingan' => 30,
            ]);
        }

        // 4. Buat 50 Mahasiswa
        $prodiList = ['Teknik Informatika', 'Sistem Informasi'];
        $angkatanList = ['2021', '2022', '2023', '2024', '2025'];
        $namaDepan = ['Aditya', 'Bagus', 'Citra', 'Dian', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko', 'Kiki', 'Lestari', 'Maya', 'Nugroho', 'Oki', 'Putri', 'Qori', 'Rian', 'Sari', 'Taufik', 'Umar', 'Vina', 'Wahyu', 'Xenia', 'Yusuf', 'Zahra'];
        $namaBelakang = ['Pratama', 'Santoso', 'Wibowo', 'Kusuma', 'Saputra', 'Permana', 'Hidayat', 'Ramadhan', 'Utami', 'Wijaya', 'Susanto', 'Suryani'];

        $mahasiswaModels = [];
        for ($i = 1; $i <= 50; $i++) {
            $nim = '32'.str_pad($i, 6, '0', STR_PAD_LEFT);
            $nama = $namaDepan[($i - 1) % count($namaDepan)].' '.$namaBelakang[($i - 1) % count($namaBelakang)];
            $email = "mhs{$i}@student.stmikbandung.ac.id";
            $prodi = $prodiList[$i % 2];
            $angkatan = $angkatanList[$i % 5];
            $dosenWali = $dosenModels[($i - 1) % 5];

            $user = User::create([
                'name' => $nama,
                'email' => $email,
                'password' => bcrypt('Mahasiswa123!'),
                'phone_number' => '0857123'.str_pad($i, 5, '0', STR_PAD_LEFT),
                'is_active' => true,
            ]);
            $user->assignRole($mhsRole);

            $mahasiswaModels[] = Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $nim,
                'nama_lengkap' => $nama,
                'prodi' => $prodi,
                'angkatan' => $angkatan,
                'dosen_wali_id' => $dosenWali->id,
                'ipk_terakhir' => round(2.80 + (($i * 7) % 120) / 100, 2),
                'sks_lulus' => 18 * (date('Y') - (int) $angkatan + 1),
            ]);
        }

        // 5. Buat 100 Data Perwalian
        $semesters = ['2024/2025 Ganjil', '2024/2025 Genap', '2025/2026 Ganjil', '2025/2026 Genap'];
        $statusOptions = ['Disetujui', 'Pending', 'Ditolak', 'Disetujui'];

        $sampleMatkul = [
            ['kode' => 'IF-101', 'nama' => 'Algoritma & Pemrograman', 'sks' => 4, 'kelas' => 'IF-A'],
            ['kode' => 'IF-102', 'nama' => 'Basis Data Enterprise', 'sks' => 3, 'kelas' => 'IF-A'],
            ['kode' => 'IF-103', 'nama' => 'Pemrograman Web Framework', 'sks' => 3, 'kelas' => 'IF-B'],
            ['kode' => 'IF-104', 'nama' => 'Arsitektur Perangkat Lunak', 'sks' => 3, 'kelas' => 'IF-A'],
            ['kode' => 'IF-105', 'nama' => 'Kecerdasan Buatan', 'sks' => 3, 'kelas' => 'IF-C'],
            ['kode' => 'SI-201', 'nama' => 'Analisis Perancangan Sistem', 'sks' => 3, 'kelas' => 'SI-A'],
            ['kode' => 'SI-202', 'nama' => 'Manajemen Proyek TI', 'sks' => 3, 'kelas' => 'SI-B'],
        ];

        for ($p = 1; $p <= 100; $p++) {
            $mhs = $mahasiswaModels[($p - 1) % 50];
            $semester = $semesters[($p - 1) % 4];
            $status = $statusOptions[($p - 1) % 4];

            $selectedMatkul = array_slice($sampleMatkul, ($p % 3), 4);
            $totalSks = array_sum(array_column($selectedMatkul, 'sks'));

            $perwalian = Perwalian::create([
                'mahasiswa_id' => $mhs->id,
                'dosen_id' => $mhs->dosen_wali_id ?? $dosenModels[0]->id,
                'semester' => $semester,
                'ipk_semester' => round(3.00 + ($p % 90) / 100, 2),
                'sks_diambil' => $totalSks,
                'matakuliah_rencana' => $selectedMatkul,
                'catatan_mahasiswa' => "Pengajuan perwalian semester {$semester}. Mohon bimbingannya Bapak/Ibu.",
                'catatan_dosen' => $status === 'Disetujui' ? 'Rencana studi telah sesuai standar kurikulum. Disetujui.' : ($status === 'Ditolak' ? 'Jumlah SKS melebihi batas batas maksimum IPK. Silakan revisi.' : null),
                'status' => $status,
                'tgl_persetujuan' => $status !== 'Pending' ? now()->subDays(105 - $p) : null,
                'created_at' => now()->subDays(110 - $p),
            ]);

            // Audit Log
            PerwalianLog::create([
                'perwalian_id' => $perwalian->id,
                'user_id' => $mhs->user_id,
                'status_sebelumnya' => null,
                'status_baru' => 'Pending',
                'catatan' => 'Pengajuan perwalian baru oleh Mahasiswa.',
                'created_at' => now()->subDays(110 - $p),
            ]);

            if ($status !== 'Pending') {
                PerwalianLog::create([
                    'perwalian_id' => $perwalian->id,
                    'user_id' => $mhs->dosenWali?->user_id ?? $dosenModels[0]->user_id,
                    'status_sebelumnya' => 'Pending',
                    'status_baru' => $status,
                    'catatan' => $perwalian->catatan_dosen,
                    'created_at' => now()->subDays(105 - $p),
                ]);
            }
        }
    }
}
