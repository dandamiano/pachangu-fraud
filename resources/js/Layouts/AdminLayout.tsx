import React from "react";
import { Link, usePage, router } from "@inertiajs/react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { url, auth } = usePage().props as any;
    const user = auth?.user as User;

    // Define navigation items based on user role
    const getNavItems = () => {
        if (user?.role === 'investigator') {
            return [
                { name: "Dashboard", href: "/investigator" },
                { name: "Investigator Reports", href: "/investigator/reports" },
            ];
        }

        if (user?.role === 'user') {
            // Regular users should be redirected to portal, but if they somehow get here
            return [
                { name: "My Portal", href: "/portal" },
            ];
        }

        // Default admin navigation
        return [
            { name: "Dashboard", href: "/admin" },
            { name: "Users", href: "/users" },
            { name: "Transactions", href: "/transactions" },
            { name: "Reports", href: "/reports" },
        ];
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        router.post('/logout');
    };

    const getPanelTitle = () => {
        if (user?.role === 'investigator') {
            return "Investigator Panel";
        }
        if (user?.role === 'user') {
            return "User Portal";
        }
        return "Admin Panel";
    };

    const getUserDisplay = () => {
        if (user?.role === 'investigator') {
            return `Logged in as Investigator (${user.name})`;
        }
        return `Logged in as Admin (${user.name})`;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-blue-900 text-white p-4 flex flex-col">
                <h1 className="text-xl font-bold mb-6">{getPanelTitle()}</h1>

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
                    <h2 className="font-semibold">
                        {user?.role === 'investigator' ? 'Investigator Dashboard' : 'Admin Dashboard'}
                    </h2>
                    <span>{getUserDisplay()}</span>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
