import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function Users({ users }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'user'
    });

    const submit = (e) => {
        e.preventDefault();
        router.post('/users', form);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">User Management</h1>

            {/* Create User */}
            <form onSubmit={submit} className="mb-4">
                <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
                
                <select onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="investigator">Investigator</option>
                </select>

                <button type="submit">Create</button>
            </form>

            {/* Users Table */}
            <table className="w-full border">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className={u.is_active ? '' : 'bg-gray-200'}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.is_active ? 'Active' : 'Inactive'}</td>

                            <td>
                                <button onClick={() => router.delete(`/users/${u.id}`)}>
                                    Deactivate
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}