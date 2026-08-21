<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Perwalian;
use App\Models\PerwalianLog;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Class DashboardController
 * Controller API untuk menyediakan metrics statistik, analitik Recharts, dan recent activity per role (Admin, Dosen, Mahasiswa).
 */
class DashboardController extends Controller
{
    use ApiResponseTrait;

    /**
     * @OA\Get(
     *     path="/dashboard/admin",
     *     summary="Dashboard Ringkasan Administrator",
     *     description="Menampilkan total statistik, grafik per semester, grafik status, grafik bulanan, dan recent activity.",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Berhasil mendapatkan statistik dashboard admin")
     * )
     */
    public function adminDashboard(): JsonResponse
    {
        $totalMahasiswa = Mahasiswa::count();
        $totalDosen = Dosen::count();
        $totalPerwalian = Perwalian::count();

        // Grafik Status (Pending, Disetujui, Ditolak)
        $chartStatus = [
            ['name' => 'Pending', 'value' => Perwalian::where('status', 'Pending')->count(), 'color' => '#f59e0b'],
            ['name' => 'Disetujui', 'value' => Perwalian::where('status', 'Disetujui')->count(), 'color' => '#10b981'],
            ['name' => 'Ditolak', 'value' => Perwalian::where('status', 'Ditolak')->count(), 'color' => '#ef4444'],
        ];

        // Grafik Per Semester (Bar Chart)
        $chartSemester = Perwalian::select('semester', DB::raw('count(*) as total'))
            ->groupBy('semester')
            ->orderBy('semester', 'asc')
            ->get();

        // Recent Activity Logs
        $recentActivities = PerwalianLog::with(['user', 'perwalian.mahasiswa'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user?->name ?? 'System',
                    'action' => "Perwalian di-{$log->status_baru}",
                    'detail' => $log->catatan ?? "Perubahan status dari {$log->status_sebelumnya} ke {$log->status_baru}",
                    'time' => $log->created_at?->diffForHumans(),
                ];
            });

        return $this->successResponse([
            'stats' => [
                'total_mahasiswa' => $totalMahasiswa,
                'total_dosen' => $totalDosen,
                'total_perwalian' => $totalPerwalian,
            ],
            'chart_status' => $chartStatus,
            'chart_semester' => $chartSemester,
            'recent_activities' => $recentActivities,
        ], 'Data dashboard admin berhasil didapatkan.');
    }

    /**
     * @OA\Get(
     *     path="/dashboard/dosen",
     *     summary="Dashboard Dosen Wali",
     *     description="Menampilkan total mahasiswa bimbingan, counter status perwalian, dan perwalian pending butuh tindakan.",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Berhasil mendapatkan statistik dashboard dosen")
     * )
     */
    public function dosenDashboard(Request $request): JsonResponse
    {
        $dosen = $request->user()->dosen;
        if (! $dosen) {
            return $this->errorResponse('Profil Dosen Wali tidak ditemukan.', 404);
        }

        $totalMahasiswa = Mahasiswa::where('dosen_wali_id', $dosen->id)->count();
        $perwalianQuery = Perwalian::where('dosen_id', $dosen->id);

        $totalPerwalian = (clone $perwalianQuery)->count();
        $pending = (clone $perwalianQuery)->where('status', 'Pending')->count();
        $approved = (clone $perwalianQuery)->where('status', 'Disetujui')->count();
        $rejected = (clone $perwalianQuery)->where('status', 'Ditolak')->count();

        $pendingList = Perwalian::with(['mahasiswa.user'])
            ->where('dosen_id', $dosen->id)
            ->where('status', 'Pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse([
            'stats' => [
                'total_mahasiswa' => $totalMahasiswa,
                'total_perwalian' => $totalPerwalian,
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
            ],
            'pending_approvals' => $pendingList,
        ], 'Data dashboard dosen berhasil didapatkan.');
    }

    /**
     * @OA\Get(
     *     path="/dashboard/mahasiswa",
     *     summary="Dashboard Mahasiswa",
     *     description="Menampilkan total perwalian, status pengajuan aktif, dan timeline riwayat bimbingan.",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Berhasil mendapatkan statistik dashboard mahasiswa")
     * )
     */
    public function mahasiswaDashboard(Request $request): JsonResponse
    {
        $mahasiswa = $request->user()->mahasiswa;
        if (! $mahasiswa) {
            return $this->errorResponse('Profil Mahasiswa tidak ditemukan.', 404);
        }

        $perwalianQuery = Perwalian::where('mahasiswa_id', $mahasiswa->id);

        $totalPerwalian = (clone $perwalianQuery)->count();
        $pending = (clone $perwalianQuery)->where('status', 'Pending')->count();
        $approved = (clone $perwalianQuery)->where('status', 'Disetujui')->count();
        $rejected = (clone $perwalianQuery)->where('status', 'Ditolak')->count();

        $recentPerwalian = (clone $perwalianQuery)
            ->with(['dosen.user', 'logs.user'])
            ->orderBy('created_at', 'desc')
            ->first();

        return $this->successResponse([
            'stats' => [
                'total_perwalian' => $totalPerwalian,
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
            ],
            'mahasiswa' => [
                'nim' => $mahasiswa->nim,
                'nama_lengkap' => $mahasiswa->nama_lengkap,
                'prodi' => $mahasiswa->prodi,
                'angkatan' => $mahasiswa->angkatan,
                'ipk_terakhir' => (float) $mahasiswa->ipk_terakhir,
                'sks_lulus' => (int) $mahasiswa->sks_lulus,
            ],
            'dosen_wali' => $mahasiswa->dosenWali,
            'active_perwalian' => $recentPerwalian,
        ], 'Data dashboard mahasiswa berhasil didapatkan.');
    }
}
