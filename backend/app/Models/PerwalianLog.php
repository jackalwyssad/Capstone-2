<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model PerwalianLog
 * Mewakili tabel 'perwalian_logs' pada database PostgreSQL.
 * Menyimpan catatan aktivitas histori perwalian.
 */
class PerwalianLog extends Model
{
    use HasFactory;

    protected $table = 'perwalian_logs';

    protected $fillable = [
        'perwalian_id',
        'user_id',
        'status_sebelumnya',
        'status_baru',
        'catatan',
    ];

    /**
     * Relasi ke perwalian terkait.
     */
    public function perwalian(): BelongsTo
    {
        return $this->belongsTo(Perwalian::class, 'perwalian_id');
    }

    /**
     * Relasi ke user aktor pembuat log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
