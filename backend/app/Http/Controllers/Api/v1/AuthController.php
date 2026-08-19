<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterAdminRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Class AuthController
 * Controller API Autentikasi (Login, Register Admin, Profile, Password Reset, Logout).
 */
class AuthController extends Controller
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * @OA\Post(
     *     path="/auth/login",
     *     summary="Autentikasi Login Pengguna",
     *     description="Endpoint untuk login pengguna (Admin, Dosen, Mahasiswa) menggunakan Email dan Password.",
     *     tags={"Autentikasi"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email","password"},
     *
     *             @OA\Property(property="email", type="string", format="email", example="admin@stmikbandung.ac.id"),
     *             @OA\Property(property="password", type="string", format="password", example="Admin123!")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Login Berhasil",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login berhasil."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Kredensial atau Validasi Salah")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'token_type' => $result['token_type'],
        ], 'Login berhasil.');
    }

    /**
     * @OA\Post(
     *     path="/auth/register-admin",
     *     summary="Registrasi Akun Admin Baru",
     *     description="Khusus registrasi administrator STMIK Bandung.",
     *     tags={"Autentikasi"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *
     *             @OA\Property(property="name", type="string", example="Super Administrator"),
     *             @OA\Property(property="email", type="string", example="admin2@stmikbandung.ac.id"),
     *             @OA\Property(property="password", type="string", example="Admin123!"),
     *             @OA\Property(property="password_confirmation", type="string", example="Admin123!")
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Admin Terdaftar")
     * )
     */
    public function registerAdmin(RegisterAdminRequest $request): JsonResponse
    {
        $user = $this->authService->registerAdmin($request->validated());

        return $this->successResponse(new UserResource($user), 'Akun Admin berhasil didaftarkan.', 201);
    }

    /**
     * @OA\Get(
     *     path="/auth/me",
     *     summary="Dapatkan Profil User Aktif",
     *     description="Mengembalikan data profil pengguna yang sedang login berdasarkan token Sanctum.",
     *     tags={"Autentikasi"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Profil ditemukan"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'dosen', 'mahasiswa.dosenWali']);

        return $this->successResponse(new UserResource($user), 'Data pengguna berhasil didapatkan.');
    }

    /**
     * @OA\Put(
     *     path="/auth/profile",
     *     summary="Update Profil Pengguna & Foto",
     *     description="Memperbarui informasi nama, nomor hp, atau mengunggah file foto/avatar akun user aktif ke penyimpanan lokal.",
     *     tags={"Autentikasi"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Profil diperbarui")
     * )
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'avatar' => 'nullable',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        if ($request->hasFile('foto') || $request->hasFile('avatar')) {
            $file = $request->file('foto') ?? $request->file('avatar');
            $dir = public_path('uploads/avatars');
            if (!file_exists($dir)) {
                mkdir($dir, 0777, true);
            }
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($dir, $filename);
            $avatarUrl = url('uploads/avatars/' . $filename);
            $user->avatar = $avatarUrl;

            if ($user->mahasiswa) {
                $user->mahasiswa->update(['foto' => $avatarUrl]);
            }
            if ($user->dosen) {
                $user->dosen->update(['foto' => $avatarUrl]);
            }
        } elseif ($request->filled('avatar') && is_string($request->avatar)) {
            $user->avatar = $request->avatar;
            if ($user->mahasiswa) {
                $user->mahasiswa->update(['foto' => $request->avatar]);
            }
            if ($user->dosen) {
                $user->dosen->update(['foto' => $request->avatar]);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone_number = $validated['phone_number'] ?? $user->phone_number;
        $user->save();

        $freshUser = $user->fresh(['roles', 'dosen', 'mahasiswa.dosenWali']);

        return $this->successResponse(new UserResource($freshUser), 'Profil berhasil diperbarui.');
    }

    /**
     * Upload Avatar Foto Profil Khusus ke Penyimpanan Lokal Server
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        $user = $request->user();
        $file = $request->file('foto');
        $dir = public_path('uploads/avatars');
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }

        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move($dir, $filename);
        $avatarUrl = url('uploads/avatars/' . $filename);

        $user->avatar = $avatarUrl;
        $user->save();

        if ($user->mahasiswa) {
            $user->mahasiswa->update(['foto' => $avatarUrl]);
        }
        if ($user->dosen) {
            $user->dosen->update(['foto' => $avatarUrl]);
        }

        $freshUser = $user->fresh(['roles', 'dosen', 'mahasiswa.dosenWali']);

        return $this->successResponse([
            'user' => new UserResource($freshUser),
            'avatar_url' => $avatarUrl,
        ], 'Foto profil berhasil diunggah dan disimpan ke server lokal.');
    }

    /**
     * @OA\Post(
     *     path="/auth/forgot-password",
     *     summary="Permintaan Lupa Password (Berlaku 5 Menit)",
     *     description="Membuat token reset password yang berlaku selama 5 menit dan mengirimkannya ke email.",
     *     tags={"Autentikasi"},
     *
     *     @OA\Response(response=200, description="Link terkirim")
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return $this->errorResponse('Email tidak terdaftar dalam sistem STMIK Bandung.', 404);
        }

        // Buat token acak 64 karakter aman
        $token = Str::random(64);

        // Hapus token lama untuk email ini
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        // Simpan token baru dengan timestamp saat ini
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        $resetUrl = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($user->email);

        // Kirim email via SMTP / Log Mailer
        try {
            Mail::raw("Halo {$user->name},\n\nAnda menerima email ini karena ada permintaan reset password untuk akun Anda di Sistem Informasi Perwalian STMIK Bandung.\n\nSilakan klik tautan berikut untuk mengatur ulang password Anda:\n{$resetUrl}\n\n⚠️ PENTING: Tautan reset password ini HANYA BERLAKU SELAMA 5 MENIT sejak email ini dikirim.\nJika tautan dibuka setelah 5 menit, tautan akan otomatis kadaluarsa.\n\nJika Anda tidak pernah meminta reset password, abaikan email ini.", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Reset Password Akun STMIK Bandung (Kadaluarsa 5 Menit)');
            });
        } catch (\Exception $e) {
            Log::warning('SMTP Mail Sending Exception: ' . $e->getMessage());
        }

        Log::info("=== [RESET PASSWORD LINK (Berlaku 5 Menit)] ===");
        Log::info("Email: {$user->email} | URL: {$resetUrl}");

        return $this->successResponse([
            'email' => $user->email,
            'token' => $token,
            'reset_url' => $resetUrl,
            'expires_in_minutes' => 5,
        ], 'Link reset password berhasil diproses dan dikirim ke email Anda. Link ini berlaku selama 5 menit.');
    }

    /**
     * Verifikasi Validitas & Status Expired Token Reset Password (5 Menit)
     */
    public function verifyResetToken(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'expired' => false,
                'message' => 'Token reset password tidak valid atau sudah pernah digunakan.',
            ], 422);
        }

        $createdAt = Carbon::parse($record->created_at);
        $isExpired = $createdAt->addMinutes(5)->isPast();

        if ($isExpired) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'expired' => true,
                'message' => 'Link reset password sudah kadaluarsa (expired lebih dari 5 menit). Silakan minta link baru.',
            ], 410);
        }

        return response()->json([
            'success' => true,
            'valid' => true,
            'expired' => false,
            'message' => 'Token reset password valid dan aktif.',
            'remaining_seconds' => max(0, $createdAt->diffInSeconds(now())),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/auth/reset-password",
     *     summary="Reset Password Baru dengan Token 5 Menit",
     *     description="Mengubah password pengguna jika token masih valid dalam 5 menit.",
     *     tags={"Autentikasi"},
     *
     *     @OA\Response(response=200, description="Password berhasil diubah")
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return $this->errorResponse('Token reset password tidak valid atau sudah pernah digunakan.', 422);
        }

        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(5)->isPast()) {
            return response()->json([
                'success' => false,
                'expired' => true,
                'message' => 'Link reset password sudah kadaluarsa (melebihi 5 menit). Silakan minta link reset password baru.',
            ], 410);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return $this->errorResponse('Pengguna dengan email tersebut tidak ditemukan.', 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus token setelah berhasil digunakan
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return $this->successResponse(null, 'Password Anda berhasil diperbarui! Silakan login menggunakan password baru.');
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     summary="Logout Pengguna",
     *     description="Menghapus token akses Sanctum pengguna.",
     *     tags={"Autentikasi"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Logout Berhasil")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(null, 'Logout berhasil. Token Anda telah dicabut.');
    }
}
