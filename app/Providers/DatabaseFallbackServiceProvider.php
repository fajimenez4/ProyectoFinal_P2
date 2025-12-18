<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class DatabaseFallbackServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            // Si la DB no es accesible, forzamos sesión en archivos para evitar consultas a `sessions`
            Config::set('session.driver', 'file');
            Log::warning('DB connection failed. Switching session driver to file. ' . $e->getMessage());
        }
    }
}
