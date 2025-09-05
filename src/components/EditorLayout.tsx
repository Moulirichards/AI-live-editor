import { useState, useRef, useCallback } from 'react'
import { TiptapEditor, TiptapEditorRef } from './TiptapEditor'
import { ChatSidebar } from './ChatSidebar'
import { EditorToolbar } from './EditorToolbar'
import { Button } from './ui/button'
import { PanelRightOpen, PanelRightClose, Save, Printer, Share2, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Editor } from '@tiptap/core'

export const EditorLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [selectedText, setSelectedText] = useState('')
  const [chatPrefill, setChatPrefill] = useState('')
  const [lastSelectionRange, setLastSelectionRange] = useState<{ from: number; to: number } | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveFormat, setSaveFormat] = useState<'pdf' | 'doc'>('pdf')
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const editorRef = useRef<TiptapEditorRef>(null)

  const handleEditorInit = useCallback((editor: Editor | null) => {
    setEditorInstance(editor)
  }, [])

  const handleSelectionChange = (text: string, selection: any) => {
    setSelectedText(text)
    if (selection?.from && selection?.to) {
      setLastSelectionRange({ from: selection.from, to: selection.to })
    }
  }

  const handleContentChange = (content: string) => {
    // Handle content changes if needed
    console.log('Content changed:', content.length, 'characters')
  }

  // Listen for chat prefill requests from the floating toolbar
  useState(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      setChatPrefill(detail)
      setIsChatOpen(true)
    }
    window.addEventListener('chat-prefill', handler as EventListener)
    return () => window.removeEventListener('chat-prefill', handler as EventListener)
  })

  const handleInsertToEditor = (content: string) => {
    // Use the editor ref to insert content
    if (editorRef.current) {
      editorRef.current.appendContent(content)
    }
  }

  const applyChatEditToSelection = (content: string) => {
    if (editorRef.current && lastSelectionRange) {
      editorRef.current.replaceRange(lastSelectionRange.from, lastSelectionRange.to, content)
    }
  }

  const getDocumentHTML = () => {
    const content = editorRef.current?.getContent() || ''
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Document</title>
      <style>body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5; padding:24px} img{max-width:100%;}</style>
    </head><body>${content}</body></html>`
    return html
  }

  const handlePrint = () => {
    const html = getDocumentHTML()
    const win = window.open('', '_blank')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
    // Give the new window a moment to render before printing
    setTimeout(() => win.print(), 250)
  }

  const handleSave = () => {
    const html = getDocumentHTML()
    if (saveFormat === 'pdf') {
      const win = window.open('', '_blank')
      if (!win) return
      win.document.open()
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 250)
    } else {
      const blob = new Blob([html], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'document.doc'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    setShowSaveDialog(false)
  }

  const handleShare = () => {
    const content = editorRef.current?.getContent() || ''
    const shareData = {
      title: 'AI Editor Document',
      text: 'Check out this document created with AI Editor',
      url: window.location.href
    }
    
    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // Just copy to clipboard without showing a notification
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleInvite = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true`
    // Just copy to clipboard without showing a notification
    navigator.clipboard.writeText(inviteUrl)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex flex-col border-b border-gray-800 bg-black text-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">FirstConnect's AI powered editor</h1>
              <p className="text-xs text-gray-400">
                Collaborative writing with intelligent assistance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => setShowSaveDialog(true)}
              title="Save (PDF or DOC)"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  title="Share and invite"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInvite}>
                  <Users className="h-4 w-4 mr-2" />
                  Invite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={handlePrint}
              title="Print"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="lg:hidden"
            >
              {isChatOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="border-t border-gray-800">
          {editorInstance && <EditorToolbar editor={editorInstance} />}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-gray-900">
        {/* Editor Section */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto bg-black rounded-lg border border-gray-800 min-h-full">
            <div className="p-8 text-gray-200">
              <TiptapEditor 
                ref={editorRef}
                onSelectionChange={handleSelectionChange}
                onContentChange={handleContentChange}
                hideToolbar={true}
                onEditorInit={handleEditorInit}
              />
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`
          w-[500px] border-l border-border transition-all duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-l-0'}
        `}>
          {isChatOpen && (
            <div className="h-full p-6 pr-6">
              <ChatSidebar 
                onInsertToEditor={handleInsertToEditor}
                prefillMessage={chatPrefill}
                onApplyToSelection={applyChatEditToSelection}
                editorRef={{
                  getSelectedText: () => editorRef.current?.getSelectedText() || '',
                  replaceRange: (from: number, to: number, content: string) => {
                    if (editorRef.current) {
                      editorRef.current.replaceRange(from, to, content)
                    }
                  },
                  appendContent: (content: string) => {
                    if (editorRef.current) {
                      editorRef.current.appendContent(content)
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>


      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save document</DialogTitle>
            <DialogDescription>Choose a format to save to your device.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="save-format"
                  checked={saveFormat === 'pdf'}
                  onChange={() => setSaveFormat('pdf')}
                />
                PDF (via print dialog)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="save-format"
                  checked={saveFormat === 'doc'}
                  onChange={() => setSaveFormat('doc')}
                />
                Word (.doc)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}