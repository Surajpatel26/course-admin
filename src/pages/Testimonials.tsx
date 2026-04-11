import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar: string | null;
  rating: number;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return testimonials;
    return testimonials.filter((t) => {
      const hay = `${t.id} ${t.name} ${t.role || ''} ${t.content}`.toLowerCase();
      return hay.includes(term);
    });
  }, [testimonials, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<Testimonial[]>('/admin/testimonials');
      setTestimonials(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Testimonials</h1>
          <p className="text-slate-400 mt-1">Manage testimonials shown on the course site.</p>
        </div>
        <Link
          to="/testimonials/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-4 py-3"
        >
          <Plus className="w-5 h-5" />
          New Testimonial
        </Link>
      </div>

      <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, role, content…"
            className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 pl-12 pr-4 py-3 outline-none focus:border-indigo-500"
          />
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
              <th className="px-4 py-3 font-black">Name</th>
              <th className="px-4 py-3 font-black">Role</th>
              <th className="px-4 py-3 font-black">Rating</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  No testimonials found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-mono text-slate-300">{t.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-100 flex items-center gap-2">
                    {t.avatar && (
                      <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full border border-slate-700" />
                    )}
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.role || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{t.rating}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/testimonials/${t.id}`}
                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this testimonial?')) return;
                          try {
                            await api.del(`/admin/testimonials/${t.id}`);
                            setTestimonials((prev) => prev.filter((item) => item.id !== t.id));
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Failed to delete testimonial');
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
