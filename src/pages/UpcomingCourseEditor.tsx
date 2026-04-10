import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export function UpcomingCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [course, setCourse] = useState({
    title: '',
    instructor: '',
    date: '',
    image: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    if (!isNew && id) {
      api.get<any>(`/admin/upcoming-courses/${id}`)
        .then((data) => {
          setCourse({
            title: data.title || '',
            instructor: data.instructor || '',
            date: data.date || '',
            image: data.image || '',
            category: data.category || '',
            description: data.description || '',
          });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/admin/upcoming-courses', course);
      } else {
        await api.put(`/admin/upcoming-courses/${id}`, course);
      }
      navigate('/upcoming');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this upcoming course?')) return;
    try {
      await api.del(`/admin/upcoming-courses/${id}`);
      navigate('/upcoming');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/upcoming" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight">{isNew ? 'New Upcoming Course' : 'Edit Course'}</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title *</label>
            <input
              required
              name="title"
              value={course.title}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Instructor</label>
              <input
                name="instructor"
                value={course.instructor}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Date / Season</label>
              <input
                name="date"
                placeholder="e.g., Fall 2026"
                value={course.date}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
              <input
                name="category"
                value={course.category}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Image URL</label>
              <input
                name="image"
                value={course.image}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={course.description}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <Link
              to="/upcoming"
              className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
