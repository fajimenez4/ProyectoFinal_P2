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

    public function index()
    {
        // Cargar roles de todos los usuarios
        $users = User::with('roles')->orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:3',
            'estado' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Asignar roles si se proporcionaron
        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:3',
            'estado' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // Actualizar roles si se proporcionaron
        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return response()->json($user->load('roles'));
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
