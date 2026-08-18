<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateProfileRequest
 * Form Request untuk pembaruan profil pengguna (nama, foto/avatar, no hp).
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$userId],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'string'],
        ];
    }
}
