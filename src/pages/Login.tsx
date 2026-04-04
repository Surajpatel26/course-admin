import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { setAdminAuth } from '../lib/auth';

type LoginResponse = { token: string; user: { id: number; email: string; role: string } };

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@coursepro.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-indigo-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Admin Login</h1>
          <p className="text-slate-400 mt-2">Use your admin credentials to manage content.</p>
        </div>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6">
          {error && (
            <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setIsSubmitting(true);
              try {
                const data = await api.post<LoginResponse>('/auth/login', { email, password });
                setAdminAuth(data.token, data.user);
                navigate('/', { replace: true });
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Login failed');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Email</div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 pl-12 pr-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 pl-12 pr-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            </label>

            <button
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black py-3"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-400">
            Default admin: <span className="font-mono">admin@coursepro.com</span> / <span className="font-mono">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

