<?php

namespace App\Http\Requests\Dosen;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AssignDosenWaliRequest
 * Validasi form penugasan Dosen Wali ke beberapa Mahasiswa sekaligus (Bulk Assign).
 */
class AssignDosenWaliRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'dosen_id' => ['required', 'exists:dosen,id'],
            'mahasiswa_ids' => ['required', 'array', 'min:1'],
            'mahasiswa_ids.*' => ['exists:mahasiswa,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'dosen_id.required' => 'Dosen Wali wajib dipilih.',
            'dosen_id.exists' => 'Dosen Wali yang dipilih tidak valid.',
            'mahasiswa_ids.required' => 'Pilih minimal satu mahasiswa.',
        ];
    }
}
