<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini berfungsi untuk membuat tabel 'perwalian' pada database PostgreSQL STMIK Bandung.
 * Tabel ini merupakan inti dari aplikasi (Core Case Study), mencatat setiap pengajuan bimbingan akademik perwalian semester.
 * Menyimpan status persetujuan ('Pending', 'Disetujui', 'Ditolak'), daftar rencana mata kuliah (JSON), IPK, SKS, serta catatan evaluasi dosen wali.
 * Mengendalikan alur perwalian mahasiswa, peninjauan dosen, dan rekapitulasi data oleh Admin di frontend.
 */
return new class extends Migration
{
    /**
     * Jalankan migrasi untuk membuat tabel perwalian.
     */
    public function up(): void
    {
        Schema::create('perwalian', function (Blueprint $table) {
            $table->id(); // Primary Key Perwalian
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade'); // Relasi ke Mahasiswa pengaju
            $table->foreignId('dosen_id')->constrained('dosen')->onDelete('cascade'); // Relasi ke Dosen Wali penanggung jawab
            $table->string('semester'); // Kode/Nama Semester (misal: "2025/2026 Ganjil", "2025/2026 Genap")
            $table->decimal('ipk_semester', 3, 2); // IPK semester sebelumnya yang dilaporkan
            $table->integer('sks_diambil'); // Total SKS mata kuliah yang direncanakan
            $table->json('matakuliah_rencana'); // List JSON mata kuliah (kode, nama, SKS, kelas)
            $table->text('catatan_mahasiswa')->nullable(); // Pesan/kendala dari mahasiswa saat pengajuan
            $table->text('catatan_dosen')->nullable(); // Umpan balik/catatan dari Dosen Wali saat review
            $table->enum('status', ['Pending', 'Disetujui', 'Ditolak'])->default('Pending'); // Status persetujuan perwalian
            $table->timestamp('tgl_persetujuan')->nullable(); // Tanggal perwalian disetujui/ditolak oleh dosen
            $table->timestamps(); // Created_at dan updated_at
        });
    }

    /**
     * Membatalkan migrasi (menghapus tabel perwalian).
     */
    public function down(): void
    {
        Schema::dropIfExists('perwalian');
    }
};
