<?php

namespace App\Http\Requests\Dosen;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateDosenRequest
 * Validasi form update data Dosen Wali STMIK Bandung.
 */
class UpdateDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        $routeParam = $this->route('dosen') ?? $this->route('id') ?? $this->id;
        $dosenId = is_object($routeParam) ? $routeParam->id : $routeParam;

        return [
            'nidn' => ['required', 'string', 'max:20', 'unique:dosen,nidn,'.$dosenId],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['nullable', 'in:Laki-laki,Perempuan'],
            'gelar' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:dosen,email,'.$dosenId],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:100'],
            'alamat' => ['nullable', 'string'],
            'foto' => ['nullable', 'string'],
            'kuota_bimbingan' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'nidn.required' => 'NIDN Dosen wajib diisi.',
            'nidn.unique' => 'NIDN Dosen sudah terdaftar dalam sistem.',
            'nama_lengkap.required' => 'Nama lengkap dosen wajib diisi.',
            'gelar.required' => 'Gelar akademik wajib diisi.',
            'email.required' => 'Alamat email dosen wajib diisi.',
            'email.unique' => 'Alamat email sudah terdaftar dalam sistem.',
        ];
    }
}
