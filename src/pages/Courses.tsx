import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { api } from '../lib/api';

export type Course = {
  id: string;
  title: string;
  instructor: string | null;
  image: string | null;
  price: number | null;
  originalPrice: number | null;
  rating: number | null;
  students: number | null;
  duration: string | null;
  category: string | null;
  description: string | null;
  level: string | null;
  whatYouWillLearnJson: string | null;
};

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((c) => (c.title || '').toLowerCase().includes(term) || (c.id || '').toLowerCase().includes(term));
  }, [courses, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<Course[]>('/admin/courses');
      setCourses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load courses');
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
          <h1 className="text-2xl font-black tracking-tight">Courses</h1>
          <p className="text-slate-400 mt-1">Create and manage course listings and curriculum sections.</p>
        </div>
        <Link
          to="/courses/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-4 py-3"
        >
          <Plus className="w-5 h-5" />
          New course
        </Link>
      </div>

      <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or id…"
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
              <th className="px-4 py-3 font-black">Title</th>
              <th className="px-4 py-3 font-black">Category</th>
              <th className="px-4 py-3 font-black">Price</th>
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
                  No courses found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-mono text-slate-300">{c.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{c.title}</td>
                  <td className="px-4 py-3 text-slate-300">{c.category || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{c.price != null ? `$${c.price}` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/courses/${c.id}`} className="text-indigo-300 hover:text-indigo-200 font-black">
                      Edit
                    </Link>
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

