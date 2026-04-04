import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, LayoutDashboard, LogOut, Mail } from 'lucide-react';
import { clearAdminAuth, getAdminUser } from '../../lib/auth';

export function AdminLayout() {
  const navigate = useNavigate();
  const user = getAdminUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">Admin Panel</div>
              <div className="text-xs text-slate-400">{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearAdminAuth();
              navigate('/login', { replace: true });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="rounded-3xl bg-slate-900/50 border border-slate-800 p-4 h-fit">
            <nav className="space-y-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5" />
                Overview
              </NavLink>

              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`
                }
              >
                <BookOpen className="w-5 h-5" />
                Courses
              </NavLink>

              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`
                }
              >
                <FileText className="w-5 h-5" />
                Blog
              </NavLink>
              <NavLink
                to="/testimonials"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`
                }
              >
                <BookOpen className="w-5 h-5" />
                Testimonials
              </NavLink>
              <NavLink
                to="/contacts"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`
                }
              >
                <Mail className="w-5 h-5" />
                Contacts
              </NavLink>
            </nav>
          </aside>

          <main className="rounded-3xl bg-slate-900/30 border border-slate-800 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

