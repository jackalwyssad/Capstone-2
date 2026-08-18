<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class DosenResource
 * API Transformer JSON untuk entitas Dosen STMIK Bandung.
 */
class DosenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nidn' => $this->nidn,
            'nama_lengkap' => $this->nama_lengkap,
            'gelar' => $this->gelar,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'kuota_bimbingan' => $this->kuota_bimbingan,
            'total_mahasiswa_bimbingan' => $this->whenCounted('mahasiswaBimbingan', $this->mahasiswa_bimbingan_count ?? 0),
            'user' => new UserResource($this->whenLoaded('user')),
            'mahasiswa_bimbingan' => MahasiswaResource::collection($this->whenLoaded('mahasiswaBimbingan')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
