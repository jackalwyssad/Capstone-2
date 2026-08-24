<?php

namespace App\Services;

use App\Interfaces\AuthRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Class AuthService
 * Layanan bisnis (Business Logic) untuk manajemen autentikasi Sanctum, token, dan reset password.
 */
class AuthService
{
    protected AuthRepositoryInterface $authRepository;

    public function __construct(AuthRepositoryInterface $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    /**
     * Memproses login user (Admin, Dosen, atau Mahasiswa) dan menghasilkan Sanctum Bearer Token.
     * Field 'identifier' menerima Email (Admin/Mahasiswa) atau NIDN (Dosen).
     */
    public function login(array $credentials): array
    {
        $identifier = $credentials['identifier'];

        // Deteksi apakah identifier adalah NIDN (hanya angka) atau Email
        if (preg_match('/^\d+$/', $identifier)) {
            // Masukan hanya angka → cari sebagai NIDN Dosen
            $user = $this->authRepository->findByNidn($identifier);
        } else {
            // Masukan mengandung huruf/@ → cari sebagai Email
            $user = $this->authRepository->findByEmail($identifier);
        }

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Kredensial email/NIDN atau password yang Anda masukkan salah.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifier' => ['Akun Anda nonaktif. Silakan hubungi Administrator STMIK Bandung.'],
            ]);
        }

        // Generate Sanctum Bearer Token
        $token = $user->createToken('stmik_perwalian_token')->plainTextToken;

        return [
            'user'       => $user->load(['roles', 'dosen', 'mahasiswa']),
            'token'      => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Mendaftarkan akun Admin baru.
     */
    public function registerAdmin(array $data): User
    {
        $data['password'] = bcrypt($data['password']);
        $user = $this->authRepository->createUser($data);
        $user->assignRole('Admin');

        return $user;
    }

    /**
     * Logout akun user dengan menghapus token Sanctum saat ini.
     */
    public function logout(User $user): bool
    {
        return $user->currentAccessToken()->delete();
    }
}
