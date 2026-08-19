<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatakuliahResource;
use App\Models\Matakuliah;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatakuliahController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Matakuliah::query();

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('ruangan', 'like', "%{$search}%")
                  ->orWhere('dosen_pengampu', 'like', "%{$search}%");
            });
        }

        if ($request->filled('semester')) {
            $query->where('semester', (int) $request->query('semester'));
        }

        if ($request->filled('prodi')) {
            $query->where(function ($q) use ($request) {
                $q->where('prodi', $request->query('prodi'))
                  ->orWhere('prodi', 'Umum');
            });
        }

        if ($request->filled('hari')) {
            $query->where('hari', $request->query('hari'));
        }

        if ($request->boolean('all')) {
            $items = $query->orderBy('semester')->orderBy('kode')->get();
            return $this->successResponse(MatakuliahResource::collection($items), 'Daftar seluruh mata kuliah berhasil diambil.');
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->orderBy('semester')->orderBy('kode')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => MatakuliahResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:20|unique:matakuliah,kode',
            'nama' => 'required|string|max:150',
            'sks' => 'required|integer|min:1|max:6',
            'semester' => 'required|integer|min:1|max:8',
            'prodi' => 'required|string|in:Teknik Informatika,Sistem Informasi,Umum',
            'hari' => 'required|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|string|max:10',
            'jam_selesai' => 'required|string|max:10',
            'ruangan' => 'required|string|max:50',
            'dosen_pengampu' => 'nullable|string|max:100',
            'kuota' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ], [
            'kode.required' => 'Kode mata kuliah wajib diisi.',
            'kode.unique' => 'Kode mata kuliah ini sudah terdaftar di sistem. Silakan gunakan kode lain.',
            'kode.max' => 'Kode mata kuliah maksimal 20 karakter.',
            'nama.required' => 'Nama mata kuliah wajib diisi.',
            'nama.max' => 'Nama mata kuliah maksimal 150 karakter.',
            'sks.required' => 'Bobot SKS wajib diisi.',
            'sks.min' => 'Bobot SKS minimal 1 SKS.',
            'sks.max' => 'Bobot SKS maksimal 6 SKS.',
            'semester.required' => 'Semester wajib diisi.',
            'semester.min' => 'Semester minimal 1.',
            'semester.max' => 'Semester maksimal 8.',
            'prodi.required' => 'Program studi wajib dipilih.',
            'prodi.in' => 'Program studi yang dipilih tidak valid.',
            'hari.required' => 'Hari perkuliahan wajib dipilih.',
            'hari.in' => 'Pilihan hari perkuliahan tidak valid.',
            'jam_mulai.required' => 'Jam mulai kuliah wajib diisi.',
            'jam_selesai.required' => 'Jam selesai kuliah wajib diisi.',
            'ruangan.required' => 'Ruangan perkuliahan wajib diisi.',
            'ruangan.max' => 'Nama ruangan maksimal 50 karakter.',
            'dosen_pengampu.max' => 'Nama dosen pengampu maksimal 100 karakter.',
        ]);

        $mk = Matakuliah::create($validated);

        return $this->successResponse(new MatakuliahResource($mk), 'Mata kuliah berhasil ditambahkan ke database.', 201);
    }

    public function show(Matakuliah $matakuliah): JsonResponse
    {
        return $this->successResponse(new MatakuliahResource($matakuliah), 'Detail mata kuliah berhasil diambil.');
    }

    public function update(Request $request, Matakuliah $matakuliah): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'sometimes|string|max:20|unique:matakuliah,kode,' . $matakuliah->id,
            'nama' => 'sometimes|string|max:150',
            'sks' => 'sometimes|integer|min:1|max:6',
            'semester' => 'sometimes|integer|min:1|max:8',
            'prodi' => 'sometimes|string|in:Teknik Informatika,Sistem Informasi,Umum',
            'hari' => 'sometimes|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'sometimes|string|max:10',
            'jam_selesai' => 'sometimes|string|max:10',
            'ruangan' => 'sometimes|string|max:50',
            'dosen_pengampu' => 'nullable|string|max:100',
            'kuota' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ], [
            'kode.unique' => 'Kode mata kuliah ini sudah terdaftar di sistem. Silakan gunakan kode lain.',
            'kode.max' => 'Kode mata kuliah maksimal 20 karakter.',
            'nama.max' => 'Nama mata kuliah maksimal 150 karakter.',
            'sks.min' => 'Bobot SKS minimal 1 SKS.',
            'sks.max' => 'Bobot SKS maksimal 6 SKS.',
            'semester.min' => 'Semester minimal 1.',
            'semester.max' => 'Semester maksimal 8.',
            'prodi.in' => 'Program studi yang dipilih tidak valid.',
            'hari.in' => 'Pilihan hari perkuliahan tidak valid.',
            'ruangan.max' => 'Nama ruangan maksimal 50 karakter.',
            'dosen_pengampu.max' => 'Nama dosen pengampu maksimal 100 karakter.',
        ]);

        $matakuliah->update($validated);

        return $this->successResponse(new MatakuliahResource($matakuliah), 'Data mata kuliah berhasil diperbarui.');
    }

    public function destroy(Matakuliah $matakuliah): JsonResponse
    {
        $matakuliah->delete();

        return $this->successResponse(null, 'Mata kuliah berhasil dihapus dari database.');
    }
}
