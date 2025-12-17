<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'name'     => 'required',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'username' => $request->username,
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'estado'   => true,
        ]);

        return response()->json($user, 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        if (!$user->estado) {
            return response()->json([
                'message' => 'Usuario deshabilitado'
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return $request->user();
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }
}
