<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait ApiResponseTrait
 * Trait ini berfungsi untuk menyeragamkan format respon JSON REST API (Standard API Response)
 * pada seluruh Endpoint Controller di Backend Laravel.
 * Membantu frontend (Axios & TanStack Query) dalam membaca status, pesan, data, dan pagination secara konsisten.
 */
trait ApiResponseTrait
{
    /**
     * Respon sukses (HTTP 200 / 201)
     *
     * @param  mixed  $data  Data payload yang dikirimkan ke frontend
     * @param  string  $message  Pesan konfirmasi sukses
     * @param  int  $code  Status code HTTP (default: 200 OK)
     * @return JsonResponse Format JSON terspesifikasi
     */
    public function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Respon error (HTTP 400, 401, 403, 404, 422, 500)
     *
     * @param  string  $message  Pesan deskripsi kesalahan
     * @param  int  $code  Status code HTTP kesalahan
     * @param  mixed  $errors  rincian error validasi atau exception log
     * @return JsonResponse Format JSON kesalahan
     */
    public function errorResponse(string $message = 'An error occurred', int $code = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    /**
     * Respon ber-paginasi (Paginated API Response)
     *
     * @param  mixed  $paginatedData  Instance lengthAwarePaginator atau Resource Collection
     * @param  string  $message  Pesan konfirmasi
     * @return JsonResponse JSON berisi data dan meta pagination (page, total, limit)
     */
    public function paginatedResponse($paginatedData, string $message = 'Data retrieved successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginatedData->items(),
            'meta' => [
                'current_page' => $paginatedData->currentPage(),
                'last_page' => $paginatedData->lastPage(),
                'per_page' => $paginatedData->perPage(),
                'total' => $paginatedData->total(),
            ],
        ]);
    }
}
