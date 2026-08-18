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
    public function exportExcel(): JsonResponse
    {
        $data = $this->exportImportService->getExportPerwalianData();

        return $this->successResponse($data, 'Data ekspor Excel rekap perwalian berhasil didapatkan.');
    }
}
