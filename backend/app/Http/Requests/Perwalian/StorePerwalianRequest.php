<?php

namespace App\Http\Requests\Perwalian;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StorePerwalianRequest
 * Validasi form pengajuan perwalian baru oleh Mahasiswa STMIK Bandung.
 */
class StorePerwalianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Mahasiswa');
    }

    public function rules(): array
    {
        return [
            'semester' => ['required', 'string', 'max:50'],
            'ipk_semester' => ['required', 'numeric', 'min:0', 'max:4.00'],
            'sks_diambil' => ['required', 'integer', 'min:1', 'max:24'],
            'matakuliah_rencana' => ['required', 'array', 'min:1'],
            'catatan_mahasiswa' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'semester.required' => 'Semester wajib diisi (contoh: 2025/2026 Ganjil).',
            'ipk_semester.required' => 'IPK semester sebelumnya wajib diisi.',
            'sks_diambil.required' => 'Jumlah SKS yang diambil wajib diisi.',
            'matakuliah_rencana.required' => 'Pilih minimal satu rencana mata kuliah.',
        ];
    }
}
