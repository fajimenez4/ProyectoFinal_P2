<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('username')->nullable()->after('id');
            });

            // Rellenar usernames desde el email (parte antes de @) o 'user{id}' para asegurar valores únicos básicos
            $users = DB::table('users')->select('id', 'email')->get();
            foreach ($users as $u) {
                $base = $u->email ? explode('@', $u->email)[0] : 'user' . $u->id;
                $username = $base;
                $i = 1;
                while (DB::table('users')->where('username', $username)->exists()) {
                    $username = $base . $i;
                    $i++;
                }
                DB::table('users')->where('id', $u->id)->update(['username' => $username]);
            }

            // Intentar agregar índice único; si falla (por duplicados o limitaciones), captar la excepción y continuar
            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->unique('username');
                });
            } catch (\Throwable $e) {
                // No hacemos rollback aquí; dejamos la columna y los valores generados
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                // Si existe índice, intentar eliminarlo (silencioso)
                try {
                    $table->dropUnique(['username']);
                } catch (\Throwable $e) {
                }
                $table->dropColumn('username');
            });
        }
    }
};
