import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Course } from './Courses';

type CourseSection = {
  id: string;
  courseId: string;
  title: string;
  duration: string | null;
  lessons: number | null;
  sortOrder: number;
};

const emptyCourse: Course = {
  id: '',
  title: '',
  instructor: '',
  image: '',
  price: 0,
  originalPrice: null,
  rating: 4.8,
  students: 0,
  duration: '',
  category: '',
  description: '',
  level: 'Intermediate',
  whatYouWillLearnJson: JSON.stringify(
    [
      'Add a learning outcome',
      'Add another learning outcome',
      'Add another learning outcome',
      'Add another learning outcome',
    ],
    null,
    2
  ),
};

function toNumberOrNull(v: string) {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function CourseEditor() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';
  const courseId = isNew ? null : params.id || null;

  const [course, setCourse] = useState<Course>(emptyCourse);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionsSorted = useMemo(
    () => [...sections].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [sections]
  );

  useEffect(() => {
    if (isNew || !courseId) return;
    let cancelled = false;
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const all = await api.get<Course[]>('/admin/courses');
        const found = all.find((c) => c.id === courseId);
        if (!found) throw new Error('Course not found');
        const secs = await api.get<CourseSection[]>(`/admin/courses/${courseId}/sections`);
        if (cancelled) return;
        setCourse(found);
        setSections(secs);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load course');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId, isNew]);

  async function saveCourse() {
    setError(null);
    setIsSaving(true);
    try {
      if (isNew) {
        const created = await api.post<Course>('/admin/courses', course);
        navigate(`/courses`, { replace: true });
        return;
      }
      if (!courseId) return;
      await api.put<Course>(`/admin/courses/${courseId}`, course);
      navigate(`/courses`, { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function addSection() {
    if (!courseId) {
      setError('Save the course first, then add sections.');
      return;
    }
    setError(null);
    try {
      const nextOrder = (sectionsSorted.at(-1)?.sortOrder ?? 0) + 1;
      const created = await api.post<CourseSection>(`/admin/courses/${courseId}/sections`, {
        id: '',
        title: 'New Section',
        duration: '15m',
        lessons: 1,
        sortOrder: nextOrder,
      });
      setSections((s) => [...s, created]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add section');
    }
  }

  async function updateSection(id: string, patch: Partial<CourseSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function persistSection(id: string) {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    setError(null);
    try {
      const updated = await api.put<CourseSection>(`/admin/sections/${id}`, section);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save section');
    }
  }

  async function deleteSection(id: string) {
    setError(null);
    try {
      await api.del(`/admin/sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete section');
    }
  }

  async function deleteCourse() {
    if (!courseId) return;
    if (!confirm('Delete this course? This will also remove its sections.')) return;
    setError(null);
    try {
      await api.del(`/admin/courses/${courseId}`);
      navigate('/courses', { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete course');
    }
  }

  if (isLoading) {
    return <div className="text-slate-400 font-bold">Loading…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-2 text-sm font-black hover:bg-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <div className="text-xl font-black tracking-tight">{isNew ? 'New course' : `Edit course: ${course.id}`}</div>
            <div className="text-xs text-slate-400">Public data powers the `course` site. Admin routes are protected.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={deleteCourse}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm font-black hover:bg-red-500/15"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={saveCourse}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 px-4 py-3 text-sm font-black"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-6">
          <div className="text-sm font-black mb-4">Course fields</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Title</div>
              <input
                value={course.title}
                onChange={(e) => setCourse((c) => ({ ...c, title: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Category</div>
              <select
                value={course.category || ''}
                onChange={(e) => setCourse((c) => ({ ...c, category: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="" disabled>Select a category</option>
                <option value="AI ML">AI ML</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Data Science">Data Science</option>
              </select>
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Instructor</div>
              <input
                value={course.instructor || ''}
                onChange={(e) => setCourse((c) => ({ ...c, instructor: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Price</div>
              <input
                value={course.price ?? ''}
                onChange={(e) => setCourse((c) => ({ ...c, price: toNumberOrNull(e.target.value) }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Duration</div>
              <input
                value={course.duration || ''}
                onChange={(e) => setCourse((c) => ({ ...c, duration: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Image URL</div>
              <input
                value={course.image || ''}
                onChange={(e) => setCourse((c) => ({ ...c, image: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Description</div>
              <textarea
                value={course.description || ''}
                onChange={(e) => setCourse((c) => ({ ...c, description: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">What you will learn (JSON array)</div>
              <textarea
                value={course.whatYouWillLearnJson || ''}
                onChange={(e) => setCourse((c) => ({ ...c, whatYouWillLearnJson: e.target.value }))}
                rows={6}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-black">Course sections</div>
            <button
              onClick={addSection}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-2 text-sm font-black hover:bg-slate-900"
            >
              <Plus className="w-4 h-4" />
              Add section
            </button>
          </div>

          <div className="space-y-3">
            {sectionsSorted.length === 0 ? (
              <div className="text-slate-400 text-sm">No sections yet.</div>
            ) : (
              sectionsSorted.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="block md:col-span-2">
                      <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Title</div>
                      <input
                        value={s.title}
                        onChange={(e) => updateSection(s.id, { title: e.target.value })}
                        onBlur={() => persistSection(s.id)}
                        className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Duration</div>
                      <input
                        value={s.duration || ''}
                        onChange={(e) => updateSection(s.id, { duration: e.target.value })}
                        onBlur={() => persistSection(s.id)}
                        className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Lessons</div>
                      <input
                        value={s.lessons ?? ''}
                        onChange={(e) => updateSection(s.id, { lessons: toNumberOrNull(e.target.value) })}
                        onBlur={() => persistSection(s.id)}
                        className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Order</div>
                      <input
                        value={s.sortOrder ?? 0}
                        onChange={(e) => updateSection(s.id, { sortOrder: Number(e.target.value) })}
                        onBlur={() => persistSection(s.id)}
                        className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    </label>
                    <div className="md:col-span-3" />
                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteSection(s.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 px-3 py-2 text-xs font-black hover:bg-red-500/15"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

