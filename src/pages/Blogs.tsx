import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  date: string | null;
  image: string | null;
  category: string | null;
  readTime: string | null;
  content: string | null;
};

export function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((p) => {
      const hay = `${p.id} ${p.title} ${p.category || ''} ${p.author || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [posts, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.get<BlogPost[]>('/admin/blog');
      setPosts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load blog posts');
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
          <h1 className="text-2xl font-black tracking-tight">Blog</h1>
          <p className="text-slate-400 mt-1">Create and manage blog posts shown on the course site.</p>
        </div>
        <Link
          to="/blog/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-4 py-3"
        >
          <Plus className="w-5 h-5" />
          New post
        </Link>
      </div>

      <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, id, author, category…"
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
              <th className="px-4 py-3 font-black w-16 text-center">Image</th>
              <th className="px-4 py-3 font-black">Title</th>
              <th className="px-4 py-3 font-black">Category</th>
              <th className="px-4 py-3 font-black">Author</th>
              <th className="px-4 py-3 font-black">Date</th>
              <th className="px-4 py-3 font-black"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  No blog posts found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 text-center align-middle relative">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-slate-700 inline-block" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] uppercase font-bold text-slate-500 inline-flex mx-auto">
                        None
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-100">{p.title}</td>
                  <td className="px-4 py-3 text-slate-300">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{p.author || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{p.date || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/blog/${p.id}`}
                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this blog post?')) return;
                          try {
                            await api.del(`/admin/blog/${p.id}`);
                            setPosts((prev) => prev.filter((item) => item.id !== p.id));
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Failed to delete blog post');
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

