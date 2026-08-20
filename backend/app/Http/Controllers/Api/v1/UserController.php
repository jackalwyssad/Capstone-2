<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

/**
 * Class UserController
 * Controller API untuk Kelola User & Kelola Role Spatie (Admin STMIK Bandung).
 */
class UserController extends Controller
{
    use ApiResponseTrait;

    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @OA\Get(
     *     path="/users",
     *     summary="Daftar Pengguna & Role",
     *     tags={"Kelola User & Role"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Daftar pengguna didapatkan")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'role']);
        $perPage = $request->get('per_page', 10);
        $users = $this->userService->getPaginatedUsers($filters, $perPage);

        return $this->paginatedResponse(UserResource::collection($users), 'Daftar pengguna berhasil didapatkan.');
    }

    /**
     * @OA\Get(
     *     path="/users/roles",
     *     summary="Daftar Master Role Spatie",
     *     tags={"Kelola User & Role"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Daftar role")
     * )
     */
    public function roles(): JsonResponse
    {
        $roles = Role::all();

        return $this->successResponse($roles, 'Daftar role berhasil didapatkan.');
    }

    /**
     * @OA\Post(
     *     path="/users",
     *     summary="Buat User Baru",
     *     tags={"Kelola User & Role"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=201, description="User berhasil dibuat")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $role = $request->input('role', 'Mahasiswa');

        // Otomatis isi default password jika tidak diisi
        if (empty($request->password)) {
            $defaultPassword = $role === 'Mahasiswa' ? 'Mahasiswa123' : ($role === 'Dosen' ? 'Dosen123' : 'Admin123');
            $request->merge(['password' => $defaultPassword]);
        }

        // Otomatis isi default email jika mahasiswa & email tidak diisi
        if (empty($request->email) && $role === 'Mahasiswa' && !empty($request->nim)) {
            $request->merge(['email' => strtolower($request->nim) . '@student.stmikbandung.ac.id']);
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'phone_number' => 'nullable|string|max:20',
        ];

        if ($role === 'Mahasiswa') {
            $rules['nim'] = 'required|string|max:20|unique:mahasiswa,nim';
            $rules['jenis_kelamin'] = 'nullable|string|in:Laki-laki,Perempuan';
            $rules['prodi'] = 'nullable|string|in:Teknik Informatika,Sistem Informasi';
            $rules['angkatan'] = 'nullable|string|max:10';
            $rules['dosen_wali_id'] = 'nullable|exists:dosen,id';
        } elseif ($role === 'Dosen') {
            $rules['nidn'] = 'required|string|max:20|unique:dosen,nidn';
            $rules['jenis_kelamin'] = 'nullable|string|in:Laki-laki,Perempuan';
            $rules['gelar'] = 'nullable|string|max:50';
        }

        $validated = $request->validate($rules, [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Email pengguna wajib diisi.',
            'email.unique' => 'Alamat email ini sudah terdaftar dalam sistem.',
            'password.min' => 'Password minimal 6 karakter.',
            'role.required' => 'Role pengguna wajib dipilih.',
            'nim.required' => 'NIM Mahasiswa wajib diisi.',
            'nim.unique' => 'NIM ini sudah terdaftar dalam sistem.',
            'nidn.required' => 'NIDN Dosen wajib diisi.',
            'nidn.unique' => 'NIDN ini sudah terdaftar dalam sistem.',
        ]);

        $user = $this->userService->createUser($validated);

        return $this->successResponse(new UserResource($user), 'Pengguna berhasil ditambahkan.', 201);
    }

    /**
     * @OA\Put(
     *     path="/users/{id}",
     *     summary="Update User & Role",
     *     tags={"Kelola User & Role"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="User diperbarui")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::with(['roles', 'dosen', 'mahasiswa'])->find($id);
        if (! $user) {
            return $this->errorResponse('Pengguna tidak ditemukan.', 404);
        }

        $role = $request->input('role', $user->roles?->first()?->name ?? 'Mahasiswa');

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ];

        if ($role === 'Mahasiswa') {
            $mhsId = $user->mahasiswa?->id;
            $rules['nim'] = 'nullable|string|max:20' . ($mhsId ? '|unique:mahasiswa,nim,'.$mhsId : '|unique:mahasiswa,nim');
            $rules['jenis_kelamin'] = 'nullable|string|in:Laki-laki,Perempuan';
            $rules['prodi'] = 'nullable|string|in:Teknik Informatika,Sistem Informasi';
            $rules['angkatan'] = 'nullable|string|max:10';
            $rules['dosen_wali_id'] = 'nullable|exists:dosen,id';
        } elseif ($role === 'Dosen') {
            $dosenId = $user->dosen?->id;
            $rules['nidn'] = 'nullable|string|max:20' . ($dosenId ? '|unique:dosen,nidn,'.$dosenId : '|unique:dosen,nidn');
            $rules['jenis_kelamin'] = 'nullable|string|in:Laki-laki,Perempuan';
            $rules['gelar'] = 'nullable|string|max:50';
        }

        $validated = $request->validate($rules, [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.unique' => 'Alamat email ini sudah terdaftar dalam sistem.',
            'nim.unique' => 'NIM ini sudah terdaftar dalam sistem.',
            'nidn.unique' => 'NIDN ini sudah terdaftar dalam sistem.',
        ]);

        $updated = $this->userService->updateUser($user, $validated);

        return $this->successResponse(new UserResource($updated), 'Pengguna berhasil diperbarui.');
    }

    /**
     * @OA\Delete(
     *     path="/users/{id}",
     *     summary="Hapus User",
     *     tags={"Kelola User & Role"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="User dihapus")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return $this->errorResponse('Pengguna tidak ditemukan.', 404);
        }
        $this->userService->deleteUser($user);

        return $this->successResponse(null, 'Pengguna berhasil dihapus.');
    }

    /**
     * Reset Password User ke default sesuai rolenya.
     */
    public function resetDefaultPassword(int $id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return $this->errorResponse('Pengguna tidak ditemukan.', 404);
        }

        $defaultPassword = $user->hasRole('Admin') ? 'Admin123' : ($user->hasRole('Dosen') ? 'Dosen123' : 'Mahasiswa123');
        $user->update(['password' => bcrypt($defaultPassword)]);

        return $this->successResponse([
            'default_password' => $defaultPassword,
        ], "Password pengguna {$user->name} berhasil direset ke: {$defaultPassword}");
    }
}
