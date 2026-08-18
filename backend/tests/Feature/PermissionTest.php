<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Class PermissionTest
 * Feature Test untuk otorisasi hak akses (403 Forbidden).
 */
class PermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Mahasiswa']);
        Role::create(['name' => 'Admin']);
    }

    public function test_mahasiswa_cannot_access_admin_dashboard(): void
    {
        $mhsUser = User::factory()->create();
        $mhsUser->assignRole('Mahasiswa');

        $response = $this->actingAs($mhsUser, 'sanctum')
            ->getJson('/api/v1/dashboard/admin');

        $response->assertStatus(403);
    }
}
