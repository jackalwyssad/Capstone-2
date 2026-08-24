<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class LoginRequest
 * Form Request untuk validasi masukan kredensial login & password pada fitur Login.
 * Field 'identifier' menerima Email (Admin/Mahasiswa) atau NIDN (Dosen).
 * Menghasilkan respon error validasi (HTTP 422 Unprocessable Entity) secara otomatis jika data tidak valid.
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:255'],
            'password'   => ['required', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'Email atau NIDN wajib diisi.',
            'identifier.max'      => 'Panjang email atau NIDN maksimal 255 karakter.',
            'password.required'   => 'Password wajib diisi.',
            'password.min'        => 'Password minimal terdiri dari 6 karakter.',
        ];
    }
}
