import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Send, Bot, User, Check, ArrowUp } from 'lucide-react'
import { callAI } from '../lib/ai-api'
import { PreviewModal } from './PreviewModal'
import { toast } from './ui/use-toast'
import { ToastAction } from './ui/toast'
import { Editor } from '@tiptap/core'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatSidebarProps {
  onInsertToEditor?: (content: string) => void
  prefillMessage?: string
  onApplyToSelection?: (content: string) => void
  editorRef?: {
    getSelectedText: () => string;
    replaceRange: (from: number, to: number, content: string) => void;
    appendContent?: (content: string) => void;
  };
}

export const ChatSidebar = ({ onInsertToEditor, prefillMessage, onApplyToSelection, editorRef: propEditorRef }: ChatSidebarProps) => {
  const editorRef = useRef<{ 
    getSelectedText: () => string; 
    replaceRange: (from: number, to: number, content: string) => void;
    appendContent?: (content: string) => void;
  } | null>(null)
  const [lastSelectionRange, setLastSelectionRange] = useState<{ from: number; to: number } | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI writing assistant powered by Gemini. I can help you with editing, grammar, rewrites, and much more.',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [fontSize, setFontSize] = useState(16) // Base font size in pixels
  // Prefill input when provided (e.g., from floating toolbar selection)
  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage)
    }
  }, [prefillMessage])
  const [isLoading, setIsLoading] = useState(false)
  const apiKeyPresent = Boolean((import.meta as any).env?.VITE_GEMINI_API_KEY)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSuggestion, setPreviewSuggestion] = useState('')
  const [pendingInsert, setPendingInsert] = useState('')

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare conversation context for AI
      const conversationMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
      
      conversationMessages.push({
        role: 'user' as const,
        content: currentInput
      })

      // Add system message for context
      const systemMessage = {
        role: 'system' as const,
        content: 'You are an AI writing assistant embedded in a Tiptap editor inside this app. When the user asks to insert, write, or add content, return the exact text to insert without asking for links, editor details, or external context. Provide plain text (or HTML only if explicitly requested). Keep responses concise and directly usable in the editor. Never mention lacking real-time or web access. If the user asks for "latest" or time-sensitive info, produce a neutral, timeless summary or background context that does not claim specific dates or live facts. Critically: do not output placeholders like [Insert ...] or instructions to fill in data later. Always produce complete, self-contained prose or bullet points ready to paste.'
      }

      const response = await callAI([systemMessage, ...conversationMessages])
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.success ? response.text : (response.error || 'Sorry, I encountered an error. Please try again later.'),
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      
      // If the prompt indicates insertion, open confirmation modal instead of auto-inserting
      if (response.success && response.text) {
        const triggerText = currentInput.toLowerCase()
        if (
          triggerText.includes('insert') ||
          triggerText.includes('add to editor') ||
          triggerText.includes('write in editor') ||
          triggerText.startsWith('add ') ||
          triggerText.startsWith('write ') ||
          triggerText.startsWith('put ') ||
          triggerText.startsWith('paste ')
        ) {
          setPreviewSuggestion(response.text)
          setPendingInsert(response.text)
          setShowPreview(true)
        } else if (triggerText.startsWith('improve this selection')) {
          // Auto-apply to current selection and show toast with undo option
          const originalContent = editorRef.current?.getSelectedText() || ''
          onApplyToSelection?.(response.text)
          
          // Store the selection range before it gets cleared
          const currentSelection = { ...(lastSelectionRange || { from: 0, to: 0 }) }
          
          toast({
            title: 'AI Suggestion Applied',
            description: 'The AI suggestion has been applied to your selection.',
            duration: 5000,
            action: (
              <ToastAction 
                altText="Undo" 
                onClick={() => {
                  // Replace the applied text with an empty string to remove it
                  editorRef.current?.replaceRange(
                    currentSelection.from, 
                    currentSelection.from + response.text.length, 
                    ''
                  )
                }}
              >
                Cancel
              </ToastAction>
            ),
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsertToEditor = (content: string) => {
    // Use the editor ref to insert content
    if (editorRef.current?.appendContent) {
      editorRef.current.appendContent(content)
    } else {
      // Fallback to onInsertToEditor if appendContent is not available
      onInsertToEditor?.(content)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Use the editorRef from props if available, otherwise use the local ref
  useEffect(() => {
    if (propEditorRef) {
      editorRef.current = propEditorRef
    } else if (typeof onInsertToEditor === 'function') {
      editorRef.current = {
        getSelectedText: () => '',
        replaceRange: (from: number, to: number, content: string) => {
          onApplyToSelection?.(content)
        },
        appendContent: onInsertToEditor
      }
    }
  }, [propEditorRef, onInsertToEditor, onApplyToSelection])

  return (
    <Card className="h-full flex flex-col bg-black border-gray-800">
      {showPreview && previewSuggestion && (
        <PreviewModal
          isOpen={showPreview}
          original={''}
          suggestion={previewSuggestion}
          action={'Insert'}
          onConfirm={() => {
            onInsertToEditor?.(previewSuggestion)
            setShowPreview(false)
            toast({
              title: 'Suggestion Inserted',
              description: 'The AI suggestion has been added to your document.',
              action: (
                <ToastAction 
                  altText="Confirm"
                  onClick={() => {}}
                >
                  Confirm
                </ToastAction>
              ),
            })
            setPreviewSuggestion('')
            setPendingInsert('')
          }}
          onCancel={() => {
            setShowPreview(false)
            // keep pendingInsert so the user can re-apply later
            setPreviewSuggestion('')
          }}
        />
      )}
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white"> AI Assistant</h3>
              <p className="text-xs text-gray-400">
                {apiKeyPresent ? 'Ready to help' : 'Missing VITE_GEMINI_API_KEY'}
              </p>
            </div>
          </div>
          
        </div>
      </div>

      

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-black">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message flex gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'ai' 
                  ? 'bg-primary' 
                  : 'bg-gray-600'
              }`}>
                {message.sender === 'ai' ? (
                  <Bot className="h-3 w-3 text-white" />
                ) : (
                  <User className="h-3 w-3 text-secondary-foreground" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[80%] ${
                message.sender === 'user' ? 'text-right' : ''
              }`}>
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.sender === 'ai'
                      ? 'bg-gray-800 text-white border border-gray-700 hover:border-primary/40 transition-colors cursor-pointer'
                      : 'bg-blue-500 text-white'
                  }`}
                  onClick={() => {
                    if (message.sender === 'ai') {
                      setPendingInsert(message.content)
                      toast({
                        title: 'Suggestion Ready',
                        description: 'Click the Insert button to apply this suggestion to your document.',
                        action: (
                          <ToastAction 
                            altText="Insert" 
                            onClick={() => {
                              onInsertToEditor?.(message.content)
                              setPendingInsert('')
                            }}
                          >
                            Confirm
                          </ToastAction>
                        ),
                      })
                    }
                  }}
                  title={message.sender === 'ai' ? 'Click to re-apply this AI suggestion' : undefined}
                >
                  {message.content}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        {pendingInsert && (
          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 truncate">An AI suggestion is available to insert.</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  onInsertToEditor?.(pendingInsert)
                  setPendingInsert('')
                }}
              >
                Insert
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => setPendingInsert('')}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="w-full relative">
          <div className="relative w-full">
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                // Adjust font size based on content length
                const length = e.target.value.length
                if (length > 100) setFontSize(14)
                if (length > 200) setFontSize(13)
                if (length > 300) setFontSize(12)
                if (length <= 100) setFontSize(16)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask AI for help... (try 'insert a paragraph about...')"
              disabled={isLoading}
              className="w-full min-h-[40px] py-2 pl-3 pr-12 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 resize-none overflow-hidden"
              style={{
                minHeight: '40px',
                height: 'auto',
                lineHeight: '1.5',
                fontSize: `${fontSize}px`,
                transition: 'font-size 0.2s ease-in-out',
                width: '100%',
                paddingRight: '3rem' // Make room for the send button
              }}
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                // Auto-resize the textarea
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
              style={{
                opacity: inputValue.trim() ? 1 : 0.5,
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}