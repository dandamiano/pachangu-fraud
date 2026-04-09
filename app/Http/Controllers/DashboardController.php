<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Transaction;

class DashboardController extends Controller
{
    // Default dashboard (redirect based on role)
    public function index(Request $request)
    {
        $role = $request->user()->role;

        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($role === 'investigator') {
            return redirect()->route('investigator.dashboard');
        }

        return Inertia::render('Dashboard'); // normal user
    }

    // Admin dashboard
    public function admin()
    {
        return Inertia::render('Admin/Dashboard', [
            'users' => User::all(),
            'transactions' => Transaction::latest()->take(10)->get(),
        ]);
    }

    // Investigator dashboard
    public function investigator()
    {
        return Inertia::render('Investigator/Dashboard', [
            'transactions' => Transaction::whereHas('fraudLog', function ($q) {
                $q->where('is_fraud', true);
            })->get()
        ]);
    }
}
