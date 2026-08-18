<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini berfungsi untuk membuat tabel 'perwalian_logs' pada database PostgreSQL STMIK Bandung.
 * Tabel ini mencatat jejak audit (Audit Trail & Activity Log) dari setiap perubahan status perwalian.
 * Digunakan untuk menampilkan riwayat perwalian secara kronologis di frontend pada dashboard Mahasiswa & Dosen.
 */
return new class extends Migration
{
    /**
     * Jalankan migrasi untuk membuat tabel perwalian_logs.
     */
    public function up(): void
    {
        Schema::create('perwalian_logs', function (Blueprint $table) {
            $table->id(); // Primary Key Log Perwalian
            $table->foreignId('perwalian_id')->constrained('perwalian')->onDelete('cascade'); // Relasi ke perwalian terkait
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Akun user yang melakukan tindakan
            $table->string('status_sebelumnya')->nullable(); // Status sebelum perubahan
            $table->string('status_baru'); // Status setelah perubahan ('Pending', 'Disetujui', 'Ditolak')
            $table->text('catatan')->nullable(); // Catatan aktivitas atau alasan persetujuan/penolakan
            $table->timestamps(); // Created_at dan updated_at
        });
    }

    /**
     * Membatalkan migrasi (menghapus tabel perwalian_logs).
     */
    public function down(): void
    {
        Schema::dropIfExists('perwalian_logs');
    }
};
