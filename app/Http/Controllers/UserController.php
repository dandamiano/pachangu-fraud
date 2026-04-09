<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // View users
    public function index()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::all()
        ]);
    }

    // Create user
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'role' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        // If request is from API (Postman)
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ]);
        }

        // If request is from UI (Inertia/React)
        return redirect()->back()->with('success', 'User created successfully');
    }

    // Update role
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'role' => $request->role
        ]);

        return back();
    }

    // Deactivate user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);

        return back();
    }

    public function storeFirstAdmin(Request $request)
    {
        // Validate input
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'role' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'First admin created successfully',
            'user' => $user
        ]);
    }
}
