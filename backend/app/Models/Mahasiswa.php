<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Mahasiswa
 * Mewakili tabel 'mahasiswa' pada database PostgreSQL STMIK Bandung.
 * Menyimpan identitas NIM, nama, prodi, angkatan, IPK, serta Dosen Wali penetapan.
 */
class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa';

    protected $fillable = [
        'user_id',
        'nim',
        'nama_lengkap',
        'jenis_kelamin',
        'prodi',
        'angkatan',
        'dosen_wali_id',
        'ipk_terakhir',
        'sks_lulus',
        'foto',
    ];

    protected $casts = [
        'ipk_terakhir' => 'float',
        'sks_lulus' => 'integer',
    ];

    /**
     * Relasi balik ke akun User utama.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Dosen Wali yang membimbing mahasiswa ini.
     */
    public function dosenWali(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_wali_id');
    }

    /**
     * Relasi ke riwayat pengajuan perwalian (1-to-Many).
     */
    public function perwalian(): HasMany
    {
        return $this->hasMany(Perwalian::class, 'mahasiswa_id');
    }
}
