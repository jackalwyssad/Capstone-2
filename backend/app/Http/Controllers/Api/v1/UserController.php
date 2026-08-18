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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
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
        $user = User::find($id);
        if (! $user) {
            return $this->errorResponse('Pengguna tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|exists:roles,name',
            'is_active' => 'nullable|boolean',
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
}
