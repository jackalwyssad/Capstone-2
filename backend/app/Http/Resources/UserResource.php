<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class UserResource
 * API Transformer JSON untuk entitas User.
 * Menyeragamkan format balasan objek pengguna ke frontend.
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'phone_number' => $this->phone_number,
            'is_active' => $this->is_active,
            'roles' => $this->getRoleNames(),
            'dosen' => $this->whenLoaded('dosen'),
            'mahasiswa' => $this->whenLoaded('mahasiswa'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
