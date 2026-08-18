<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Perwalian\ApproveRejectPerwalianRequest;
use App\Http\Requests\Perwalian\StorePerwalianRequest;
use App\Http\Requests\Perwalian\UpdatePerwalianRequest;
use App\Http\Resources\PerwalianResource;
use App\Services\PerwalianService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PerwalianController
 * Controller API Utama Perwalian Mahasiswa STMIK Bandung (Pengajuan, Update Pending, Approve/Reject Dosen, Histori Audit).
 */
class PerwalianController extends Controller
{
    use ApiResponseTrait;

    protected PerwalianService $perwalianService;

    public function __construct(PerwalianService $perwalianService)
    {
        $this->perwalianService = $perwalianService;
    }

    /**
     * @OA\Get(
     *     path="/perwalian",
     *     summary="Daftar Perwalian (Filter Role, Status, Semester)",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="status", in="query", description="Filter Status: Pending/Disetujui/Ditolak", required=false, @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="Berhasil mendapatkan data perwalian")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['search', 'status', 'semester', 'sort_by', 'sort_order']);

        // Filter berdasarkan role user login
        if ($user->hasRole('Mahasiswa')) {
            $filters['mahasiswa_id'] = $user->mahasiswa?->id;
        } elseif ($user->hasRole('Dosen')) {
            $filters['dosen_id'] = $user->dosen?->id;
        }

        $perPage = $request->get('per_page', 10);
        $perwalianList = $this->perwalianService->getPaginatedPerwalian($filters, $perPage);

        return $this->paginatedResponse(
            PerwalianResource::collection($perwalianList),
            'Daftar data perwalian berhasil didapatkan.'
        );
    }

    /**
     * @OA\Post(
     *     path="/perwalian",
     *     summary="Pengajuan Perwalian Baru oleh Mahasiswa",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=201, description="Pengajuan perwalian berhasil disimpan")
     * )
     */
    public function store(StorePerwalianRequest $request): JsonResponse
    {
        $perwalian = $this->perwalianService->createPerwalian($request->validated(), $request->user());

        return $this->successResponse(new PerwalianResource($perwalian), 'Pengajuan perwalian berhasil disimpan dengan status Pending.', 201);
    }

    /**
     * @OA\Get(
     *     path="/perwalian/{id}",
     *     summary="Detail Data Perwalian & Timeline Histori Audit",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Detail perwalian ditemukan")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $perwalian = $this->perwalianService->getPerwalianById($id);
        if (! $perwalian) {
            return $this->errorResponse('Data perwalian tidak ditemukan.', 404);
        }

        return $this->successResponse(new PerwalianResource($perwalian), 'Detail perwalian berhasil didapatkan.');
    }

    /**
     * @OA\Put(
     *     path="/perwalian/{id}",
     *     summary="Update Data Perwalian (Hanya untuk Status Pending)",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Perwalian berhasil diperbarui")
     * )
     */
    public function update(UpdatePerwalianRequest $request, int $id): JsonResponse
    {
        $perwalian = $this->perwalianService->getPerwalianById($id);
        if (! $perwalian) {
            return $this->errorResponse('Data perwalian tidak ditemukan.', 404);
        }

        $updated = $this->perwalianService->updatePerwalian($perwalian, $request->validated(), $request->user());

        return $this->successResponse(new PerwalianResource($updated), 'Data perwalian berhasil diperbarui.');
    }

    /**
     * @OA\Delete(
     *     path="/perwalian/{id}",
     *     summary="Hapus Data Perwalian (Hanya untuk Status Pending)",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Perwalian dihapus")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $perwalian = $this->perwalianService->getPerwalianById($id);
        if (! $perwalian) {
            return $this->errorResponse('Data perwalian tidak ditemukan.', 404);
        }

        $this->perwalianService->deletePerwalian($perwalian);

        return $this->successResponse(null, 'Data perwalian berhasil dihapus.');
    }

    /**
     * @OA\Post(
     *     path="/perwalian/{id}/approve-reject",
     *     summary="Approval/Rejection Perwalian oleh Dosen Wali",
     *     tags={"Perwalian"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"status"},
     *
     *             @OA\Property(property="status", type="string", enum={"Disetujui","Ditolak"}, example="Disetujui"),
     *             @OA\Property(property="catatan_dosen", type="string", example="Rencana mata kuliah sudah tepat. Lanjutkan perwalian.")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Persetujuan perwalian berhasil diproses")
     * )
     */
    public function approveReject(ApproveRejectPerwalianRequest $request, int $id): JsonResponse
    {
        $perwalian = $this->perwalianService->getPerwalianById($id);
        if (! $perwalian) {
            return $this->errorResponse('Data perwalian tidak ditemukan.', 404);
        }

        $validated = $request->validated();
        $updated = $this->perwalianService->approveOrReject(
            $perwalian,
            $validated['status'],
            $validated['catatan_dosen'] ?? null,
            $request->user()
        );

        return $this->successResponse(
            new PerwalianResource($updated),
            "Perwalian berhasil di-{$validated['status']}."
        );
    }
}
