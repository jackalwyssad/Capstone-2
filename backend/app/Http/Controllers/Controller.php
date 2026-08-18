<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="API Sistem Perwalian Mahasiswa STMIK Bandung",
 *     description="Dokumentasi REST API Enterprise untuk Sistem Perwalian Mahasiswa STMIK Bandung. Mengelola Autentikasi Sanctum, Data Dosen Wali, Data Mahasiswa, Pengajuan dan Review Perwalian, serta Rekapitulasi Laporan.",
 *
 *     @OA\Contact(
 *         name="Tim Capstone STMIK Bandung",
 *         email="admin@stmikbandung.ac.id"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api/v1",
 *     description="Server API Lokal STMIK Bandung"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Masukkan token Bearer Sanctum hasil autentikasi login (Contoh: 'Bearer {token}')"
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
