<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || $request->user()->username !== 'admin') {
            abort(403, 'No autorizado');
        }
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        return User::select('id', 'username', 'name', 'email', 'estado')->get();
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'username' => 'required|unique:users',
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'estado' => 'boolean'
        ]);

        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $data = $request->only(['username', 'name', 'email', 'estado']);

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return $user;
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
