import { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export type ContactRequest = {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
};

export function Contacts() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<ContactRequest[]>('/admin/contacts');
      setContacts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this contact request?')) return;
    try {
      await api.del(`/admin/contacts/${id}`);
      setContacts(c => c.filter(x => x.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contact Requests</h1>
          <p className="text-slate-400 mt-1">Manage inquiries from users.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
          {error}{' '}
          <button onClick={load} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left text-slate-300">
              <th className="px-4 py-3 font-black">ID</th>
              <th className="px-4 py-3 font-black">Date</th>
              <th className="px-4 py-3 font-black">User</th>
              <th className="px-4 py-3 font-black">Message</th>
              <th className="px-4 py-3 font-black"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  No contact requests.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-mono text-slate-300">{c.id}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(c.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-100">
                    <div className="font-bold">{c.name}</div>
                    <a href={`mailto:${c.email}`} className="text-xs text-indigo-400 flex items-center gap-1 hover:underline">
                      <Mail className="w-3 h-3" />
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={c.message}>
                    {c.message}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                      title="Delete request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
