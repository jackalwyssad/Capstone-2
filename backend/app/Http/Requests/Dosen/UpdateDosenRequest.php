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
        $dosenId = $this->route('dosen') ? $this->route('dosen')->id : $this->id;

        return [
            'nidn' => ['required', 'string', 'max:20', 'unique:dosen,nidn,'.$dosenId],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'gelar' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:dosen,email,'.$dosenId],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'kuota_bimbingan' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
