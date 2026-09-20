import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Optional icon imports for toolbar
import { Bold, Italic, List, ListOrdered, Save } from 'lucide-react';

interface NotesEditorProps {
  contentItemId: string;
}

export default function NotesEditor({ contentItemId }: NotesEditorProps) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');

  // Fetch existing note for this content item
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', contentItemId],
    queryFn: async () => {
      const res = await apiClient.get(`/notes/content-item/${contentItemId}`);
      return res.data; // Returns a list, we'll use the first one if it exists
    },
    enabled: !!contentItemId
  });

  const existingNote = notes && notes.length > 0 ? notes[0] : null;

  // Create or Update Note Mutation
  const saveMutation = useMutation({
    mutationFn: async (html: string) => {
      if (existingNote) {
        const res = await apiClient.put(`/notes/${existingNote.id}`, {
          content_html: html,
          video_timestamp: null, // Could pull from video player ref if needed
        });
        return res.data;
      } else {
        const res = await apiClient.post('/notes', {
          content_item_id: contentItemId,
          content_html: html,
          video_timestamp: null,
        });
        return res.data;
      }
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['notes', contentItemId] });
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Take private notes for this section...',
      })
    ],
    content: existingNote ? existingNote.content_html : '',
    onUpdate: ({ editor }) => {
      // We will handle autosave below, but we can set status to idle here 
      // when typing starts
      setSaveStatus('idle');
    }
  });

  // Debounced Autosave
  useEffect(() => {
    if (!editor) return;

    const timeoutId = setTimeout(() => {
      if (saveStatus === 'idle' && editor.getHTML() !== (existingNote?.content_html || '<p></p>')) {
        saveMutation.mutate(editor.getHTML());
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timeoutId);
  }, [editor?.getHTML(), saveStatus, existingNote, saveMutation, editor]);


  // Initialize content once loaded
  useEffect(() => {
    if (editor && existingNote && editor.getHTML() !== existingNote.content_html) {
        editor.commands.setContent(existingNote.content_html);
    }
  }, [existingNote, editor]);


  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center border border-[#30363d] rounded-lg bg-[#161b22] text-[#8b949e] animate-pulse">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="w-full border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden flex flex-col">
      {/* Toolbar */}
      {editor && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] bg-[#21262d]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-[#30363d] text-[#c9d1d9] transition-colors ${editor.isActive('bold') ? 'bg-[#30363d] text-white' : ''}`}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-[#30363d] text-[#c9d1d9] transition-colors ${editor.isActive('italic') ? 'bg-[#30363d] text-white' : ''}`}
            >
              <Italic size={14} />
            </button>
            <div className="w-px h-4 bg-[#30363d] mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-[#30363d] text-[#c9d1d9] transition-colors ${editor.isActive('bulletList') ? 'bg-[#30363d] text-white' : ''}`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded hover:bg-[#30363d] text-[#c9d1d9] transition-colors ${editor.isActive('orderedList') ? 'bg-[#30363d] text-white' : ''}`}
            >
              <ListOrdered size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono">
            {saveStatus === 'saving' && <span className="text-[#8b949e]">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[#3fb950] flex items-center gap-1"><Save size={12}/> Saved</span>}
            {saveStatus === 'error' && <span className="text-[#f85149]">Failed to save</span>}
            {saveStatus === 'idle' && <span className="text-[#8b949e]">Draft</span>}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4 flex-1 prose prose-invert prose-p:text-[#c9d1d9] prose-p:font-['DM_Sans'] min-h-[120px] max-w-none focus-within:outline-none">
        <EditorContent editor={editor} className="outline-none focus:outline-none min-h-[120px]" />
      </div>
    </div>
  );
}
