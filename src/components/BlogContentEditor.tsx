import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

export type ContentBlock = {
  id: string;
  type: 'paragraph' | 'heading' | 'image';
  content: string;
  level?: 1 | 2 | 3;
  imageUrl?: string;
};

type BlogContentEditorProps = {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
};

export function BlogContentEditor({ value, onChange }: BlogContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    if (!value || value.length === 0) {
      return [{ id: '1', type: 'paragraph', content: '' }];
    }
    return value;
  });

  useEffect(() => {
    onChange(blocks);
  }, [blocks, onChange]);

  function addBlock(type: 'paragraph' | 'heading' | 'image') {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      imageUrl: type === 'image' ? '' : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
  }

  function updateBlock(id: string, updates: Partial<ContentBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }

  function deleteBlock(id: string) {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  }

  return (
    <div className="space-y-6">
      <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Blog Content Sections</div>
      {blocks.map((block, index) => (
        <div key={block.id} className="relative rounded-3xl bg-slate-900/40 border border-slate-800 p-5 group transition-all hover:bg-slate-900/60">
          <div className="absolute -left-3 top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveBlock(index, 'up')}
              disabled={index === 0}
              className="p-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-500 hover:border-indigo-400 disabled:opacity-30 disabled:hover:bg-slate-800"
              title="Move up"
            >
              <GripVertical className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              onClick={() => moveBlock(index, 'down')}
              disabled={index === blocks.length - 1}
              className="p-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-500 hover:border-indigo-400 disabled:opacity-30 disabled:hover:bg-slate-800"
              title="Move down"
            >
              <GripVertical className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-black text-slate-400">
                {index + 1}
              </div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                {block.type === 'paragraph' && 'Text Content'}
                {block.type === 'heading' && 'Section Heading'}
                {block.type === 'image' && 'Image & Caption'}
              </span>
            </div>
            <button
              onClick={() => deleteBlock(block.id)}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove this section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {block.type === 'paragraph' && (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Type your content here. Use multiple paragraphs for better readability..."
                rows={6}
                className="w-full rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4 outline-none focus:border-indigo-500 text-slate-200 leading-relaxed"
              />
            )}

            {block.type === 'heading' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Heading Type</div>
                  <select
                    value={block.level || 2}
                    onChange={(e) => updateBlock(block.id, { level: Number(e.target.value) as 1 | 2 | 3 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value={1}>Major Heading (H1)</option>
                    <option value={2}>Section Title (H2)</option>
                    <option value={3}>Sub-heading (H3)</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Heading Text</div>
                  <input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Enter the title for this section..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 text-lg font-black tracking-tight"
                  />
                </div>
              </div>
            )}

            {block.type === 'image' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Image Address (URL)</div>
                    <input
                      value={block.imageUrl || ''}
                      onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Short Description (Caption)</div>
                    <input
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="Explain what this image shows..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[140px]">
                  {block.imageUrl ? (
                    <img src={block.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Image Preview</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-800/50">
        <button
          onClick={() => addBlock('paragraph')}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-sm font-black hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          Add Text Section
        </button>
        <button
          onClick={() => addBlock('heading')}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-sm font-black hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          Add Heading
        </button>
        <button
          onClick={() => addBlock('image')}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-sm font-black hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300"
        >
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          Add Image
        </button>
      </div>
    </div>
  );
}


export function blocksToHtml(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';
  
  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        const text = block.content.trim();
        if (!text) return '';
        return `<p>${text}</p>`;
      }
      if (block.type === 'heading') {
        const text = block.content.trim();
        if (!text) return '';
        const level = block.level || 2;
        return `<h${level}>${text}</h${level}>`;
      }
      if (block.type === 'image') {
        const url = block.imageUrl?.trim();
        if (!url) return '';
        const caption = block.content.trim();
        return `<figure><img src="${url}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export function htmlToBlocks(html: string): ContentBlock[] {
  if (!html || !html.trim()) {
    return [{ id: '1', type: 'paragraph', content: '' }];
  }

  const blocks: ContentBlock[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  let idCounter = 1;
  const children = tempDiv.querySelectorAll('p, h1, h2, h3, figure');

  children.forEach((child) => {
    if (child.tagName === 'P') {
      const text = child.textContent?.trim() || '';
      if (text) {
        blocks.push({ id: String(idCounter++), type: 'paragraph', content: text });
      }
    } else if (child.tagName === 'H1') {
      const text = child.textContent?.trim() || '';
      if (text) {
        blocks.push({ id: String(idCounter++), type: 'heading', content: text, level: 1 });
      }
    } else if (child.tagName === 'H2') {
      const text = child.textContent?.trim() || '';
      if (text) {
        blocks.push({ id: String(idCounter++), type: 'heading', content: text, level: 2 });
      }
    } else if (child.tagName === 'H3') {
      const text = child.textContent?.trim() || '';
      if (text) {
        blocks.push({ id: String(idCounter++), type: 'heading', content: text, level: 3 });
      }
    } else if (child.tagName === 'FIGURE') {
      const img = child.querySelector('img');
      const caption = child.querySelector('figcaption');
      if (img) {
        blocks.push({
          id: String(idCounter++),
          type: 'image',
          imageUrl: img.getAttribute('src') || '',
          content: caption?.textContent?.trim() || '',
        });
      }
    }
  });

  if (blocks.length === 0) {
    return [{ id: '1', type: 'paragraph', content: '' }];
  }

  return blocks;
}