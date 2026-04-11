import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export type UpcomingCourse = {
  id: string;
  title: string;
  instructor: string | null;
  date: string | null;
  image: string | null;
  category: string | null;
  description: string | null;
};

export function UpcomingCourses() {
  const [courses, setCourses] = useState<UpcomingCourse[]>([]);
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((c) => {
      const hay = `${c.title} ${c.instructor || ''} ${c.category || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [courses, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<UpcomingCourse[]>('/admin/upcoming-courses');
      setCourses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load upcoming courses');
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
          <h1 className="text-2xl font-black tracking-tight">Upcoming Courses</h1>
          <p className="text-slate-400 mt-1">Manage future course announcements.</p>
        </div>
        <Link
          to="/upcoming/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-4 py-3"
        >
          <Plus className="w-5 h-5" />
          New Course
        </Link>
      </div>

      <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, instructor, category..."
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
              <th className="px-4 py-3 font-black">Title</th>
              <th className="px-4 py-3 font-black">Instructor</th>
              <th className="px-4 py-3 font-black">Category</th>
              <th className="px-4 py-3 font-black">Date</th>
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
                  No upcoming courses found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-bold text-slate-100 flex items-center gap-3">
                    {c.image && (
                      <img src={c.image} alt={c.title} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                    )}
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.instructor || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{c.category || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{c.date || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/upcoming/${c.id}`}
                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this upcoming course?')) return;
                          try {
                            await api.del(`/admin/upcoming-courses/${c.id}`);
                            setCourses((prev) => prev.filter((item) => item.id !== c.id));
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Failed to delete upcoming course');
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
