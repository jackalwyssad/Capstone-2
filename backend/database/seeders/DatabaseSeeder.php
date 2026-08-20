<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
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
            [
                'nidn' => '0401018501',
                'nama' => 'Dr. Irwan Setiawan, M.T.',
                'jenis_kelamin' => 'Laki-laki',
                'gelar' => 'M.T.',
                'email' => 'dosen1@stmikbandung.ac.id',
                'no_hp' => '082199881001',
                'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '1980-05-14',
                'pendidikan_terakhir' => 'S3 Doktor Ilmu Komputer (ITB)',
                'alamat' => 'Jl. Cikutra No. 113, Cibeunying Kidul, Kota Bandung',
                'foto' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'nidn' => '0412058802',
                'nama' => 'Hj. Nurasiah, M.Kom.',
                'jenis_kelamin' => 'Perempuan',
                'gelar' => 'M.Kom.',
                'email' => 'dosen2@stmikbandung.ac.id',
                'no_hp' => '082199881002',
                'tempat_lahir' => 'Cimahi',
                'tanggal_lahir' => '1985-08-20',
                'pendidikan_terakhir' => 'S2 Magister Komputer (STMIK Bandung)',
                'alamat' => 'Jl. Soekarno Hatta No. 450, Batununggal, Kota Bandung',
                'foto' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'nidn' => '0420087903',
                'nama' => 'Budi Raharjo, Ph.D.',
                'jenis_kelamin' => 'Laki-laki',
                'gelar' => 'Ph.D.',
                'email' => 'dosen3@stmikbandung.ac.id',
                'no_hp' => '082199881003',
                'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1976-12-03',
                'pendidikan_terakhir' => 'Ph.D. in Software Engineering (NTU)',
                'alamat' => 'Jl. Dago Asri No. 18, Coblong, Kota Bandung',
                'foto' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'nidn' => '0415119004',
                'nama' => 'Rina Andriani, S.Kom., M.T.',
                'jenis_kelamin' => 'Perempuan',
                'gelar' => 'M.T.',
                'email' => 'dosen4@stmikbandung.ac.id',
                'no_hp' => '082199881004',
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '1988-03-25',
                'pendidikan_terakhir' => 'S2 Magister Teknik Informatika (Unpad)',
                'alamat' => 'Jl. Buah Batu No. 88, Lengkong, Kota Bandung',
                'foto' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'nidn' => '0408038305',
                'nama' => 'Ahmad Fauzi, M.Si.',
                'jenis_kelamin' => 'Laki-laki',
                'gelar' => 'M.Si.',
                'email' => 'dosen5@stmikbandung.ac.id',
                'no_hp' => '082199881005',
                'tempat_lahir' => 'Tasikmalaya',
                'tanggal_lahir' => '1982-10-11',
                'pendidikan_terakhir' => 'S2 Magister Sains Informasi (UI)',
                'alamat' => 'Jl. Riau No. 102, Sumur Bandung, Kota Bandung',
                'foto' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            ],
        ];

        $dosenModels = [];
        foreach ($dosenData as $d) {
            $user = User::create([
                'name'         => $d['nama'],
                'email'        => $d['email'],
                'password'     => bcrypt('Dosen123'),
                'phone_number' => $d['no_hp'],
                'avatar'       => $d['foto'],
                'is_active'    => true,
            ]);
            $user->assignRole($dosenRole);

            $dosenModels[] = Dosen::create([
                'user_id'             => $user->id,
                'nidn'                => $d['nidn'],
                'nama_lengkap'        => $d['nama'],
                'jenis_kelamin'       => $d['jenis_kelamin'] ?? 'Laki-laki',
                'gelar'               => $d['gelar'],
                'email'               => $d['email'],
                'no_hp'               => $d['no_hp'],
                'tempat_lahir'        => $d['tempat_lahir'],
                'tanggal_lahir'       => $d['tanggal_lahir'],
                'pendidikan_terakhir' => $d['pendidikan_terakhir'],
                'alamat'              => $d['alamat'],
                'foto'                => $d['foto'],
                'kuota_bimbingan'     => 30,
            ]);
        }

        // 4. Buat 20 Mahasiswa dengan format NIM resmi STMIK Bandung (IF = 12, SI = 32, Tahun 2 Digit, Urutan 3 Digit)
        $mahasiswaData = [
            ['nim' => '1222001', 'nama' => 'Aditya Pratama',       'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2022'],
            ['nim' => '3222001', 'nama' => 'Bagus Santoso',        'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '1223001', 'nama' => 'Citra Wibowo',         'jenis_kelamin' => 'Perempuan', 'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3223001', 'nama' => 'Dian Kusuma',          'jenis_kelamin' => 'Perempuan', 'prodi' => 'Sistem Informasi',   'angkatan' => '2023'],
            ['nim' => '1221001', 'nama' => 'Eko Saputra',          'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3221001', 'nama' => 'Fajar Permana',        'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2021'],
            ['nim' => '1224001', 'nama' => 'Gita Hidayat',         'jenis_kelamin' => 'Perempuan', 'prodi' => 'Teknik Informatika', 'angkatan' => '2024'],
            ['nim' => '3224001', 'nama' => 'Hendra Ramadhan',      'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2024'],
            ['nim' => '1222002', 'nama' => 'Indah Utami',          'jenis_kelamin' => 'Perempuan', 'prodi' => 'Teknik Informatika', 'angkatan' => '2022'],
            ['nim' => '3223002', 'nama' => 'Joko Wijaya',          'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2023'],
            ['nim' => '1221002', 'nama' => 'Kiki Susanto',         'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3222002', 'nama' => 'Lestari Suryani',      'jenis_kelamin' => 'Perempuan', 'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '1223002', 'nama' => 'Maya Anggraeni',       'jenis_kelamin' => 'Perempuan', 'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3224002', 'nama' => 'Nugroho Prabowo',      'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2024'],
            ['nim' => '1221003', 'nama' => 'Oki Firmansyah',       'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2021'],
            ['nim' => '3222003', 'nama' => 'Putri Rahayu',         'jenis_kelamin' => 'Perempuan', 'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
            ['nim' => '1223003', 'nama' => 'Rizky Maulana',        'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2023'],
            ['nim' => '3221002', 'nama' => 'Sari Dewi',            'jenis_kelamin' => 'Perempuan', 'prodi' => 'Sistem Informasi',   'angkatan' => '2021'],
            ['nim' => '1224002', 'nama' => 'Taufik Hidayatullah',  'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Teknik Informatika', 'angkatan' => '2024'],
            ['nim' => '3222004', 'nama' => 'Wahyu Setiawan',       'jenis_kelamin' => 'Laki-laki', 'prodi' => 'Sistem Informasi',   'angkatan' => '2022'],
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

            $avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($mhsItem['nama']);
            $user = User::create([
                'name'         => $mhsItem['nama'],
                'email'        => $email,
                'password'     => bcrypt('Mahasiswa123'),
                'phone_number' => '0857'.(10000000 + $idx),
                'avatar'       => $avatarUrl,
                'is_active'    => true,
            ]);
            $user->assignRole($mhsRole);

            $mahasiswaModels[] = Mahasiswa::create([
                'user_id'       => $user->id,
                'nim'           => $mhsItem['nim'],
                'nama_lengkap'  => $mhsItem['nama'],
                'jenis_kelamin' => $mhsItem['jenis_kelamin'],
                'prodi'         => $mhsItem['prodi'],
                'angkatan'      => $mhsItem['angkatan'],
                'dosen_wali_id' => $dosenWali->id,
                'ipk_terakhir'  => $ipkSamples[$idx],
                'sks_lulus'     => $sksLulus,
                'foto'          => $avatarUrl,
            ]);
        }

        // 5. Buat Data Katalog Mata Kuliah & Jadwal Resmi STMIK Bandung (Semester 1 - 8)
        $katalogDatabase = [
            // Semester 1
            ['kode' => 'IF-101', 'nama' => 'Algoritma & Pemrograman', 'sks' => 4, 'semester' => 1, 'prodi' => 'Teknik Informatika', 'hari' => 'Senin', 'jam_mulai' => '07:30', 'jam_selesai' => '11:00', 'ruangan' => 'Lab IF-1', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'MK-303', 'nama' => 'Kalkulus', 'sks' => 3, 'semester' => 1, 'prodi' => 'Umum', 'hari' => 'Sabtu', 'jam_mulai' => '13:00', 'jam_selesai' => '15:30', 'ruangan' => 'Aula B', 'dosen_pengampu' => 'Hj. Nurasiah, M.Kom.'],
            ['kode' => 'MK-305', 'nama' => 'Pancasila & Kewarganegaraan', 'sks' => 2, 'semester' => 1, 'prodi' => 'Umum', 'hari' => 'Selasa', 'jam_mulai' => '16:40', 'jam_selesai' => '18:20', 'ruangan' => 'Aula C', 'dosen_pengampu' => 'Drs. H. Mulyadi, M.Si.'],
            ['kode' => 'MK-308', 'nama' => 'Pengantar Teknologi Informasi', 'sks' => 2, 'semester' => 1, 'prodi' => 'Umum', 'hari' => 'Rabu', 'jam_mulai' => '07:30', 'jam_selesai' => '09:10', 'ruangan' => 'Ruang 101', 'dosen_pengampu' => 'Rian Hidayat, S.Kom., M.T.'],
            ['kode' => 'SI-101', 'nama' => 'Pengantar Sistem Informasi', 'sks' => 3, 'semester' => 1, 'prodi' => 'Sistem Informasi', 'hari' => 'Kamis', 'jam_mulai' => '08:00', 'jam_selesai' => '10:30', 'ruangan' => 'Ruang 102', 'dosen_pengampu' => 'Budi Santoso, M.Kom.'],

            // Semester 2
            ['kode' => 'IF-102', 'nama' => 'Basis Data Enterprise', 'sks' => 3, 'semester' => 2, 'prodi' => 'Teknik Informatika', 'hari' => 'Senin', 'jam_mulai' => '11:10', 'jam_selesai' => '13:40', 'ruangan' => 'Lab DB-1', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'MK-301', 'nama' => 'Matematika Diskrit', 'sks' => 3, 'semester' => 2, 'prodi' => 'Umum', 'hari' => 'Sabtu', 'jam_mulai' => '07:30', 'jam_selesai' => '10:00', 'ruangan' => 'Aula A', 'dosen_pengampu' => 'Hj. Nurasiah, M.Kom.'],
            ['kode' => 'MK-304', 'nama' => 'Bahasa Inggris Teknik', 'sks' => 2, 'semester' => 2, 'prodi' => 'Umum', 'hari' => 'Senin', 'jam_mulai' => '16:40', 'jam_selesai' => '18:20', 'ruangan' => 'R. Bahasa 1', 'dosen_pengampu' => 'Dewi Lestari, M.Pd.'],
            ['kode' => 'IF-111', 'nama' => 'Struktur Data & Algoritma', 'sks' => 3, 'semester' => 2, 'prodi' => 'Teknik Informatika', 'hari' => 'Selasa', 'jam_mulai' => '08:00', 'jam_selesai' => '10:30', 'ruangan' => 'Lab IF-1', 'dosen_pengampu' => 'Ahmad Fauzi, M.T.'],
            ['kode' => 'SI-102', 'nama' => 'Manajemen Proses Bisnis', 'sks' => 3, 'semester' => 2, 'prodi' => 'Sistem Informasi', 'hari' => 'Rabu', 'jam_mulai' => '13:00', 'jam_selesai' => '15:30', 'ruangan' => 'Ruang 201', 'dosen_pengampu' => 'Budi Santoso, M.Kom.'],

            // Semester 3
            ['kode' => 'IF-103', 'nama' => 'Pemrograman Web Framework', 'sks' => 3, 'semester' => 3, 'prodi' => 'Teknik Informatika', 'hari' => 'Selasa', 'jam_mulai' => '07:30', 'jam_selesai' => '10:00', 'ruangan' => 'Lab IF-2', 'dosen_pengampu' => 'Rian Hidayat, S.Kom., M.T.'],
            ['kode' => 'SI-201', 'nama' => 'Analisis Perancangan Sistem', 'sks' => 3, 'semester' => 3, 'prodi' => 'Sistem Informasi', 'hari' => 'Senin', 'jam_mulai' => '14:00', 'jam_selesai' => '16:30', 'ruangan' => 'Ruang 201', 'dosen_pengampu' => 'Hj. Nurasiah, M.Kom.'],
            ['kode' => 'MK-302', 'nama' => 'Statistika & Probabilitas', 'sks' => 3, 'semester' => 3, 'prodi' => 'Umum', 'hari' => 'Sabtu', 'jam_mulai' => '10:10', 'jam_selesai' => '12:40', 'ruangan' => 'Aula A', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'IF-112', 'nama' => 'Pemrograman Berorientasi Objek', 'sks' => 3, 'semester' => 3, 'prodi' => 'Teknik Informatika', 'hari' => 'Kamis', 'jam_mulai' => '08:00', 'jam_selesai' => '10:30', 'ruangan' => 'Lab IF-2', 'dosen_pengampu' => 'Ahmad Fauzi, M.T.'],

            // Semester 4
            ['kode' => 'IF-104', 'nama' => 'Arsitektur Perangkat Lunak', 'sks' => 3, 'semester' => 4, 'prodi' => 'Teknik Informatika', 'hari' => 'Selasa', 'jam_mulai' => '10:30', 'jam_selesai' => '13:00', 'ruangan' => 'Ruang 301', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'IF-106', 'nama' => 'Jaringan Komputer', 'sks' => 3, 'semester' => 4, 'prodi' => 'Teknik Informatika', 'hari' => 'Rabu', 'jam_mulai' => '10:30', 'jam_selesai' => '13:00', 'ruangan' => 'Lab Net-1', 'dosen_pengampu' => 'Rian Hidayat, S.Kom., M.T.'],
            ['kode' => 'SI-202', 'nama' => 'Manajemen Proyek TI', 'sks' => 3, 'semester' => 4, 'prodi' => 'Sistem Informasi', 'hari' => 'Selasa', 'jam_mulai' => '14:00', 'jam_selesai' => '16:30', 'ruangan' => 'Ruang 202', 'dosen_pengampu' => 'Budi Santoso, M.Kom.'],
            ['kode' => 'IF-113', 'nama' => 'Interaksi Manusia & Komputer', 'sks' => 2, 'semester' => 4, 'prodi' => 'Umum', 'hari' => 'Kamis', 'jam_mulai' => '13:00', 'jam_selesai' => '14:40', 'ruangan' => 'Ruang 201', 'dosen_pengampu' => 'Dewi Lestari, M.Pd.'],

            // Semester 5
            ['kode' => 'IF-105', 'nama' => 'Kecerdasan Buatan', 'sks' => 3, 'semester' => 5, 'prodi' => 'Teknik Informatika', 'hari' => 'Rabu', 'jam_mulai' => '07:30', 'jam_selesai' => '10:00', 'ruangan' => 'Lab AI-1', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'IF-107', 'nama' => 'Pemrograman Mobile', 'sks' => 3, 'semester' => 5, 'prodi' => 'Teknik Informatika', 'hari' => 'Kamis', 'jam_mulai' => '07:30', 'jam_selesai' => '10:00', 'ruangan' => 'Lab Mobile-1', 'dosen_pengampu' => 'Ahmad Fauzi, M.T.'],
            ['kode' => 'SI-203', 'nama' => 'Sistem Informasi Manajemen', 'sks' => 3, 'semester' => 5, 'prodi' => 'Sistem Informasi', 'hari' => 'Rabu', 'jam_mulai' => '14:00', 'jam_selesai' => '16:30', 'ruangan' => 'Ruang 203', 'dosen_pengampu' => 'Budi Santoso, M.Kom.'],
            ['kode' => 'IF-114', 'nama' => 'Pengolahan Citra Digital', 'sks' => 3, 'semester' => 5, 'prodi' => 'Teknik Informatika', 'hari' => 'Jumat', 'jam_mulai' => '08:00', 'jam_selesai' => '10:30', 'ruangan' => 'Lab AI-1', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],

            // Semester 6
            ['kode' => 'IF-108', 'nama' => 'Keamanan Sistem Informasi', 'sks' => 3, 'semester' => 6, 'prodi' => 'Teknik Informatika', 'hari' => 'Kamis', 'jam_mulai' => '10:30', 'jam_selesai' => '13:00', 'ruangan' => 'Lab Sec-1', 'dosen_pengampu' => 'Rian Hidayat, S.Kom., M.T.'],
            ['kode' => 'SI-204', 'nama' => 'Audit Sistem Informasi', 'sks' => 3, 'semester' => 6, 'prodi' => 'Sistem Informasi', 'hari' => 'Kamis', 'jam_mulai' => '14:00', 'jam_selesai' => '16:30', 'ruangan' => 'Ruang 301', 'dosen_pengampu' => 'Hj. Nurasiah, M.Kom.'],
            ['kode' => 'MK-306', 'nama' => 'Etika Profesi IT', 'sks' => 2, 'semester' => 6, 'prodi' => 'Umum', 'hari' => 'Rabu', 'jam_mulai' => '16:40', 'jam_selesai' => '18:20', 'ruangan' => 'Ruang 101', 'dosen_pengampu' => 'Drs. H. Mulyadi, M.Si.'],
            ['kode' => 'IF-115', 'nama' => 'Data Mining & Data Warehouse', 'sks' => 3, 'semester' => 6, 'prodi' => 'Teknik Informatika', 'hari' => 'Selasa', 'jam_mulai' => '13:00', 'jam_selesai' => '15:30', 'ruangan' => 'Lab DB-1', 'dosen_pengampu' => 'Ahmad Fauzi, M.T.'],

            // Semester 7
            ['kode' => 'IF-109', 'nama' => 'Komputasi Awan (Cloud)', 'sks' => 2, 'semester' => 7, 'prodi' => 'Teknik Informatika', 'hari' => 'Jumat', 'jam_mulai' => '07:30', 'jam_selesai' => '09:10', 'ruangan' => 'Ruang 401', 'dosen_pengampu' => 'Rian Hidayat, S.Kom., M.T.'],
            ['kode' => 'SI-205', 'nama' => 'E-Business & E-Commerce', 'sks' => 3, 'semester' => 7, 'prodi' => 'Sistem Informasi', 'hari' => 'Jumat', 'jam_mulai' => '14:40', 'jam_selesai' => '17:10', 'ruangan' => 'Ruang 302', 'dosen_pengampu' => 'Budi Santoso, M.Kom.'],
            ['kode' => 'MK-307', 'nama' => 'Kerja Praktik (KP)', 'sks' => 2, 'semester' => 7, 'prodi' => 'Umum', 'hari' => 'Kamis', 'jam_mulai' => '16:40', 'jam_selesai' => '18:20', 'ruangan' => 'Koordinator KP', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'IF-116', 'nama' => 'Internet of Things (IoT)', 'sks' => 3, 'semester' => 7, 'prodi' => 'Teknik Informatika', 'hari' => 'Senin', 'jam_mulai' => '09:00', 'jam_selesai' => '11:30', 'ruangan' => 'Lab Net-1', 'dosen_pengampu' => 'Ahmad Fauzi, M.T.'],

            // Semester 8
            ['kode' => 'IF-110', 'nama' => 'Skripsi / Tugas Akhir', 'sks' => 6, 'semester' => 8, 'prodi' => 'Teknik Informatika', 'hari' => 'Jumat', 'jam_mulai' => '09:30', 'jam_selesai' => '14:30', 'ruangan' => 'Ruang Bimbingan', 'dosen_pengampu' => 'Dr. Irwan Setiawan, M.T.'],
            ['kode' => 'SI-210', 'nama' => 'Tugas Akhir Sistem Informasi', 'sks' => 6, 'semester' => 8, 'prodi' => 'Sistem Informasi', 'hari' => 'Jumat', 'jam_mulai' => '09:30', 'jam_selesai' => '14:30', 'ruangan' => 'Ruang Bimbingan', 'dosen_pengampu' => 'Hj. Nurasiah, M.Kom.'],
        ];

        foreach ($katalogDatabase as $mkItem) {
            Matakuliah::create($mkItem);
        }

        // 6. Buat Data Perwalian (2 per mahasiswa = 40 total)
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
