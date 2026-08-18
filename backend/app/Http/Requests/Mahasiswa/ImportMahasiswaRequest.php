<?php

namespace App\Http\Requests\Mahasiswa;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ImportMahasiswaRequest
 * Validasi request impor data Mahasiswa dari file Excel/CSV atau JSON array.
 */
class ImportMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'array', 'min:1'],
            'data.*.nim' => ['required', 'string'],
            'data.*.nama_lengkap' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'data.required' => 'Data mahasiswa tidak boleh kosong.',
            'data.array' => 'Format payload data harus berbentuk array.',
        ];
    }
}
