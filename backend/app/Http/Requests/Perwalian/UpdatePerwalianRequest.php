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
            'sks_diambil' => ['sometimes', 'required', 'integer', 'min:0', 'max:24'],
            'matakuliah_rencana' => ['nullable', 'array'],
            'catatan_mahasiswa' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'semester.required' => 'Semester perkuliahan wajib diisi.',
            'ipk_semester.required' => 'IPK semester wajib diisi.',
            'sks_diambil.required' => 'Total SKS yang diambil wajib diisi.',
        ];
    }
}
