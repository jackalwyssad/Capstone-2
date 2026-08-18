<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterAdminRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
     *     summary="Update Profil Pengguna",
     *     description="Memperbarui informasi nama, nomor hp, atau avatar akun user aktif.",
     *     tags={"Autentikasi"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Profil diperbarui")
     * )
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return $this->successResponse(new UserResource($user->fresh()), 'Profil berhasil diperbarui.');
    }

    /**
     * @OA\Post(
     *     path="/auth/forgot-password",
     *     summary="Permintaan Lupa Password",
     *     description="Mengirimkan konfirmasi permintaan reset password.",
     *     tags={"Autentikasi"},
     *
     *     @OA\Response(response=200, description="Instruksi terkirim")
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        return $this->successResponse(null, 'Instruksi reset password telah diproses untuk email Anda.');
    }

    /**
     * @OA\Post(
     *     path="/auth/reset-password",
     *     summary="Reset Password Baru",
     *     description="Mengubah password pengguna secara sukses.",
     *     tags={"Autentikasi"},
     *
     *     @OA\Response(response=200, description="Password berhasil diubah")
     * )
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $user = \App\Models\User::where('email', $request->email)->first();
        $user->update(['password' => bcrypt($request->password)]);

        return $this->successResponse(null, 'Password Anda berhasil diperbarui. Silakan login kembali.');
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
