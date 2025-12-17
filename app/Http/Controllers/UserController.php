<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function authorizeAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->username !== 'admin') {
            abort(403, 'Acceso solo para superadmin');
        }
    }

    // LISTAR USUARIOS
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        return User::select('id', 'username', 'name', 'email', 'estado')->get();
    }

    // CREAR USUARIO
    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'username' => 'required|unique:users',
            'name'     => 'required',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:4',
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['estado'] = true;

        return User::create($data);
    }

    // ACTUALIZAR USUARIO
    public function update(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'name'   => 'required',
            'email'  => 'required|email',
            'estado' => 'required|boolean',
        ]);

        $user->update($data);

        return $user;
    }

    // ELIMINAR USUARIO
    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
