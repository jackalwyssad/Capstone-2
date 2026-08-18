<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini berfungsi untuk membuat tabel 'mahasiswa' pada database PostgreSQL STMIK Bandung.
 * Tabel ini menyimpan biodata akademik mahasiswa, Program Studi, Angkatan, IPK, serta penetapan Dosen Wali.
 * Terhubung dengan tabel 'users' (relasi 1-to-1) dan tabel 'dosen' (relasi foreign key dosen_wali_id).
 * Digunakan pada fitur CRUD Mahasiswa (Admin), Profil Mahasiswa, serta Penugasan Dosen Wali di frontend.
 */
return new class extends Migration
{
    /**
     * Jalankan migrasi untuk membuat tabel mahasiswa.
     */
    public function up(): void
    {
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->id(); // Primary Key Mahasiswa
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Relasi ke akun user
            $table->string('nim')->unique(); // Nomor Induk Mahasiswa STMIK Bandung (Unik)
            $table->string('nama_lengkap'); // Nama lengkap mahasiswa
            $table->enum('prodi', ['Teknik Informatika', 'Sistem Informasi']); // Program studi di STMIK Bandung
            $table->string('angkatan'); // Tahun angkatan (e.g. 2021, 2022, 2023, 2024, 2025)
            $table->foreignId('dosen_wali_id')->nullable()->constrained('dosen')->onDelete('set null'); // FK ke Dosen Wali
            $table->decimal('ipk_terakhir', 3, 2)->default(0.00); // IPK akumulasi mahasiswa
            $table->integer('sks_lulus')->default(0); // Total SKS yang telah lulus
            $table->timestamps(); // Created_at dan updated_at
        });
    }

    /**
     * Membatalkan migrasi (menghapus tabel mahasiswa).
     */
    public function down(): void
    {
        Schema::dropIfExists('mahasiswa');
    }
};
