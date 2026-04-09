import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export function TestimonialEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    id: '',
    name: '',
    role: '',
    content: '',
    avatar: '',
    rating: 5,
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const data = await api.get<any>(`/admin/testimonials/${id}`);
        setForm({
          id: data.id,
          name: data.name || '',
          role: data.role || '',
          content: data.content || '',
          avatar: data.avatar || '',
          rating: data.rating || 5,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load testimonial');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (isNew) {
        await api.post('/admin/testimonials', {
          ...form,
          id: form.id || '',
        });
      } else {
        await api.put(`/admin/testimonials/${id}`, form);
      }
      navigate('/testimonials');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save testimonial');
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.del(`/admin/testimonials/${id}`);
      navigate('/testimonials');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete testimonial');
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/testimonials"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{isNew ? 'New Testimonial' : 'Edit Testimonial'}</h1>
          <p className="text-slate-400 mt-1">{isNew ? 'Create a new testimonial.' : `Editing ${id}`}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isNew && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">ID (optional, auto-generated)</label>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. t123"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Role / Title / Company</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Frontend Developer @ TechCo"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Avatar Image URL</label>
              <input
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Rating (1 to 5)</label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Testimonial Content</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full resize-y rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-4 py-3 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <Link
              to="/testimonials"
              className="text-slate-400 font-bold hover:text-slate-200 px-4"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-6 py-3 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
