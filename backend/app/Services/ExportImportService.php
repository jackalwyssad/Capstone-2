<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Perwalian;

/**
 * Class ExportImportService
 * Layanan untuk rekapitulasi data, ekspor laporan Excel/PDF, dan impor data Mahasiswa/Dosen dari file Excel/CSV.
 */
class ExportImportService
{
    /**
     * Menghasilkan data struktur array untuk ekspor Excel Perwalian.
     */
    public function getExportPerwalianData(array $filters = []): array
    {
        $query = Perwalian::with(['mahasiswa.user', 'dosen.user']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['semester'])) {
            $query->where('semester', $filters['semester']);
        }

        if (isset($filters['mahasiswa_id'])) {
            $query->where('mahasiswa_id', $filters['mahasiswa_id']);
        }

        if (isset($filters['dosen_id'])) {
            $query->where('dosen_id', $filters['dosen_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('mahasiswa', function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nim', 'ilike', "%{$search}%");
            });
        }

        $perwalianList = $query->orderBy('created_at', 'desc')->get();

        $rows = [];
        $rows[] = ['ID Perwalian', 'NIM', 'Nama Mahasiswa', 'Prodi', 'Dosen Wali', 'Semester', 'IPK', 'SKS', 'Status', 'Tanggal Persetujuan'];

        foreach ($perwalianList as $p) {
            $rows[] = [
                $p->id,
                $p->mahasiswa->nim ?? '-',
                $p->mahasiswa->nama_lengkap ?? '-',
                $p->mahasiswa->prodi ?? '-',
                $p->dosen->nama_lengkap ?? '-',
                $p->semester,
                $p->ipk_semester,
                $p->sks_diambil,
                $p->status,
                $p->tgl_persetujuan ? $p->tgl_persetujuan->format('Y-m-d H:i') : '-',
            ];
        }

        return $rows;
    }

    /**
     * Memproses data impor Mahasiswa dari struktur JSON/Array dengan Proteksi Keamanan Data & Auto-NIM Generator.
     * - Jika NIM tidak disertakan, sistem otomatis membuatkan NIM baru sesuai urutan standar STMIK.
     * - Jika NIM sudah ada dan NAMA BERBEDA (indikasi human error / salah ketik NIM), baris DILEWATI (SKIPPED) agar data orang lain tidak tertimpa.
     * - Jika NIM sudah ada dan NAMA SAMA, data diperbarui (sinkronisasi IPK/SKS).
     * - Jika NIM belum ada, sistem membuat data mahasiswa baru beserta akun user login-nya.
     */
    public function importMahasiswaData(array $items): array
    {
        $mahasiswaService = app(MahasiswaService::class);
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $skippedDetails = [];

        foreach ($items as $item) {
            if (empty($item['nama_lengkap'])) {
                continue;
            }

            $namaLengkap  = trim((string)$item['nama_lengkap']);
            $prodi        = !empty($item['prodi']) ? trim((string)$item['prodi']) : 'Teknik Informatika';
            $angkatan     = !empty($item['angkatan']) ? trim((string)$item['angkatan']) : date('Y');
            $jenisKelamin = !empty($item['jenis_kelamin']) ? trim((string)$item['jenis_kelamin']) : 'Laki-laki';
            $ipk          = isset($item['ipk_terakhir']) ? (float)$item['ipk_terakhir'] : 0.00;
            $sks          = isset($item['sks_lulus']) ? (int)$item['sks_lulus'] : 0;
            $nim          = !empty($item['nim']) ? trim((string)$item['nim']) : null;

            // Jika NIM tidak diisi, otomatis buatkan NIM baru sesuai urutan standar STMIK
            if (empty($nim)) {
                $nim = $mahasiswaService->generateNextNim($prodi, $angkatan);
            }

            // Cek apakah mahasiswa dengan NIM tersebut sudah terdaftar
            $existingMhs = Mahasiswa::where('nim', $nim)->first();

            if ($existingMhs) {
                // Proteksi Kesalahan Manusia: Cek kesamaan nama
                $isSamePerson = strtolower(trim($existingMhs->nama_lengkap)) === strtolower($namaLengkap);

                if (! $isSamePerson) {
                    // Nama berbeda: Jangan timpa data orang lain! Lewati baris ini dan catat di riwayat lewati.
                    $skipped++;
                    $skippedDetails[] = [
                        'nim'            => $nim,
                        'nama_input'     => $namaLengkap,
                        'nama_terdaftar' => $existingMhs->nama_lengkap,
                        'alasan'         => "NIM {$nim} sudah terdaftar atas nama {$existingMhs->nama_lengkap}. Data dilewati untuk mencegah penimpaan data salah.",
                    ];
                    continue;
                }

                // Jika nama sama, perbarui data akademik pelengkapnya
                $mahasiswaService->updateMahasiswa($existingMhs, [
                    'nama_lengkap'  => $namaLengkap,
                    'jenis_kelamin' => $jenisKelamin,
                    'prodi'         => $prodi,
                    'angkatan'      => $angkatan,
                    'ipk_terakhir'  => $ipk,
                    'sks_lulus'     => $sks,
                ]);
                $updated++;
            } else {
                // Buat mahasiswa baru dan akun user login-nya
                $mahasiswaService->createMahasiswa([
                    'nim'           => $nim,
                    'nama_lengkap'  => $namaLengkap,
                    'jenis_kelamin' => $jenisKelamin,
                    'prodi'         => $prodi,
                    'angkatan'      => $angkatan,
                    'ipk_terakhir'  => $ipk,
                    'sks_lulus'     => $sks,
                ]);
                $created++;
            }
        }

        return [
            'total'           => $created + $updated + $skipped,
            'created_count'   => $created,
            'updated_count'   => $updated,
            'skipped_count'   => $skipped,
            'skipped_details' => $skippedDetails,
        ];
    }
}
