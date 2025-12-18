<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Asegurarnos de que `username` aparezca en el array/json
    protected $appends = [
        'username',
    ];

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'estado',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getUsernameAttribute()
    {
        $columns = ['username', 'user', 'usuario', 'email'];
        foreach ($columns as $col) {
            if (array_key_exists($col, $this->attributes) && $this->attributes[$col] !== null) {
                return $this->attributes[$col];
            }
        }
        return null;
    }

    // Relación con roles
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    // Verificar rol por nombre
    public function hasRole(string $roleName): bool
    {
        // Si ya están cargadas, evitar query extra
        if ($this->relationLoaded('roles')) {
            foreach ($this->roles as $r) {
                if ($r->name === $roleName) return true;
            }
            return false;
        }
        return $this->roles()->where('name', $roleName)->exists();
    }
}
