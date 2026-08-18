<?php

namespace App\Http\Requests\Mahasiswa;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreMahasiswaRequest
 * Validasi form pendaftaran data Mahasiswa baru oleh Admin STMIK Bandung.
 */
class StoreMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'nim' => ['required', 'string', 'max:20', 'unique:mahasiswa,nim'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'prodi' => ['required', 'in:Teknik Informatika,Sistem Informasi'],
            'angkatan' => ['required', 'string', 'max:10'],
            'dosen_wali_id' => ['nullable', 'exists:dosen,id'],
            'ipk_terakhir' => ['nullable', 'numeric', 'min:0', 'max:4.00'],
            'sks_lulus' => ['nullable', 'integer', 'min:0'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
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
        ];
    }
}
