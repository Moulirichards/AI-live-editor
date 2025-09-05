import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Check, X, Sparkles, Bot } from 'lucide-react'
import { useState, useMemo } from 'react'

interface PreviewModalProps {
  isOpen: boolean
  original: string
  suggestion: string
  action: string
  onConfirm: () => void
  onCancel: () => void
  onChatWithAI?: () => void
  defaultShowComparison?: boolean
}

export const PreviewModal = ({
  isOpen,
  original,
  suggestion,
  action,
  onConfirm,
  onCancel,
  onChatWithAI,
  defaultShowComparison = true,
}: PreviewModalProps) => {
  const hasOriginal = useMemo(() => Boolean(original && original.trim().length > 0), [original])
  const [showComparison, setShowComparison] = useState(defaultShowComparison && hasOriginal)
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Suggestion Preview
            <Badge variant="secondary" className="ml-2">
              {action}
            </Badge>
            {hasOriginal && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-8 px-2"
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? 'Suggestion only' : 'Original vs AI'}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Review the AI-generated changes before applying them to your document.
          </DialogDescription>
        </DialogHeader>

        {showComparison ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-hidden">
            {/* Original Text */}
            <Card className="p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <h4 className="font-semibold text-sm text-muted-foreground">Original</h4>
              </div>
              <div className="prose prose-sm prose-invert max-w-none h-full overflow-y-auto text-white">
                <div className="text-white" dangerouslySetInnerHTML={{ __html: original }} />
              </div>
            </Card>

            {/* AI Suggestion */}
            <Card className="p-4 h-full border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                <h4 className="font-semibold text-sm text-primary">AI Suggestion</h4>
              </div>
              <div className="prose prose-sm prose-invert max-w-none h-full overflow-y-auto text-white">
                <div className="text-white" dangerouslySetInnerHTML={{ __html: suggestion }} />
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Card className="p-4 h-full border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                <h4 className="font-semibold text-sm text-primary">AI Suggestion</h4>
              </div>
              <div className="prose prose-sm prose-invert max-w-none h-full overflow-y-auto text-white">
                <div className="text-white" dangerouslySetInnerHTML={{ __html: suggestion }} />
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          {onChatWithAI && (
            <Button 
              variant="secondary"
              onClick={onChatWithAI}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Edit with AI
            </Button>
          )}
          <Button 
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}