import React from "react";
import { Link, usePage, router } from "@inertiajs/react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { url } = usePage();

    const navItems = [
        { name: "Dashboard", href: "/admin" },
        { name: "Users", href: "/users" },
        { name: "Transactions", href: "/transactions" },
        { name: "Reports", href: "/reports" },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-blue-900 text-white p-4 flex flex-col">
                <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block p-2 rounded ${
                                url === item.href
                                    ? "bg-blue-700"
                                    : "hover:bg-blue-800"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded mt-4"
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <div className="bg-white shadow p-4 flex justify-between">
                    <h2 className="font-semibold">Admin Dashboard</h2>
                    <span>Logged in as Admin</span>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
