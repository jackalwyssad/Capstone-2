<?php

namespace App\Services;

use App\Interfaces\PerwalianRepositoryInterface;
use App\Models\Perwalian;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

/**
 * Class PerwalianService
 * Layanan bisnis untuk alur pengajuan, perubahan, pembatalan, persetujuan/penolakan perwalian mahasiswa.
 */
class PerwalianService
{
    protected PerwalianRepositoryInterface $perwalianRepository;

    public function __construct(PerwalianRepositoryInterface $perwalianRepository)
    {
        $this->perwalianRepository = $perwalianRepository;
    }

    public function getPaginatedPerwalian(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return $this->perwalianRepository->getAllPaginated($filters, $perPage);
    }

    public function getPerwalianById(int $id): ?Perwalian
    {
        return $this->perwalianRepository->findById($id);
    }

    /**
     * Mahasiswa mengajukan perwalian baru.
     */
    public function createPerwalian(array $data, User $authUser): Perwalian
    {
        $mahasiswa = $authUser->mahasiswa;
        if (! $mahasiswa) {
            throw ValidationException::withMessages([
                'mahasiswa' => ['Akun Anda tidak terhubung dengan profil Mahasiswa.'],
            ]);
        }

        if (! $mahasiswa->dosen_wali_id) {
            throw ValidationException::withMessages([
                'dosen_wali' => ['Anda belum memiliki Dosen Wali. Silakan hubungi bagian Akademik / Admin STMIK Bandung.'],
            ]);
        }

        $data['mahasiswa_id'] = $mahasiswa->id;
        $data['dosen_id'] = $mahasiswa->dosen_wali_id;
        $data['status'] = 'Pending';
        $data['matakuliah_rencana'] = $data['matakuliah_rencana'] ?? [];
        $data['sks_diambil'] = $data['sks_diambil'] ?? 0;

        $perwalian = $this->perwalianRepository->create($data);

        $isKonsul = empty($data['matakuliah_rencana']) || $data['sks_diambil'] === 0;
        $logMessage = $isKonsul
            ? 'Pengajuan sesi konsultasi / bimbingan chat baru oleh Mahasiswa.'
            : 'Pengajuan perwalian rencana studi (KRS) baru oleh Mahasiswa.';

        // Catat Audit Log
        $this->perwalianRepository->createLog(
            $perwalian->id,
            $authUser->id,
            null,
            'Pending',
            $logMessage
        );

        return $perwalian;
    }

    /**
     * Edit perwalian - Hanya diperbolehkan jika status masih 'Pending'.
     */
    public function updatePerwalian(Perwalian $perwalian, array $data, User $authUser): Perwalian
    {
        if ($perwalian->status !== 'Pending') {
            throw ValidationException::withMessages([
                'status' => ['Data perwalian tidak dapat diubah karena status sudah '.$perwalian->status.'.'],
            ]);
        }

        $oldStatus = $perwalian->status;
        $updated = $this->perwalianRepository->update($perwalian, $data);

        $this->perwalianRepository->createLog(
            $perwalian->id,
            $authUser->id,
            $oldStatus,
            'Pending',
            'Mahasiswa memperbarui rencana mata kuliah / data perwalian.'
        );

        return $updated;
    }

    /**
     * Hapus perwalian - Hanya diperbolehkan jika status masih 'Pending'.
     */
    public function deletePerwalian(Perwalian $perwalian): bool
    {
        if ($perwalian->status !== 'Pending') {
            throw ValidationException::withMessages([
                'status' => ['Data perwalian tidak dapat dihapus karena status sudah '.$perwalian->status.'.'],
            ]);
        }

        return $this->perwalianRepository->delete($perwalian);
    }

    /**
     * Dosen Wali melakukan Tanggapan Bimbingan (Kirim Pesan / Jadwal Temu / Approval / Rejection).
     */
    public function approveOrReject(Perwalian $perwalian, string $status, ?string $catatanDosen, User $authUser): Perwalian
    {
        $statusSebelumnya = $perwalian->status;

        $updateData = [
            'status' => $status,
            'catatan_dosen' => $catatanDosen,
            'tgl_persetujuan' => $status !== 'Pending' ? now() : $perwalian->tgl_persetujuan,
        ];

        $updated = $this->perwalianRepository->update($perwalian, $updateData);

        $defaultLog = $status === 'Pending'
            ? 'Dosen Wali mengirimkan pesan bimbingan / info jadwal pertemuan ke Mahasiswa.'
            : "Perwalian di-{$status} oleh Dosen Wali.";

        // Buat Log Aktivitas
        $this->perwalianRepository->createLog(
            $perwalian->id,
            $authUser->id,
            $statusSebelumnya,
            $status,
            $catatanDosen ?: $defaultLog
        );

        return $updated;
    }

    public function getDashboardStats(): array
    {
        return $this->perwalianRepository->getStats();
    }
}
