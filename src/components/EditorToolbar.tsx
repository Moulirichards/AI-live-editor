import { Editor } from '@tiptap/react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Image as ImageIcon,
  Cloud
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null

  const handleInsertLocalImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = (input.files && input.files[0]) || null
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        editor.chain().focus().setImage({ src, alt: file.name }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleInsertDriveImage = () => {
    const url = window.prompt('Paste a public image URL (Google Drive share link or direct URL):')
    if (!url) return
    let src = url.trim()
    // Convert common Google Drive share link to direct download URL
    // e.g., https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/uc?export=view&id=FILE_ID
    const match = src.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/)
    if (match && match[1]) {
      src = `https://drive.google.com/uc?export=view&id=${match[1]}`
    }
    editor.chain().focus().setImage({ src }).run()
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-gray-800">
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('bold') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('italic') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('strike') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-600" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('heading', { level: 1 }) ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('heading', { level: 2 }) ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('heading', { level: 3 }) ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-600" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('bulletList') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('orderedList') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('blockquote') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`h-8 w-8 p-0 rounded-full ${editor.isActive('code') ? '!bg-gray-600 text-white hover:!bg-gray-600' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-600" />

      {/* Images */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInsertLocalImage}
        className="h-8 w-8 p-0 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200"
        title="Insert image from your device"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleInsertDriveImage}
        className="h-8 w-8 p-0 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200"
        title="Insert image from Google Drive link"
      >
        <Cloud className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-600" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-50"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-50"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}