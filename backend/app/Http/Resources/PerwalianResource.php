<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class PerwalianResource
 * API Transformer JSON untuk entitas Perwalian Mahasiswa STMIK Bandung.
 */
class PerwalianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mahasiswa_id' => $this->mahasiswa_id,
            'dosen_id' => $this->dosen_id,
            'semester' => $this->semester,
            'ipk_semester' => (float) $this->ipk_semester,
            'sks_diambil' => (int) $this->sks_diambil,
            'matakuliah_rencana' => $this->matakuliah_rencana,
            'catatan_mahasiswa' => $this->catatan_mahasiswa,
            'catatan_dosen' => $this->catatan_dosen,
            'status' => $this->status,
            'tgl_persetujuan' => $this->tgl_persetujuan?->format('Y-m-d H:i:s'),
            'mahasiswa' => new MahasiswaResource($this->whenLoaded('mahasiswa')),
            'dosen' => new DosenResource($this->whenLoaded('dosen')),
            'logs' => PerwalianLogResource::collection($this->whenLoaded('logs')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
