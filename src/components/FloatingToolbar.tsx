import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Sparkles, Scissors, Plus, Table } from 'lucide-react'
import { PreviewModal } from './PreviewModal'
import { processText } from '../lib/ai-api'

interface FloatingToolbarProps {
  selectedText: string
  position: { x: number; y: number }
  onReplaceText: (newText: string) => void
  onClose: () => void
  onChatWithAIRequest?: (prefill: string) => void
}

export const FloatingToolbar = ({ 
  selectedText, 
  position, 
  onReplaceText, 
  onClose,
  onChatWithAIRequest
}: FloatingToolbarProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    original: string
    suggestion: string
    action: string
  } | null>(null)

  const handleAIAction = async (action: 'shorten' | 'lengthen' | 'table' | 'grammar' | 'rewrite') => {
    try {
      let result = await processText(selectedText, action)
      let suggestion = ''
      
      // If grammar suggestion equals original, try a style rewrite
      if (
        action === 'grammar' &&
        result.success &&
        result.text.trim() === selectedText.trim()
      ) {
        const rewrite = await processText(selectedText, 'rewrite')
        if (rewrite.success && rewrite.text.trim()) {
          result = rewrite
        }
      }
      
      if (result.success) {
        suggestion = result.text
      } else {
        console.error('AI processing failed:', result.error)
        // Fallback to simple processing
        switch (action) {
          case 'shorten':
            suggestion = selectedText.length > 50 
              ? selectedText.slice(0, Math.floor(selectedText.length * 0.6)) + '...'
              : selectedText
            break
          case 'lengthen':
            suggestion = selectedText + ' Additionally, this expanded version provides more context and detail to enhance understanding.'
            break
          case 'table':
            const lines = selectedText.split('\n').filter(line => line.trim())
            if (lines.length >= 2) {
              suggestion = `
                <table>
                  <thead>
                    <tr><th>Item</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    ${lines.map((line, i) => 
                      `<tr><td>Item ${i + 1}</td><td>${line}</td></tr>`
                    ).join('')}
                  </tbody>
                </table>
              `
            } else {
              suggestion = selectedText
            }
            break
          default:
            suggestion = selectedText
        }
      }
      
      // Always show preview for all actions
      setPreviewData({
        original: selectedText,
        suggestion,
        action: action.charAt(0).toUpperCase() + action.slice(1)
      })
      setShowPreview(true)
      
    } catch (error) {
      console.error('Error processing text:', error)
    }
  }

  const handleConfirm = () => {
    if (previewData?.suggestion) {
      onReplaceText(previewData.suggestion)
      setShowPreview(false)
      onClose()
    }
  }

  const handleCancel = () => {
    setShowPreview(false)
  }

  return (
    <>
      <Card 
        className="floating-menu absolute z-50 p-2 bg-floating-bg shadow-floating border"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleAIAction('shorten')}
            className="h-8 px-2 hover:bg-primary/10"
          >
            <Scissors className="h-3 w-3 mr-1" />
            Shorten
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleAIAction('lengthen')}
            className="h-8 px-2 hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" />
            Lengthen  
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleAIAction('table')}
            className="h-8 px-2 hover:bg-primary/10"
          >
            <Table className="h-3 w-3 mr-1" />
            Table
          </Button>

          <div className="w-px h-4 bg-border mx-1" />
          
          <Button 
            variant="default" 
            size="sm"
            className="h-8 px-2"
            onClick={() => handleAIAction('grammar')}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Edit with AI
          </Button>
        </div>
      </Card>

      {showPreview && previewData && (
        <PreviewModal
          isOpen={showPreview}
          original={previewData.original}
          suggestion={previewData.suggestion}
          action={previewData.action}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onChatWithAI={onChatWithAIRequest ? () => onChatWithAIRequest(`Improve this selection:\n\n${selectedText}`) : undefined}
          defaultShowComparison={true}
        />
      )}
    </>
  )
}