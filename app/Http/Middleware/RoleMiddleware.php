<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (!$request->user()) {
            abort(403); // forbidden
        }

        $allowedRoles = explode('|', $role);
        if (!in_array($request->user()->role, $allowedRoles)) {
            abort(403); // forbidden
        }

        return $next($request);
    }
}
