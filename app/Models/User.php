<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

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

    // Asegurarnos de que `username` aparezca en el array/json
    protected $appends = [
        'username',
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
}
