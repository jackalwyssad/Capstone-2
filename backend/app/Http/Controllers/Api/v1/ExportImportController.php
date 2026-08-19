<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\ExportImportService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

/**
 * Class ExportImportController
 * Controller API untuk Ekspor Laporan Excel & PDF Rekapitulasi Perwalian.
 */
class ExportImportController extends Controller
{
    use ApiResponseTrait;

    protected ExportImportService $exportImportService;

    public function __construct(ExportImportService $exportImportService)
    {
        $this->exportImportService = $exportImportService;
    }

    /**
     * @OA\Get(
     *     path="/export/perwalian/excel",
     *     summary="Ekspor Data Rekap Perwalian ke Format Array Excel",
     *     tags={"Laporan & Rekap"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Data ekspor excel")
     * )
     */
    public function exportExcel(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['search', 'status', 'semester']);

        if ($user->hasRole('Mahasiswa')) {
            $filters['mahasiswa_id'] = $user->mahasiswa?->id ?? -1;
        } elseif ($user->hasRole('Dosen')) {
            $filters['dosen_id'] = $user->dosen?->id ?? -1;
        }

        $data = $this->exportImportService->getExportPerwalianData($filters);

        return $this->successResponse($data, 'Data ekspor Excel rekap perwalian berhasil didapatkan.');
    }
}
