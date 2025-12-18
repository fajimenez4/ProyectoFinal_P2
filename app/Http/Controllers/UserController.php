<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    private function authorizeAdmin(Request $request)
    {
        $user = $request->user();

        // Fallback: si no hay usuario -> no autorizado
        if (! $user) {
            abort(403, 'No autorizado');
        }

        // Si existe la tabla roles y el modelo dispone de hasRole, usarla
        if (Schema::hasTable('roles') && method_exists($user, 'hasRole')) {
            if ($user->hasRole('admin')) return;
        }

        // Fallback por nombre de usuario (mantener compatibilidad)
        if ($user->username === 'admin') return;

        abort(403, 'No autorizado');
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        if (Schema::hasTable('roles')) {
            return User::with('roles')->get(['id', 'username', 'name', 'email', 'estado']);
        }

        return User::get(['id', 'username', 'name', 'email', 'estado']);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $rules = [
            'username' => 'required|unique:users',
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'estado' => 'boolean',
        ];

        if (Schema::hasTable('roles')) {
            $rules['roles'] = 'array';
            $rules['roles.*'] = 'integer|exists:roles,id';
        }

        $data = $request->validate($rules);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (Schema::hasTable('roles') && ! empty($data['roles'])) {
            $user->roles()->sync($data['roles']);
            return $user->load('roles');
        }

        return $user;
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'username' => 'sometimes|required|unique:users,username,' . $user->id,
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'estado' => 'sometimes|boolean',
            // roles validación condicional más abajo
        ]);

        if (Schema::hasTable('roles')) {
            $request->validate([
                'roles' => 'sometimes|array',
                'roles.*' => 'integer|exists:roles,id',
            ]);
        }

        $data = $request->only(['username', 'name', 'email', 'estado']);

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if (Schema::hasTable('roles') && $request->has('roles')) {
            $user->roles()->sync($request->input('roles', []));
        }

        if (Schema::hasTable('roles')) {
            return $user->load('roles');
        }

        return $user;
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
