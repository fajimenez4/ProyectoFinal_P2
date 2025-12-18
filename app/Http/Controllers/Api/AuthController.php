<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = $request->input('username');
        $password = $request->input('password');

        // Columnas probables que puedan contener el identificador
        $candidates = ['username', 'user', 'usuario', 'email'];

        $user = null;
        $foundColumn = null;
        foreach ($candidates as $col) {
            if (! Schema::hasColumn('users', $col)) {
                continue;
            }
            $user = User::where($col, $login)->first();
            if ($user) {
                $foundColumn = $col;
                break;
            }
        }

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Asegurar que la respuesta incluya una propiedad 'username'
        if ($foundColumn && $foundColumn !== 'username') {
            $user->setAttribute('username', $user->{$foundColumn});
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
