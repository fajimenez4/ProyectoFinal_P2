<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('123');

        if (! Schema::hasTable('users')) {
            if ($this->command) $this->command->error('La tabla users no existe, no se puede crear superadmin');
            return;
        }

        $columns = Schema::getColumnListing('users');

        // Columnas candidatas que podrían servir como identificador
        $candidates = ['username', 'user', 'usuario', 'email'];
        $found = null;
        foreach ($candidates as $col) {
            if (in_array($col, $columns)) {
                $found = $col;
                break;
            }
        }

        $keyValue = $found === 'email' ? 'superadmin@example.com' : 'superadmin';

        // Construir atributos solo con columnas existentes
        $attributes = [];
        if (in_array('name', $columns)) $attributes['name'] = 'Super Admin';
        if (in_array('email', $columns)) $attributes['email'] = 'superadmin@example.com';
        if (in_array('password', $columns)) $attributes['password'] = $password;
        if (in_array('estado', $columns)) $attributes['estado'] = true;
        if ($found) $attributes[$found] = $keyValue;

        try {
            if ($found || in_array('email', $columns)) {
                $where = $found ? [$found => $keyValue] : ['email' => 'superadmin@example.com'];
                $user = User::updateOrCreate($where, $attributes);

                // Crear role 'admin' si no existe y asignarlo
                $role = Role::firstOrCreate(['name' => 'admin']);
                if (! $user->roles()->where('role_id', $role->id)->exists()) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }

                if ($this->command) {
                    $this->command->info("Superadmin creado/actualizado usando columna '{$found}' (usuario: {$keyValue}, contraseña: 123)");
                }
                return;
            }

            // Fallback: insertar con las columnas existentes mínimas
            $insert = array_intersect_key($attributes, array_flip($columns));
            if (empty($insert)) {
                if ($this->command) $this->command->error('No hay columnas válidas para insertar superadmin.');
                return;
            }

            $now = now();
            if (in_array('created_at', $columns)) $insert['created_at'] = $now;
            if (in_array('updated_at', $columns)) $insert['updated_at'] = $now;

            DB::table('users')->insertOrIgnore($insert);

            // Intentar obtener el usuario y asignar role admin
            $user = User::where('email', 'superadmin@example.com')->first();
            if ($user) {
                $role = Role::firstOrCreate(['name' => 'admin']);
                $user->roles()->syncWithoutDetaching([$role->id]);
            }

            if ($this->command) {
                $this->command->info('Superadmin creado/actualizado (fallback).');
            }
        } catch (\Exception $e) {
            if ($this->command) {
                $this->command->error('No se pudo crear superadmin: ' . $e->getMessage());
            }
        }
    }
}
