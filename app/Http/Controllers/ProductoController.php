<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        return Producto::select('id', 'nombre', 'precio')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'stock'  => 'required|integer|min:0',
        ]);

        return Producto::create($data);
    }

    public function show($id)
    {
        return Producto::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $producto->update($request->only('nombre', 'precio', 'stock'));

        return $producto;
    }

    public function destroy($id)
    {
        Producto::destroy($id);
        return response()->noContent();
    }
}
