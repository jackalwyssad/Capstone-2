<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matakuliah', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->integer('sks')->default(3);
            $table->integer('semester')->default(1);
            $table->string('prodi')->default('Teknik Informatika'); // Teknik Informatika / Sistem Informasi / Umum
            $table->string('hari')->default('Senin');
            $table->string('jam_mulai')->default('08:00');
            $table->string('jam_selesai')->default('10:30');
            $table->string('ruangan')->default('Lab Komputer 1');
            $table->string('dosen_pengampu')->nullable();
            $table->integer('kuota')->default(40);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matakuliah');
    }
};
