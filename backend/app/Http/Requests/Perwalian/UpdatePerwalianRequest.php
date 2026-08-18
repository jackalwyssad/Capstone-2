<?php

namespace App\Http\Requests\Perwalian;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdatePerwalianRequest
 * Validasi perbaikan perwalian oleh Mahasiswa (hanya saat status Pending).
 */
class UpdatePerwalianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Mahasiswa') || $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'semester' => ['sometimes', 'required', 'string', 'max:50'],
            'ipk_semester' => ['sometimes', 'required', 'numeric', 'min:0', 'max:4.00'],
            'sks_diambil' => ['sometimes', 'required', 'integer', 'min:1', 'max:24'],
            'matakuliah_rencana' => ['sometimes', 'required', 'array', 'min:1'],
            'catatan_mahasiswa' => ['nullable', 'string'],
        ];
    }
}
