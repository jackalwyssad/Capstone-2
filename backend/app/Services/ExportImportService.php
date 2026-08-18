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
    public function getExportPerwalianData(): array
    {
        $perwalianList = Perwalian::with(['mahasiswa.user', 'dosen.user'])->get();

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
     * Memproses data impor Mahasiswa dari struktur JSON/Array.
     */
    public function importMahasiswaData(array $items): int
    {
        $count = 0;
        foreach ($items as $item) {
            if (empty($item['nim']) || empty($item['nama_lengkap'])) {
                continue;
            }

            $mahasiswaService = app(MahasiswaService::class);
            $mahasiswaService->createMahasiswa([
                'nim' => $item['nim'],
                'nama_lengkap' => $item['nama_lengkap'],
                'prodi' => $item['prodi'] ?? 'Teknik Informatika',
                'angkatan' => $item['angkatan'] ?? date('Y'),
                'ipk_terakhir' => $item['ipk_terakhir'] ?? 0.00,
                'sks_lulus' => $item['sks_lulus'] ?? 0,
            ]);
            $count++;
        }

        return $count;
    }
}
