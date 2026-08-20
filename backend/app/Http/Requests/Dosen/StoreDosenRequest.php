<?php

namespace App\Http\Requests\Dosen;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreDosenRequest
 * Validasi form tambah data Dosen Wali STMIK Bandung.
 */
class StoreDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'nidn' => ['required', 'string', 'max:20', 'unique:dosen,nidn'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['nullable', 'in:Laki-laki,Perempuan'],
            'gelar' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'unique:dosen,email'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:100'],
            'alamat' => ['nullable', 'string'],
            'foto' => ['nullable', 'string'],
            'kuota_bimbingan' => ['nullable', 'integer', 'min:1', 'max:100'],
            'password' => ['nullable', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'nidn.required' => 'NIDN Dosen wajib diisi.',
            'nidn.unique' => 'NIDN Dosen sudah terdaftar.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'gelar.required' => 'Gelar akademik wajib diisi.',
            'email.required' => 'Email dosen wajib diisi.',
            'email.unique' => 'Email sudah terpakai.',
        ];
    }
}
