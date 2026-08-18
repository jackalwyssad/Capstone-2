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
 * - 1 Akun Admin  (password: Admin123)
 * - 5 Akun Dosen Wali (password: Dosen123)
 * - 20 Akun Mahasiswa  (password: Mahasiswa123)
 * - Data Transaksi Perwalian & Audit Log Histori
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Inisialisasi Role & Permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $dosenRole = Role::firstOrCreate(['name' => 'Dosen']);
        $mhsRole   = Role::firstOrCreate(['name' => 'Mahasiswa']);

        // 2. Buat 1 Akun Admin
        $adminUser = User::create([
            'name'         => 'Administrator STMIK Bandung',
            'email'        => 'admin@stmikbandung.ac.id',
            'password'     => bcrypt('Admin123'),
            'phone_number' => '081234567890',
            'is_active'    => true,
        ]);
        $adminUser->assignRole($adminRole);

        // 3. Buat 5 Dosen Wali STMIK Bandung
        $dosenData = [
            ['nidn' => '0401018501', 'nama' => 'Dr. Irwan Setiawan, M.T.',     'gelar' => 'M.T.',   'email' => 'dosen1@stmikbandung.ac.id', 'no_hp' => '082199881001'],
            ['nidn' => '0412058802', 'nama' => 'Hj. Nurasiah, M.Kom.',          'gelar' => 'M.Kom.', 'email' => 'dosen2@stmikbandung.ac.id', 'no_hp' => '082199881002'],
            ['nidn' => '0420087903', 'nama' => 'Budi Raharjo, Ph.D.',           'gelar' => 'Ph.D.',  'email' => 'dosen3@stmikbandung.ac.id', 'no_hp' => '082199881003'],
            ['nidn' => '0415119004', 'nama' => 'Rina Andriani, S.Kom., M.T.',  'gelar' => 'M.T.',   'email' => 'dosen4@stmikbandung.ac.id', 'no_hp' => '082199881004'],
            ['nidn' => '0408038305', 'nama' => 'Ahmad Fauzi, M.Si.',            'gelar' => 'M.Si.',  'email' => 'dosen5@stmikbandung.ac.id', 'no_hp' => '082199881005'],
        ];

        $dosenModels = [];
        foreach ($dosenData as $d) {
            $user = User::create([
                'name'         => $d['nama'],
                'email'        => $d['email'],
                'password'     => bcrypt('Dosen123'),
                'phone_number' => $d['no_hp'],
                'is_active'    => true,
            ]);
            $user->assignRole($dosenRole);

            $dosenModels[] = Dosen::create([
                'user_id'          => $user->id,
                'nidn'             => $d['nidn'],
                'nama_lengkap'     => $d['nama'],
                'gelar'            => $d['gelar'],
                'email'            => $d['email'],
                'no_hp'            => $d['no_hp'],
                'kuota_bimbingan'  => 30,
            ]);
        }

        // 4. Buat 20 Mahasiswa dengan nama asli
        $mahasiswaData = [
            ['nim' => '3200001', 'nama' => 'Aditya Pratama',       'prodi' => 'Teknik Informatika', 'angkatan' => '2022'],
            ['nim' => '3200002', 'nama' => 'Bagus Santoso',        'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '3200003', 'nama' => 'Citra Wibowo',         'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3200004', 'nama' => 'Dian Kusuma',          'prodi' => 'Sistem Informasi',   'angkatan' => '2023'],
            ['nim' => '3200005', 'nama' => 'Eko Saputra',          'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3200006', 'nama' => 'Fajar Permana',        'prodi' => 'Sistem Informasi',   'angkatan' => '2021'],
            ['nim' => '3200007', 'nama' => 'Gita Hidayat',         'prodi' => 'Teknik Informatika', 'angkatan' => '2024'],
            ['nim' => '3200008', 'nama' => 'Hendra Ramadhan',      'prodi' => 'Sistem Informasi',   'angkatan' => '2024'],
            ['nim' => '3200009', 'nama' => 'Indah Utami',          'prodi' => 'Teknik Informatika', 'angkatan' => '2022'],
            ['nim' => '3200010', 'nama' => 'Joko Wijaya',          'prodi' => 'Sistem Informasi',   'angkatan' => '2023'],
            ['nim' => '3200011', 'nama' => 'Kiki Susanto',         'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3200012', 'nama' => 'Lestari Suryani',      'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '3200013', 'nama' => 'Maya Anggraeni',       'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3200014', 'nama' => 'Nugroho Prabowo',      'prodi' => 'Sistem Informasi',   'angkatan' => '2024'],
            ['nim' => '3200015', 'nama' => 'Oki Firmansyah',       'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3200016', 'nama' => 'Putri Rahayu',         'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '3200017', 'nama' => 'Rizky Maulana',        'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3200018', 'nama' => 'Sari Dewi',            'prodi' => 'Sistem Informasi',   'angkatan' => '2021'],
            ['nim' => '3200019', 'nama' => 'Taufik Hidayatullah',  'prodi' => 'Teknik Informatika', 'angkatan' => '2024'],
            ['nim' => '3200020', 'nama' => 'Wahyu Setiawan',       'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
        ];

        $ipkSamples  = [3.85, 3.42, 3.67, 2.95, 3.78, 3.10, 3.55, 3.90, 2.88, 3.33,
                        3.71, 3.48, 3.62, 3.20, 3.80, 3.05, 3.45, 3.75, 3.15, 3.60];

        $mahasiswaModels = [];
        foreach ($mahasiswaData as $idx => $mhsItem) {
            $nimSlug    = strtolower(str_replace(' ', '.', $mhsItem['nama']));
            $email      = "{$mhsItem['nim']}@student.stmikbandung.ac.id";
            $dosenWali  = $dosenModels[$idx % 5];
            $sksByAngk  = ['2021' => 96, '2022' => 72, '2023' => 48, '2024' => 24];
            $sksLulus   = $sksByAngk[$mhsItem['angkatan']] ?? 24;

            $user = User::create([
                'name'         => $mhsItem['nama'],
                'email'        => $email,
                'password'     => bcrypt('Mahasiswa123'),
                'phone_number' => '0857'.(10000000 + $idx),
                'is_active'    => true,
            ]);
            $user->assignRole($mhsRole);

            $mahasiswaModels[] = Mahasiswa::create([
                'user_id'       => $user->id,
                'nim'           => $mhsItem['nim'],
                'nama_lengkap'  => $mhsItem['nama'],
                'prodi'         => $mhsItem['prodi'],
                'angkatan'      => $mhsItem['angkatan'],
                'dosen_wali_id' => $dosenWali->id,
                'ipk_terakhir'  => $ipkSamples[$idx],
                'sks_lulus'     => $sksLulus,
            ]);
        }

        // 5. Buat Data Perwalian (2 per mahasiswa = 40 total)
        $semesters     = ['2024/2025 Ganjil', '2024/2025 Genap', '2025/2026 Ganjil', '2025/2026 Genap'];
        $statusOptions = ['Disetujui', 'Pending', 'Ditolak', 'Disetujui'];

        $sampleMatkul = [
            ['kode' => 'IF-101', 'nama' => 'Algoritma & Pemrograman',    'sks' => 4, 'kelas' => 'IF-A'],
            ['kode' => 'IF-102', 'nama' => 'Basis Data Enterprise',      'sks' => 3, 'kelas' => 'IF-A'],
            ['kode' => 'IF-103', 'nama' => 'Pemrograman Web Framework',  'sks' => 3, 'kelas' => 'IF-B'],
            ['kode' => 'IF-104', 'nama' => 'Arsitektur Perangkat Lunak', 'sks' => 3, 'kelas' => 'IF-A'],
            ['kode' => 'IF-105', 'nama' => 'Kecerdasan Buatan',          'sks' => 3, 'kelas' => 'IF-C'],
            ['kode' => 'SI-201', 'nama' => 'Analisis Perancangan Sistem','sks' => 3, 'kelas' => 'SI-A'],
            ['kode' => 'SI-202', 'nama' => 'Manajemen Proyek TI',        'sks' => 3, 'kelas' => 'SI-B'],
        ];

        $p = 1;
        foreach ($mahasiswaModels as $mhsIdx => $mhs) {
            for ($round = 0; $round < 2; $round++) {
                $semester      = $semesters[($p - 1) % 4];
                $status        = $statusOptions[($p - 1) % 4];
                $selectedMatkul = array_slice($sampleMatkul, ($p % 3), 4);
                $totalSks      = array_sum(array_column($selectedMatkul, 'sks'));

                $perwalian = Perwalian::create([
                    'mahasiswa_id'     => $mhs->id,
                    'dosen_id'         => $mhs->dosen_wali_id ?? $dosenModels[0]->id,
                    'semester'         => $semester,
                    'ipk_semester'     => $mhs->ipk_terakhir,
                    'sks_diambil'      => $totalSks,
                    'matakuliah_rencana' => $selectedMatkul,
                    'catatan_mahasiswa'=> "Pengajuan perwalian semester {$semester}. Mohon bimbingannya Bapak/Ibu.",
                    'catatan_dosen'    => $status === 'Disetujui'
                        ? 'Rencana studi telah sesuai standar kurikulum. Disetujui.'
                        : ($status === 'Ditolak' ? 'Jumlah SKS melebihi batas maksimum IPK. Silakan revisi.' : null),
                    'status'           => $status,
                    'tgl_persetujuan'  => $status !== 'Pending' ? now()->subDays(60 - $p) : null,
                    'created_at'       => now()->subDays(65 - $p),
                ]);

                // Audit Log — Pengajuan
                PerwalianLog::create([
                    'perwalian_id'    => $perwalian->id,
                    'user_id'         => $mhs->user_id,
                    'status_sebelumnya' => null,
                    'status_baru'     => 'Pending',
                    'catatan'         => 'Pengajuan perwalian baru oleh Mahasiswa.',
                    'created_at'      => now()->subDays(65 - $p),
                ]);

                // Audit Log — Keputusan Dosen (jika bukan Pending)
                if ($status !== 'Pending') {
                    PerwalianLog::create([
                        'perwalian_id'    => $perwalian->id,
                        'user_id'         => $mhs->dosenWali?->user_id ?? $dosenModels[0]->user_id,
                        'status_sebelumnya' => 'Pending',
                        'status_baru'     => $status,
                        'catatan'         => $perwalian->catatan_dosen,
                        'created_at'      => now()->subDays(60 - $p),
                    ]);
                }

                $p++;
            }
        }
    }
}
