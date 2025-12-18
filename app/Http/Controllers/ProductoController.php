<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        // Todos los usuarios autenticados pueden ver productos
        $productos = Producto::orderBy('created_at', 'desc')->get();
        return response()->json($productos);
    }

    public function store(Request $request)
    {
        // Solo admin y empleado pueden crear productos
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $producto = Producto::create($validated);
        return response()->json($producto, 201);
    }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json($producto);
    }

    public function update(Request $request, $id)
    {
        // Solo admin y empleado pueden actualizar productos
        $producto = Producto::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'precio' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
        ]);

        $producto->update($validated);
        return response()->json($producto);
    }

    public function destroy($id)
    {
        // Solo admin y empleado pueden eliminar productos
        $producto = Producto::findOrFail($id);
        $producto->delete();
        return response()->json(['message' => 'Producto eliminado exitosamente']);
    }
}