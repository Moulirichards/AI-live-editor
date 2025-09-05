import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { FloatingToolbar } from './FloatingToolbar'
import { EditorToolbar } from './EditorToolbar'


import { Editor } from '@tiptap/core'

interface TiptapEditorProps {
  onSelectionChange?: (selectedText: string, selection: any) => void
  onContentChange?: (content: string) => void
  onEditorInit?: (editor: Editor | null) => void
  hideToolbar?: boolean
}

export interface TiptapEditorRef {
  insertContent: (content: string) => void
  appendContent: (content: string) => void
  replaceSelection: (content: string) => void
  getContent: () => string
  getSelectedText: () => string
  replaceRange: (from: number, to: number, content: string) => void
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({ onSelectionChange, onContentChange, onEditorInit, hideToolbar = false }, ref) => {
  const [selectedText, setSelectedText] = useState('')
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({ inline: false, allowBase64: true })
    ],
    content: `
      <h1 class="text-gray-300">Welcome to your AI-Powered Editor</h1>
      <p class="text-gray-400">Start writing something amazing. Select any text to see AI-powered editing options appear!</p>
      <p class="text-gray-400">This editor supports rich formatting including <strong class="text-gray-300">bold text</strong>, <em class="text-gray-300">italics</em>, and more.</p>
      <blockquote class="border-l-4 border-gray-500 pl-4 text-gray-400">
        <p>Try selecting this quote to see the floating AI toolbar in action.</p>
      </blockquote>
      <p class="text-gray-400">The AI assistant in the sidebar can help you with grammar, rewrites, summaries, and much more.</p>
    `,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      onEditorInit?.(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection
      
      if (empty) {
        setShowFloatingToolbar(false)
        setSelectedText('')
        return
      }

      const text = editor.state.doc.textBetween(from, to, ' ')
      setSelectedText(text)
      
      // Calculate toolbar position
      const { view } = editor
      const start = view.coordsAtPos(from)
      const end = view.coordsAtPos(to)
      
      setToolbarPosition({
        x: (start.left + end.right) / 2,
        y: start.top - 60,
      })
      
      setShowFloatingToolbar(true)
      onSelectionChange?.(text, { from, to })
    },
  })

  const handleTextReplacement = useCallback((newText: string) => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    editor.chain().focus().setTextSelection({ from, to }).insertContent(newText).run()
    setShowFloatingToolbar(false)
  }, [editor])

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    insertContent: (content: string) => {
      if (editor) {
        editor.chain().focus().insertContent(content).run()
      }
    },
    appendContent: (content: string) => {
      if (editor) {
        editor.chain().focus().setTextSelection(editor.state.doc.content.size).insertContent('\n\n' + content).run()
      }
    },
    replaceSelection: (content: string) => {
      if (editor) {
        editor.chain().focus().deleteSelection().insertContent(content).run()
      }
    },
    getContent: () => {
      return editor?.getHTML() || ''
    },
    getSelectedText: () => selectedText
    ,
    replaceRange: (from: number, to: number, content: string) => {
      if (editor) {
        editor.chain().focus().setTextSelection({ from, to }).insertContent(content).run()
      }
    }
  }))

  if (!editor) {
    return <div className="flex items-center justify-center h-full">Loading editor...</div>
  }

  // Add editor styles to the document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror {
        color: hsl(var(--muted-foreground));
        padding: 1.5rem;
      }
      .ProseMirror h1 {
        color: hsl(var(--muted-foreground));
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1.5rem 0 1rem;
      }
      .ProseMirror p {
        color: hsl(var(--muted-foreground));
        margin: 0.75rem 0;
      }
      .ProseMirror strong {
        color: hsl(var(--foreground));
        font-weight: 600;
      }
      .ProseMirror em {
        color: hsl(var(--foreground));
        font-style: italic;
      }
      .ProseMirror blockquote {
        border-left: 4px solid hsl(var(--border));
        padding-left: 1rem;
        margin: 1rem 0;
        color: hsl(var(--muted-foreground));
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col">
      {!hideToolbar && editor && <EditorToolbar editor={editor} />}
      
      <div className="flex-1 relative">
        <EditorContent 
          editor={editor} 
          className="h-full bg-editor-bg border border-editor-border rounded-lg overflow-hidden text-gray-400"
        />
        
        {showFloatingToolbar && selectedText && (
          <FloatingToolbar
            selectedText={selectedText}
            position={toolbarPosition}
            onReplaceText={handleTextReplacement}
            onClose={() => setShowFloatingToolbar(false)}
            onChatWithAIRequest={(prefill) => {
              // Dispatch a custom event the layout can use to prefill chat
              window.dispatchEvent(new CustomEvent('chat-prefill', { detail: prefill }))
              setShowFloatingToolbar(false)
            }}
          />
        )}
      </div>
    </div>
  )
})