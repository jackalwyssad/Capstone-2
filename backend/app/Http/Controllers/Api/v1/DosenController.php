<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dosen\AssignDosenWaliRequest;
use App\Http\Requests\Dosen\StoreDosenRequest;
use App\Http\Requests\Dosen\UpdateDosenRequest;
use App\Http\Resources\DosenResource;
use App\Models\Dosen;
use App\Services\DosenService;
use App\Services\MahasiswaService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class DosenController
 * Controller API untuk Kelola Data Dosen Wali (CRUD, List, Assign Wali) STMIK Bandung.
 */
class DosenController extends Controller
{
    use ApiResponseTrait;

    protected DosenService $dosenService;

    protected MahasiswaService $mahasiswaService;

    public function __construct(DosenService $dosenService, MahasiswaService $mahasiswaService)
    {
        $this->dosenService = $dosenService;
        $this->mahasiswaService = $mahasiswaService;
    }

    /**
     * @OA\Get(
     *     path="/dosen",
     *     summary="Daftar Dosen Wali (Paginated & Filtered)",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="search", in="query", description="Cari nama/nidn", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", description="Halaman", required=false, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Berhasil mendapatkan data dosen")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);
        $dosenList = $this->dosenService->getPaginatedDosen($filters, $perPage);

        return $this->paginatedResponse(
            DosenResource::collection($dosenList),
            'Daftar Dosen Wali berhasil didapatkan.'
        );
    }

    /**
     * @OA\Get(
     *     path="/dosen/all-list",
     *     summary="Dropdown Option List Seluruh Dosen Wali",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Dropdown list dosen")
     * )
     */
    public function allList(): JsonResponse
    {
        $list = $this->dosenService->getDosenList();

        return $this->successResponse($list, 'Daftar pilihan dosen berhasil didapatkan.');
    }

    /**
     * @OA\Post(
     *     path="/dosen",
     *     summary="Tambah Dosen Wali Baru",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=201, description="Dosen berhasil dibuat")
     * )
     */
    public function store(StoreDosenRequest $request): JsonResponse
    {
        $dosen = $this->dosenService->createDosen($request->validated());

        return $this->successResponse(new DosenResource($dosen), 'Data Dosen Wali berhasil ditambahkan.', 201);
    }

    /**
     * @OA\Get(
     *     path="/dosen/{id}",
     *     summary="Detail Data Dosen Wali",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Detail Dosen")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $dosen = $this->dosenService->getDosenById($id);
        if (! $dosen) {
            return $this->errorResponse('Data Dosen tidak ditemukan.', 404);
        }

        return $this->successResponse(new DosenResource($dosen), 'Detail Dosen berhasil didapatkan.');
    }

    /**
     * @OA\Put(
     *     path="/dosen/{id}",
     *     summary="Update Data Dosen Wali",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Dosen diperbarui")
     * )
     */
    public function update(UpdateDosenRequest $request, int $id): JsonResponse
    {
        $dosen = $this->dosenService->getDosenById($id);
        if (! $dosen) {
            return $this->errorResponse('Data Dosen tidak ditemukan.', 404);
        }
        $updated = $this->dosenService->updateDosen($dosen, $request->validated());

        return $this->successResponse(new DosenResource($updated), 'Data Dosen berhasil diperbarui.');
    }

    /**
     * @OA\Delete(
     *     path="/dosen/{id}",
     *     summary="Hapus Data Dosen Wali",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Dosen dihapus")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $dosen = $this->dosenService->getDosenById($id);
        if (! $dosen) {
            return $this->errorResponse('Data Dosen tidak ditemukan.', 404);
        }
        $this->dosenService->deleteDosen($dosen);

        return $this->successResponse(null, 'Data Dosen berhasil dihapus.');
    }

    /**
     * @OA\Post(
     *     path="/dosen/assign-wali",
     *     summary="Penetapan Bulk Dosen Wali ke Mahasiswa",
     *     tags={"Dosen Wali"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Penetapan Dosen Wali sukses")
     * )
     */
    public function assignWali(AssignDosenWaliRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $this->mahasiswaService->assignDosenWali($validated['mahasiswa_ids'], $validated['dosen_id']);

        return $this->successResponse(null, 'Dosen Wali berhasil ditugaskan ke mahasiswa terpilih.');
    }

    /**
     * Reset Password Dosen ke Default (Dosen123) oleh Admin.
     */
    public function resetPassword(int $id): JsonResponse
    {
        $dosen = $this->dosenService->getDosenById($id);
        if (! $dosen || ! $dosen->user) {
            return $this->errorResponse('Data Dosen atau Akun Pengguna tidak ditemukan.', 404);
        }

        $defaultPassword = 'Dosen123';
        $dosen->user->update(['password' => bcrypt($defaultPassword)]);

        return $this->successResponse([
            'default_password' => $defaultPassword,
        ], "Password dosen {$dosen->nama_lengkap} berhasil direset ke: {$defaultPassword}");
    }
}
