<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Crear rol admin si no existe
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Crear usuario admin si no existe
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'username' => 'admin',
                'name' => 'Administrador',
                'password' => Hash::make('admin123'),
                'estado' => true,
            ]
        );

        // Asignar rol admin si no lo tiene
        if (!$admin->hasRole('admin')) {
            $admin->roles()->attach($adminRole);
            $this->command->info('Usuario admin creado con rol de administrador');
        } else {
            $this->command->info('El usuario admin ya existe');
        }
    }
}