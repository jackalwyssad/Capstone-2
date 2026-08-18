<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Class AuthenticationTest
 * Feature Test untuk memverifikasi proses Login, Verifikasi Sanctum Token, dan Logout.
 */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Admin']);
        Role::create(['name' => 'Mahasiswa']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@stmikbandung.ac.id',
            'password' => bcrypt('Admin123!'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@stmikbandung.ac.id',
            'password' => 'Admin123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token', 'token_type'],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'admin@stmikbandung.ac.id',
            'password' => bcrypt('Admin123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@stmikbandung.ac.id',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }
}
