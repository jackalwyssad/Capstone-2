<?php

namespace App\Services;

use App\Interfaces\MahasiswaRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Models\Mahasiswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class MahasiswaService
 * Layanan bisnis untuk registrasi Mahasiswa, penetapan Dosen Wali, dan kalkulasi IPK/SKS.
 */
class MahasiswaService
{
    protected MahasiswaRepositoryInterface $mahasiswaRepository;

    protected UserRepositoryInterface $userRepository;

    public function __construct(MahasiswaRepositoryInterface $mahasiswaRepository, UserRepositoryInterface $userRepository)
    {
        $this->mahasiswaRepository = $mahasiswaRepository;
        $this->userRepository = $userRepository;
    }

    public function getPaginatedMahasiswa(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return $this->mahasiswaRepository->getAllPaginated($filters, $perPage);
    }

    public function getMahasiswaById(int $id): ?Mahasiswa
    {
        return $this->mahasiswaRepository->findById($id);
    }

    public function createMahasiswa(array $data): Mahasiswa
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['nama_lengkap'],
                'email' => $data['email'] ?? strtolower($data['nim']).'@student.stmikbandung.ac.id',
                'password' => bcrypt($data['password'] ?? 'Mahasiswa123'),
            ]);

            $user->assignRole('Mahasiswa');

            return $this->mahasiswaRepository->create([
                'user_id' => $user->id,
                'nim' => $data['nim'],
                'nama_lengkap' => $data['nama_lengkap'],
                'jenis_kelamin' => $data['jenis_kelamin'] ?? 'Laki-laki',
                'prodi' => $data['prodi'],
                'angkatan' => $data['angkatan'],
                'dosen_wali_id' => $data['dosen_wali_id'] ?? null,
                'ipk_terakhir' => $data['ipk_terakhir'] ?? 0.00,
                'sks_lulus' => $data['sks_lulus'] ?? 0,
                'foto' => $data['foto'] ?? null,
            ]);
        });
    }

    public function updateMahasiswa(Mahasiswa $mahasiswa, array $data): Mahasiswa
    {
        return DB::transaction(function () use ($mahasiswa, $data) {
            if ($mahasiswa->user) {
                $userUpdates = [];
                if (isset($data['nama_lengkap'])) $userUpdates['name'] = $data['nama_lengkap'];
                if (isset($data['foto'])) $userUpdates['avatar'] = $data['foto'];
                if (!empty($userUpdates)) {
                    $mahasiswa->user->update($userUpdates);
                }
            }

            return $this->mahasiswaRepository->update($mahasiswa, $data);
        });
    }

    public function deleteMahasiswa(Mahasiswa $mahasiswa): bool
    {
        return DB::transaction(function () use ($mahasiswa) {
            if ($mahasiswa->user) {
                $mahasiswa->user->delete();
            }

            return $this->mahasiswaRepository->delete($mahasiswa);
        });
    }

    public function assignDosenWali(array $mahasiswaIds, int $dosenId): bool
    {
        return $this->mahasiswaRepository->assignDosenWali($mahasiswaIds, $dosenId);
    }

    /**
     * Generate format NIM STMIK Bandung:
     * - Teknik Informatika (IF): Prefix "12"
     * - Sistem Informasi (SI): Prefix "32"
     * - 2 digit tahun masuk/angkatan (misal 2026 -> "26")
     * - Nomor urut 3 digit mulai dari "001", "002", s/d "010", "016", "099", "100"
     * Contoh: IF 2026 urutan 1 -> "1226001", IF 2026 urutan 10 -> "1226010", IF 2024 urutan 16 -> "1224016"
     */
    public function generateNextNim(string $prodi, string $angkatan): string
    {
        $isIF = str_contains(strtolower($prodi), 'informatika') || strtoupper($prodi) === 'IF';
        $prefix = $isIF ? '12' : '32';

        $cleanAngkatan = preg_replace('/\D/', '', $angkatan);
        $twoDigitYear = strlen($cleanAngkatan) >= 2 ? substr($cleanAngkatan, -2) : str_pad($cleanAngkatan, 2, '0', STR_PAD_LEFT);
        if (empty($twoDigitYear)) {
            $twoDigitYear = date('y');
        }

        $nimPrefix = $prefix . $twoDigitYear;

        // Ambil semua NIM yang berawalan $nimPrefix untuk mencari nomor urut terbesar
        $existingNims = Mahasiswa::where('nim', 'like', "{$nimPrefix}%")
            ->pluck('nim');

        $maxNumber = 0;
        foreach ($existingNims as $nim) {
            $suffix = substr($nim, strlen($nimPrefix));
            if (is_numeric($suffix)) {
                $num = (int) $suffix;
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $nextNumber = $maxNumber + 1;
        $nextSuffix = str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);

        return $nimPrefix . $nextSuffix;
    }
}
