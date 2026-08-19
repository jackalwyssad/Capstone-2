<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\DosenController;
use App\Http\Controllers\Api\v1\ExportImportController;
use App\Http\Controllers\Api\v1\MahasiswaController;
use App\Http\Controllers\Api\v1\MatakuliahController;
use App\Http\Controllers\Api\v1\PerwalianController;
use App\Http\Controllers\Api\v1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sistem Perwalian Mahasiswa STMIK Bandung (v1)
|--------------------------------------------------------------------------
| Seluruh rute API backend terorganisir dengan prefix v1 dan autentikasi Laravel Sanctum.
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // Rute Publik (Hanya Login & Reset Password)
    // ==========================================
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::get('/verify-reset-token', [AuthController::class, 'verifyResetToken']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // ==========================================
    // Rute Terproteksi (Laravel Sanctum Bearer Token)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {

        // User & Profil Info
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/upload-avatar', [AuthController::class, 'uploadAvatar']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Dashboard Metrics per Role
        Route::prefix('dashboard')->group(function () {
            Route::get('/admin', [DashboardController::class, 'adminDashboard'])->middleware('role:Admin');
            Route::get('/dosen', [DashboardController::class, 'dosenDashboard'])->middleware('role:Dosen|Admin');
            Route::get('/mahasiswa', [DashboardController::class, 'mahasiswaDashboard'])->middleware('role:Mahasiswa|Admin');
        });

        // Dosen Wali Management
        Route::get('/dosen/all-list', [DosenController::class, 'allList']);
        Route::post('/dosen/assign-wali', [DosenController::class, 'assignWali'])->middleware('role:Admin');
        Route::post('/dosen/{id}/reset-password', [DosenController::class, 'resetPassword'])->middleware('role:Admin');
        Route::apiResource('dosen', DosenController::class);

        // Mahasiswa Management
        Route::post('/mahasiswa/import', [MahasiswaController::class, 'import'])->middleware('role:Admin');
        Route::post('/mahasiswa/{id}/reset-password', [MahasiswaController::class, 'resetPassword'])->middleware('role:Admin');
        Route::apiResource('mahasiswa', MahasiswaController::class);

        // Perwalian Core Workflow
        Route::post('/perwalian/{id}/approve-reject', [PerwalianController::class, 'approveReject'])->middleware('role:Dosen|Admin');
        Route::apiResource('perwalian', PerwalianController::class);

        // Matakuliah & Jadwal Perkuliahan
        Route::apiResource('matakuliah', MatakuliahController::class);

        // User & Role Management (Admin only)
        Route::middleware('role:Admin')->group(function () {
            Route::get('/users/roles', [UserController::class, 'roles']);
            Route::post('/users/{id}/reset-default-password', [UserController::class, 'resetDefaultPassword']);
            Route::apiResource('users', UserController::class);
            // Register Admin baru hanya bisa dilakukan oleh Admin yang sudah login
            Route::post('/auth/register-admin', [AuthController::class, 'registerAdmin']);
        });

        // Export Laporan & Rekapitulasi
        Route::get('/export/perwalian/excel', [ExportImportController::class, 'exportExcel']);
    });
});
