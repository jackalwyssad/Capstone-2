<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Matakuliah
 * Mewakili kurikulum dan jadwal perkuliahan resmi STMIK Bandung.
 */
class Matakuliah extends Model
{
    use HasFactory;

    protected $table = 'matakuliah';

    protected $fillable = [
        'kode',
        'nama',
        'sks',
        'semester',
        'prodi',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'ruangan',
        'dosen_pengampu',
        'kuota',
        'is_active',
    ];

    protected $casts = [
        'sks' => 'integer',
        'semester' => 'integer',
        'kuota' => 'integer',
        'is_active' => 'boolean',
    ];
}
