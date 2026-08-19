<?php

namespace App\Http\Requests\Mahasiswa;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateMahasiswaRequest
 * Validasi form perbaikan/update data Mahasiswa.
 */
class UpdateMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        $routeParam = $this->route('mahasiswa') ?? $this->route('id') ?? $this->id;
        $mhsId = is_object($routeParam) ? $routeParam->id : $routeParam;

        return [
            'nim' => ['required', 'string', 'max:20', 'unique:mahasiswa,nim,'.$mhsId],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'prodi' => ['required', 'in:Teknik Informatika,Sistem Informasi'],
            'angkatan' => ['required', 'string', 'max:10'],
            'dosen_wali_id' => ['nullable', 'exists:dosen,id'],
            'ipk_terakhir' => ['nullable', 'numeric', 'min:0', 'max:4.00'],
            'sks_lulus' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nim.required' => 'NIM Mahasiswa wajib diisi.',
            'nim.unique' => 'NIM sudah terdaftar dalam sistem.',
            'nama_lengkap.required' => 'Nama lengkap mahasiswa wajib diisi.',
            'prodi.required' => 'Program studi wajib dipilih.',
            'prodi.in' => 'Program studi harus Teknik Informatika atau Sistem Informasi.',
            'angkatan.required' => 'Tahun angkatan mahasiswa wajib diisi.',
        ];
    }
}
