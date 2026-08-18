<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * Model User
 * Mewakili tabel 'users' pada database PostgreSQL.
 * Mengimplementasikan Laravel Sanctum untuk Autentikasi API Token dan Spatie Permission untuk Hak Akses Role (Admin, Dosen, Mahasiswa).
 * Memiliki relasi 1-to-1 dengan Model Dosen dan Model Mahasiswa.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * Kolom yang dapat diisi secara massal (Mass Assignment).
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone_number',
        'is_active',
    ];

    /**
     * Kolom yang disembunyikan saat dikonversi ke Array / JSON API Resource.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast tipe data atribut.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke profil Dosen (1-to-1).
     * Digunakan jika user ini memiliki role 'Dosen'.
     */
    public function dosen(): HasOne
    {
        return $this->hasOne(Dosen::class, 'user_id');
    }

    /**
     * Relasi ke profil Mahasiswa (1-to-1).
     * Digunakan jika user ini memiliki role 'Mahasiswa'.
     */
    public function mahasiswa(): HasOne
    {
        return $this->hasOne(Mahasiswa::class, 'user_id');
    }
}
