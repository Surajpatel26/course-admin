import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { BlogPost } from './Blogs';
import { BlogContentEditor, blocksToHtml, htmlToBlocks, type ContentBlock } from '../components/BlogContentEditor';

type BlogContentBlock = ContentBlock;

const emptyPost: BlogPost = {
  id: '',
  title: '',
  excerpt: '',
  author: '',
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
  image: '',
  category: 'General',
  readTime: '5 min read',
  content: '',
};

export function BlogEditor() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';
  const postId = isNew ? null : params.id || null;

  const [post, setPost] = useState<BlogPost>(emptyPost);
  const [contentBlocks, setContentBlocks] = useState<BlogContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => blocksToHtml(contentBlocks), [contentBlocks]);

  useEffect(() => {
    if (isNew || !postId) return;
    let cancelled = false;
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await api.get<BlogPost>(`/admin/blog/${postId}`);
        if (cancelled) return;
        setPost(data);
        setContentBlocks(htmlToBlocks(data.content || ''));
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load post');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isNew, postId]);

  async function save() {
    setError(null);
    setIsSaving(true);
    try {
      const contentHtml = blocksToHtml(contentBlocks);
      const sanitizedId = post.id.trim().replace(/^\/+|\/+$/g, '');
      const postToSave = { ...post, id: sanitizedId, content: contentHtml };
      if (isNew) {
        const id = sanitizedId || `${Date.now()}`;
        const created = await api.post<BlogPost>('/admin/blog', { ...postToSave, id });
        navigate(`/blog/${created.id}`, { replace: true });
        return;
      }
      if (!postId) return;
      const updated = await api.put<BlogPost>(`/admin/blog/${postId}`, postToSave);
      setPost(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!postId) return;
    if (!confirm('Delete this blog post?')) return;
    setError(null);
    try {
      await api.del(`/admin/blog/${postId}`);
      navigate('/blog', { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
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
            to="/blog"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-2 text-sm font-black hover:bg-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <div className="text-xl font-black tracking-tight">{isNew ? 'New post' : `Edit post: ${post.id}`}</div>
            <div className="text-xs text-slate-400">This content appears on the course site blog pages.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={remove}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm font-black hover:bg-red-500/15"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={save}
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
          <div className="mb-6">
            <div className="text-sm font-black text-slate-200">Blog Post Information</div>
            <div className="text-xs text-slate-500 mt-1">Basic details about the post that appear in lists and at the top of the page.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Unique ID (URL)</div>
              <input
                disabled={!isNew}
                value={post.id}
                onChange={(e) => setPost((p) => ({ ...p, id: e.target.value }))}
                placeholder="e-g-my-awesome-post"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Main Title</div>
              <input
                value={post.title}
                onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter a catchy title..."
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Category</div>
              <input
                value={post.category || ''}
                onChange={(e) => setPost((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Technology, Education..."
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Author Name</div>
              <input
                value={post.author || ''}
                onChange={(e) => setPost((p) => ({ ...p, author: e.target.value }))}
                placeholder="Who wrote this?"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Publication Date</div>
              <input
                value={post.date || ''}
                onChange={(e) => setPost((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Read Time</div>
              <input
                value={post.readTime || ''}
                onChange={(e) => setPost((p) => ({ ...p, readTime: e.target.value }))}
                placeholder="e.g. 5 min read"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Featured Image URL</div>
              <input
                value={post.image || ''}
                onChange={(e) => setPost((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://images.unsplash.com/your-image.jpg"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Short Excerpt (Summary)</div>
              <textarea
                value={post.excerpt || ''}
                onChange={(e) => setPost((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Briefly describe what this post is about (shown on the blog list)..."
                rows={3}
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 text-sm leading-relaxed"
              />
            </label>

            <div className="block md:col-span-2 pt-4 mt-4 border-t border-slate-800">
              <div className="mb-4">
                <div className="text-sm font-black text-slate-200">Article Sections</div>
                <div className="text-xs text-slate-500 mt-1">Add text, headings, and images to build your article content.</div>
              </div>
              <BlogContentEditor value={contentBlocks} onChange={setContentBlocks} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950/50 border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-black text-slate-200">Live Preview</div>
              <div className="text-xs text-slate-500 mt-1">This is how your post will look to readers.</div>
            </div>
          </div>
          <div className="flex-1 rounded-3xl bg-slate-950/60 border border-slate-800 overflow-hidden sticky top-6">
            {post.image ? (
              <div className="aspect-video border-b border-slate-800">
                <img src={post.image} alt="" className="w-full h-full object-cover shadow-2xl" />
              </div>
            ) : (
              <div className="aspect-video border-b border-slate-800 bg-slate-900/50 flex items-center justify-center">
                <div className="text-slate-700 text-xs font-black uppercase tracking-widest italic outline-dashed outline-1 outline-slate-800 p-8 rounded-2xl">No featured image</div>
              </div>
            )}
            <div className="p-8">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                {post.category || 'Uncategorized'}
              </div>
              <div className="text-3xl font-black tracking-tight mt-2 text-slate-100 leading-tight">{post.title || 'Untitled Blog Post'}</div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-4 pb-6 border-b border-slate-800/50">
                <span>{post.author || 'Author Name'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>{post.date || 'Today'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>{post.readTime || 'Quick Read'}</span>
              </div>
              <div className="text-slate-400 text-base mt-6 italic font-medium leading-relaxed">{post.excerpt || 'Write an excerpt to see it here...'}</div>
              <div
                className="prose max-w-none mt-10"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

