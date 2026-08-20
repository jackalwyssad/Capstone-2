<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Dosen
 * Mewakili tabel 'dosen' pada database PostgreSQL.
 * Menyimpan data Dosen Wali STMIK Bandung.
 * Memiliki relasi ke User (BelongsTo), Mahasiswa bimbingan (HasMany), dan Perwalian yang dibimbing (HasMany).
 */
class Dosen extends Model
{
    use HasFactory;

    protected $table = 'dosen';

    protected $fillable = [
        'user_id',
        'nidn',
        'nama_lengkap',
        'jenis_kelamin',
        'gelar',
        'email',
        'no_hp',
        'tempat_lahir',
        'tanggal_lahir',
        'pendidikan_terakhir',
        'alamat',
        'foto',
        'kuota_bimbingan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'kuota_bimbingan' => 'integer',
    ];

    /**
     * Relasi balik ke akun User utama.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke daftar Mahasiswa bimbingan akademik perwalian (1-to-Many).
     */
    public function mahasiswaBimbingan(): HasMany
    {
        return $this->hasMany(Mahasiswa::class, 'dosen_wali_id');
    }

    /**
     * Relasi ke daftar perwalian yang ditinjau/dibimbing oleh dosen ini.
     */
    public function perwalian(): HasMany
    {
        return $this->hasMany(Perwalian::class, 'dosen_id');
    }
}
