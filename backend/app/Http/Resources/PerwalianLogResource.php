<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class PerwalianLogResource
 * API Transformer JSON untuk entitas Audit Log Histori Perwalian.
 */
class PerwalianLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'perwalian_id' => $this->perwalian_id,
            'user_id' => $this->user_id,
            'user_name' => $this->user?->name ?? 'System',
            'status_sebelumnya' => $this->status_sebelumnya,
            'status_baru' => $this->status_baru,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
