<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Perwalian
 * Mewakili tabel 'perwalian' pada database PostgreSQL STMIK Bandung.
 * Menyimpan transaksi bimbingan akademik perwalian semester, rencana matakuliah (JSON), IPK, SKS, dan status approval ('Pending', 'Disetujui', 'Ditolak').
 */
class Perwalian extends Model
{
    use HasFactory;

    protected $table = 'perwalian';

    protected $fillable = [
        'mahasiswa_id',
        'dosen_id',
        'semester',
        'ipk_semester',
        'sks_diambil',
        'matakuliah_rencana',
        'catatan_mahasiswa',
        'catatan_dosen',
        'status',
        'tgl_persetujuan',
    ];

    protected $casts = [
        'ipk_semester' => 'float',
        'sks_diambil' => 'integer',
        'matakuliah_rencana' => 'array',
        'tgl_persetujuan' => 'datetime',
    ];

    /**
     * Relasi ke Mahasiswa pengaju perwalian.
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Relasi ke Dosen Wali peninjau perwalian.
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }

    /**
     * Relasi ke jejak audit log perwalian (1-to-Many).
     */
    public function logs(): HasMany
    {
        return $this->hasMany(PerwalianLog::class, 'perwalian_id')->orderBy('created_at', 'desc');
    }
}
