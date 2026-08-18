<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini berfungsi untuk membuat tabel 'users' pada database PostgreSQL STMIK Bandung.
 * Tabel ini menyimpan kredensial autentikasi utama untuk seluruh pengguna (Admin, Dosen, Mahasiswa).
 * Digunakan oleh Laravel Sanctum dan Spatie Permission di backend, serta mempengaruhi halaman Login/Profil di frontend.
 */
return new class extends Migration
{
    /**
     * Jalankan proses migrasi untuk membuat tabel users.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Primary Key ID User
            $table->string('name'); // Nama lengkap akun user
            $table->string('email')->unique(); // Email login unik (digunakan sebagai kredensial autentikasi)
            $table->timestamp('email_verified_at')->nullable(); // Waktu verifikasi email (opsional)
            $table->string('password'); // Password terenkripsi (Bcrypt hash)
            $table->string('avatar')->nullable(); // URL / path foto profil pengguna
            $table->string('phone_number')->nullable(); // Nomor telepon/WhatsApp
            $table->boolean('is_active')->default(true); // Status keaktifan akun user
            $table->rememberToken(); // Token remember me untuk Sanctum / session
            $table->timestamps(); // Waktu dibuat (created_at) & diperbarui (updated_at)
        });
    }

    /**
     * Membatalkan migrasi (menghapus tabel users jika rollback).
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
