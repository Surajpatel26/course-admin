import { useEffect, useMemo, useState } from 'react';
import { Search, User as UserIcon, Shield, Trash2, Mail } from 'lucide-react';
import { api } from '../lib/api';

export type User = {
  id: number;
  email: string;
  name: string | null;
  role: string | null;
  avatar: string | null;
  googleId: string | null;
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const hay = `${u.id} ${u.email} ${u.name || ''} ${u.role || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [users, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<User[]>('/admin/users');
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
        await api.put(`/admin/users/${user.id}`, { role: newRole, name: user.name });
        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (e: any) {
        alert(e.message || 'Failed to update role');
    }
  }

  async function deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await api.del(`/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
    } catch (e: any) {
        alert(e.message || 'Failed to delete user');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-1">Manage student accounts, permissions, and roles.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 pl-12 pr-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
          {error} <button onClick={load} className="underline font-bold ml-2">Retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/20">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900/60 text-slate-300 font-black">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Auth</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">Finding users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">No users found.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name || u.email}&background=random`} 
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-100 truncate">{u.name || 'No Name Set'}</span>
                        <span className="text-xs text-slate-400 truncate">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        u.role === 'admin' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {u.googleId ? (
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400/80">
                            <img src="https://www.google.com/favicon.ico" className="w-3 h-3 grayscale" alt="" />
                            Google Auth
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                            <Mail className="w-3 h-3" />
                            Email/Pass
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => toggleRole(u)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Change Role"
                        >
                            <Shield className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete User"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
