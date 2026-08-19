<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class MahasiswaResource
 * API Transformer JSON untuk entitas Mahasiswa STMIK Bandung.
 */
class MahasiswaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nim' => $this->nim,
            'nama_lengkap' => $this->nama_lengkap,
            'prodi' => $this->prodi,
            'angkatan' => $this->angkatan,
            'dosen_wali_id' => $this->dosen_wali_id,
            'ipk_terakhir' => (float) $this->ipk_terakhir,
            'sks_lulus' => (int) $this->sks_lulus,
            'foto' => $this->foto ?? $this->user?->avatar,
            'user' => new UserResource($this->whenLoaded('user')),
            'dosen_wali' => new DosenResource($this->whenLoaded('dosenWali')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
