<?php

namespace App\Http\Requests\Perwalian;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ApproveRejectPerwalianRequest
 * Validasi peninjauan perwalian oleh Dosen Wali (Persetujuan 'Disetujui' atau Penolakan 'Ditolak').
 */
class ApproveRejectPerwalianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Dosen') || $this->user()->hasRole('Admin');
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:Disetujui,Ditolak,Pending'],
            'catatan_dosen' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status bimbingan wajib dipilih.',
            'status.in' => 'Status harus berupa Disetujui, Ditolak, atau Pending (Kirim Pesan Bimbingan).',
        ];
    }
}
