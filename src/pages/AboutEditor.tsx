import { useEffect, useState } from 'react';
import { Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface AboutContent {
  [key: string]: string;
}

export function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<AboutContent>('/admin/about');
        setContent(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load about content');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put('/admin/about', content);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save about content');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await api.upload<{ url: string }>('/admin/about/upload', formData);
      setContent(prev => ({ ...prev, [field]: data.url }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  }

  const ImageField = ({ label, field, hint }: { label: string; field: string; hint?: string }) => (
    <div className="space-y-2 p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-slate-300">{label}</label>
        {uploadingField === field && (
          <div className="flex items-center gap-2 text-xs text-indigo-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading...
          </div>
        )}
      </div>
      
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 mb-4 group">
        {content[field] ? (
          <img src={content[field]} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">No image selected</span>
          </div>
        )}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-500 text-slate-950 text-xs font-black hover:bg-indigo-400 transition-colors">
            <Upload className="w-4 h-4 inline-block mr-2" />
            Upload
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, field)}
              disabled={!!uploadingField}
            />
          </label>
        </div>
      </div>
      
      <input
        value={content[field] || ''}
        onChange={(e) => setContent({ ...content, [field]: e.target.value })}
        placeholder="Or enter image URL..."
        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs outline-none focus:border-indigo-500 text-slate-400"
      />
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );

  const TextField = ({ label, field, isTextArea = false }: { label: string; field: string; isTextArea?: boolean }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300">{label}</label>
      {isTextArea ? (
        <textarea
          rows={3}
          value={content[field] || ''}
          onChange={(e) => setContent({ ...content, [field]: e.target.value })}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 text-sm"
        />
      ) : (
        <input
          value={content[field] || ''}
          onChange={(e) => setContent({ ...content, [field]: e.target.value })}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 text-sm"
        />
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">About Us Editor</h1>
          <p className="text-slate-400 mt-1">Manage all images and content for the About page.</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <span className="text-emerald-400 text-sm font-bold animate-fade-in">Changes saved!</span>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-8 py-4 disabled:opacity-50 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {/* Hero Section */}
        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">01</span>
            Hero Section
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <TextField label="Hero Title" field="hero_title" />
              <TextField label="Hero Description" field="hero_desc" isTextArea />
              <TextField label="Active Learners Stat" field="stats_learners" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageField label="Main Image" field="hero_img_main" hint="The large background image" />
              <ImageField label="Bottom Image" field="hero_img_bottom" hint="Overlapping bottom right" />
              <ImageField label="Top Image" field="hero_img_top" hint="Small top right" />
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">02</span>
            Mission & Video
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <TextField label="Section Title" field="mission_title" />
              <TextField label="Section Description" field="mission_desc" isTextArea />
              <ImageField label="Video Thumbnail" field="video_thumbnail" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageField label="Mini Image 1" field="video_mini_1" />
              <ImageField label="Mini Image 2" field="video_mini_2" />
              <ImageField label="Mini Image 3" field="video_mini_3" />
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">03</span>
            Photo Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImageField label="Gallery Image 1" field="gallery_img_1" />
            <ImageField label="Gallery Image 2" field="gallery_img_2" />
            <ImageField label="Gallery Image 3" field="gallery_img_3" />
            <ImageField label="Gallery Image 4" field="gallery_img_4" />
            <ImageField label="Gallery Image 5" field="gallery_img_5" />
          </div>
        </section>
      </div>
    </div>
  );
}
