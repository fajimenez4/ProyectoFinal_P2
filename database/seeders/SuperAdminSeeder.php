<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
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
                User::updateOrCreate($where, $attributes);

                if ($this->command) {
                    $this->command->info("Superadmin creado/actualizado (identificador: " . array_key_first($where) . "=" . $where[array_key_first($where)] . ")");
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
