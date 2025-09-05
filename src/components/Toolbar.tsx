import { Button } from './ui/button';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Undo, Redo } from 'lucide-react';

type ToolbarProps = {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onBlockquote: () => void;
  onCodeBlock: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export const Toolbar = ({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onBulletList,
  onOrderedList,
  onBlockquote,
  onCodeBlock,
  onUndo,
  onRedo,
}: ToolbarProps) => {
  return (
    <div className="flex items-center gap-1 p-1 border-b border-gray-800 bg-gray-900">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBold}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onItalic}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUnderline}
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onStrikethrough}
        className="h-8 w-8 p-0"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-gray-700 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onBulletList}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onOrderedList}
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBlockquote}
        className="h-8 w-8 p-0"
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCodeBlock}
        className="h-8 w-8 p-0"
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-gray-700 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        className="h-8 w-8 p-0"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        className="h-8 w-8 p-0"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};
