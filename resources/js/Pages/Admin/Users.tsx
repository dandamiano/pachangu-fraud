import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import type { PageProps, User } from "../../types";

interface Flash {
    success?: string;
}

type UsersPageProps = PageProps<{
    users: User[];
    flash?: Flash;
}>;

export default function Users() {
    const { users, flash } = usePage<UsersPageProps>().props;

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Handle input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Create or Update
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (editingUser) {
            router.put(`/users/${editingUser.id}`, form);
        } else {
            router.post("/users", form);
        }

        setForm({ name: "", email: "", password: "", role: "user" });
        setEditingUser(null);
    };

    // Edit user
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role || "user",
        });
    };

    // Delete user
    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(`/users/${id}`);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">User Management</h1>

                {/* Feedback */}
                {flash?.success && (
                    <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
                        {flash.success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 shadow rounded">
                    <h2 className="font-semibold mb-2">
                        {editingUser ? "Edit User" : "Create User"}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            className="border p-2 rounded"
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="border p-2 rounded"
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="investigator">Investigator</option>
                        </select>
                    </div>

                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                        {editingUser ? "Update User" : "Create User"}
                    </button>
                </form>

                {/* Table */}
                <table className="w-full border bg-white shadow rounded">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2 capitalize">{user.role}</td>

                            <td className="p-2 space-x-2">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
