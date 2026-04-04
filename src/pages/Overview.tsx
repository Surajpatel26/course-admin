import { useEffect, useState } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { api } from '../lib/api';

type Course = {
  id: string;
  title: string;
  category: string | null;
};

export function Overview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get<Course[]>('/admin/courses');
        if (!cancelled) setCourses(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = new Set(courses.map((c) => c.category).filter(Boolean));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="text-slate-400 mt-1">Quick snapshot of your content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="text-sm font-bold text-slate-300">Courses</div>
          </div>
          <div className="text-4xl font-black">{isLoading ? '—' : courses.length}</div>
          <div className="text-xs text-slate-500 mt-2">Total published courses in database</div>
        </div>

        <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-700/30 border border-slate-700/50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-slate-200" />
            </div>
            <div className="text-sm font-bold text-slate-300">Categories</div>
          </div>
          <div className="text-4xl font-black">{isLoading ? '—' : categories.size}</div>
          <div className="text-xs text-slate-500 mt-2">Unique categories found</div>
        </div>
      </div>
    </div>
  );
}

