<?php

namespace App\Providers;

use App\Interfaces\AuthRepositoryInterface;
use App\Interfaces\DosenRepositoryInterface;
use App\Interfaces\MahasiswaRepositoryInterface;
use App\Interfaces\PerwalianRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Repositories\Eloquent\AuthRepository;
use App\Repositories\Eloquent\DosenRepository;
use App\Repositories\Eloquent\MahasiswaRepository;
use App\Repositories\Eloquent\PerwalianRepository;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Class RepositoryServiceProvider
 * Mendaftarkan Dependency Injection (IoC Container Binding) antara Interface dan Implementasi Eloquent Repository.
 * Menjamin prinsip SOLID (Dependency Inversion Principle) pada backend Laravel.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(DosenRepositoryInterface::class, DosenRepository::class);
        $this->app->bind(MahasiswaRepositoryInterface::class, MahasiswaRepository::class);
        $this->app->bind(PerwalianRepositoryInterface::class, PerwalianRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
