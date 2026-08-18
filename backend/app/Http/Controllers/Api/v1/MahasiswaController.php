<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mahasiswa\ImportMahasiswaRequest;
use App\Http\Requests\Mahasiswa\StoreMahasiswaRequest;
use App\Http\Requests\Mahasiswa\UpdateMahasiswaRequest;
use App\Http\Resources\MahasiswaResource;
use App\Services\ExportImportService;
use App\Services\MahasiswaService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class MahasiswaController
 * Controller API untuk Kelola Data Mahasiswa (CRUD, Searching, Filtering, Import) STMIK Bandung.
 */
class MahasiswaController extends Controller
{
    use ApiResponseTrait;

    protected MahasiswaService $mahasiswaService;

    protected ExportImportService $exportImportService;

    public function __construct(MahasiswaService $mahasiswaService, ExportImportService $exportImportService)
    {
        $this->mahasiswaService = $mahasiswaService;
        $this->exportImportService = $exportImportService;
    }

    /**
     * @OA\Get(
     *     path="/mahasiswa",
     *     summary="Daftar Mahasiswa (Paginated, Search, Filter)",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="search", in="query", description="Cari nama/NIM", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="prodi", in="query", description="Filter Prodi", required=false, @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="Daftar mahasiswa didapatkan")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'prodi', 'angkatan', 'dosen_wali_id', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);
        $mahasiswaList = $this->mahasiswaService->getPaginatedMahasiswa($filters, $perPage);

        return $this->paginatedResponse(
            MahasiswaResource::collection($mahasiswaList),
            'Daftar Mahasiswa berhasil didapatkan.'
        );
    }

    /**
     * @OA\Post(
     *     path="/mahasiswa",
     *     summary="Tambah Data Mahasiswa Baru",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=201, description="Mahasiswa berhasil dibuat")
     * )
     */
    public function store(StoreMahasiswaRequest $request): JsonResponse
    {
        $mahasiswa = $this->mahasiswaService->createMahasiswa($request->validated());

        return $this->successResponse(new MahasiswaResource($mahasiswa), 'Data Mahasiswa berhasil ditambahkan.', 201);
    }

    /**
     * @OA\Get(
     *     path="/mahasiswa/{id}",
     *     summary="Detail Data Mahasiswa",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Detail Mahasiswa")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $mahasiswa = $this->mahasiswaService->getMahasiswaById($id);
        if (! $mahasiswa) {
            return $this->errorResponse('Data Mahasiswa tidak ditemukan.', 404);
        }

        return $this->successResponse(new MahasiswaResource($mahasiswa), 'Detail Mahasiswa berhasil didapatkan.');
    }

    /**
     * @OA\Put(
     *     path="/mahasiswa/{id}",
     *     summary="Update Data Mahasiswa",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Mahasiswa diperbarui")
     * )
     */
    public function update(UpdateMahasiswaRequest $request, int $id): JsonResponse
    {
        $mahasiswa = $this->mahasiswaService->getMahasiswaById($id);
        if (! $mahasiswa) {
            return $this->errorResponse('Data Mahasiswa tidak ditemukan.', 404);
        }
        $updated = $this->mahasiswaService->updateMahasiswa($mahasiswa, $request->validated());

        return $this->successResponse(new MahasiswaResource($updated), 'Data Mahasiswa berhasil diperbarui.');
    }

    /**
     * @OA\Delete(
     *     path="/mahasiswa/{id}",
     *     summary="Hapus Data Mahasiswa",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Mahasiswa dihapus")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $mahasiswa = $this->mahasiswaService->getMahasiswaById($id);
        if (! $mahasiswa) {
            return $this->errorResponse('Data Mahasiswa tidak ditemukan.', 404);
        }
        $this->mahasiswaService->deleteMahasiswa($mahasiswa);

        return $this->successResponse(null, 'Data Mahasiswa berhasil dihapus.');
    }

    /**
     * @OA\Post(
     *     path="/mahasiswa/import",
     *     summary="Import Massal Data Mahasiswa",
     *     tags={"Mahasiswa"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Import data sukses")
     * )
     */
    public function import(ImportMahasiswaRequest $request): JsonResponse
    {
        $count = $this->exportImportService->importMahasiswaData($request->validated()['data']);

        return $this->successResponse(['imported_count' => $count], "Berhasil mengimpor {$count} data mahasiswa.");
    }
}
