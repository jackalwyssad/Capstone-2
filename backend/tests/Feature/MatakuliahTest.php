<?php

namespace Tests\Feature;

use App\Models\Matakuliah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatakuliahTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_get_all_matakuliah(): void
    {
        $user = User::factory()->create();
        Matakuliah::create([
            'kode' => 'IF-101',
            'nama' => 'Algoritma Pemrograman',
            'sks' => 4,
            'semester' => 1,
            'prodi' => 'Teknik Informatika',
            'hari' => 'Senin',
            'jam_mulai' => '07:30',
            'jam_selesai' => '11:00',
            'ruangan' => 'Lab IF-1',
            'dosen_pengampu' => 'Dr. Irwan',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/matakuliah?all=true');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
