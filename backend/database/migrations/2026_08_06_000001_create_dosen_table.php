<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini berfungsi untuk membuat tabel 'dosen' pada database PostgreSQL STMIK Bandung.
 * Tabel ini menyimpan profil dan data spesifik Dosen Wali.
 * Terhubung dengan tabel 'users' (relasi 1-to-1) dan 'mahasiswa' (relasi 1-to-Many sebagai Dosen Wali).
 * Diperlukan untuk kelola data dosen oleh Admin dan fitur dashboard/approval perwalian oleh Dosen di frontend.
 */
return new class extends Migration
{
    /**
     * Jalankan migrasi untuk membuat tabel dosen.
     */
    public function up(): void
    {
        Schema::create('dosen', function (Blueprint $table) {
            $table->id(); // Primary Key Dosen
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Relasi ke tabel users
            $table->string('nidn')->unique(); // Nomor Induk Dosen Nasional (Unik)
            $table->string('nama_lengkap'); // Nama lengkap dosen beserta gelar
            $table->string('gelar'); // Gelar akademik (e.g. M.T., M.Kom., Ph.D.)
            $table->string('email')->unique(); // Email resmi dosen
            $table->string('no_hp')->nullable(); // Nomor WhatsApp / Kontak Dosen
            $table->string('tempat_lahir')->nullable(); // Tempat lahir dosen
            $table->date('tanggal_lahir')->nullable(); // Tanggal lahir dosen
            $table->string('pendidikan_terakhir')->nullable(); // Pendidikan terakhir (S2 / S3)
            $table->text('alamat')->nullable(); // Alamat domisili/kantor dosen
            $table->string('foto')->nullable(); // Foto / Avatar Dosen
            $table->integer('kuota_bimbingan')->default(30); // Kuota maksimal mahasiswa bimbingan perwalian
            $table->timestamps(); // Created_at dan updated_at
        });
    }

    /**
     * Membatalkan migrasi (menghapus tabel dosen).
     */
    public function down(): void
    {
        Schema::dropIfExists('dosen');
    }
};
