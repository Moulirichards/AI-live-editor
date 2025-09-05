# 🤖 AI-Powered Collaborative Editor

A modern, intelligent writing environment that combines the power of rich text editing with AI assistance. Built with React, TypeScript, and Tiptap.

![AI Editor Demo](https://via.placeholder.com/800x400/6366F1/FFFFFF?text=AI+Editor+Demo)

## ✨ Features

### 📝 Rich Text Editor
- **Tiptap-powered editor** with full formatting support
- **Real-time collaborative editing** capabilities
- **Beautiful, responsive design** with modern UI components
- **Keyboard shortcuts** for efficient writing

### 🧠 AI Assistant
- **Intelligent chat sidebar** for writing assistance
- **Context-aware suggestions** and improvements
- **Grammar and style corrections**
- **Content generation** and brainstorming help

### 🛠️ Floating AI Toolbar
- **Smart text selection tools** that appear on highlight
- **Shorten/Lengthen text** with AI processing
- **Convert text to tables** automatically
- **Real-time preview** of AI suggestions before applying

### 🎨 Modern Design System
- **Professional gradient themes** with light/dark mode support
- **Smooth animations** and micro-interactions
- **Responsive layout** that works on all devices
- **Accessible components** built with Radix UI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- An AI API key (OpenAI, Anthropic, etc.) - optional for demo mode

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd ai-collaborative-editor
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys (optional - works in demo mode without)
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:8080`

## 🔧 Configuration

### AI API Setup (Optional)

The app works in demo mode by default, but you can connect real AI APIs:

**OpenAI Setup:**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Anthropic Claude Setup:**
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Customizing the AI Integration

Edit `src/lib/ai-api.ts` to:
- Connect to your preferred AI service
- Customize AI behavior and prompts
- Add new text processing capabilities

## 📁 Project Structure

```
src/
├── components/
│   ├── TiptapEditor.tsx      # Main rich text editor
│   ├── ChatSidebar.tsx      # AI chat assistant
│   ├── FloatingToolbar.tsx  # Selection-based AI tools
│   ├── PreviewModal.tsx     # AI suggestion previews
│   ├── EditorLayout.tsx     # Main layout component
│   └── ui/                  # Reusable UI components
├── lib/
│   └── ai-api.ts           # AI integration logic
├── pages/
│   └── Index.tsx           # Main page
└── styles/
    └── index.css           # Design system & styles
```

## 🎯 Usage Guide

### Writing with AI Assistance

1. **Start writing** in the main editor area
2. **Select any text** to see the floating AI toolbar
3. **Choose AI actions**:
   - **Shorten**: Condense text while keeping meaning
   - **Lengthen**: Expand with additional context
   - **Table**: Convert lists to structured tables
   - **Edit with AI**: Custom AI processing

### Using the Chat Assistant

1. **Click the chat panel** on the right side
2. **Ask questions** about writing, grammar, or content
3. **Get suggestions** for improvements and ideas
4. **Request specific help** like "Make this more professional"

### Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold text
- `Ctrl/Cmd + I` - Italic text
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Enter` in chat - Send message
- `Shift + Enter` in chat - New line

## 🚢 Deployment

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables for Production

Remember to set your environment variables in your deployment platform:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- Any other API keys you're using

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New AI Features

1. **Extend the AI API** in `src/lib/ai-api.ts`
2. **Add UI components** for new features
3. **Update the floating toolbar** or chat sidebar
4. **Test with your AI provider**

## 🎨 Customization

### Design System

The app uses a comprehensive design system defined in:
- `src/index.css` - CSS variables and base styles  
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/` - Reusable components

### Theming

Colors and styles are controlled via CSS variables:
```css
:root {
  --primary: 236 72% 59%;        /* Main brand color */
  --gradient-primary: ...;       /* Primary gradient */
  --editor-bg: ...;             /* Editor background */
  /* ... more variables */
}
```

## 🔒 Security Notes

- API keys should be stored in environment variables
- Never commit API keys to version control
- Use server-side APIs for production applications
- Validate and sanitize user input

## 📝 License

MIT License - feel free to use this project as a foundation for your own AI-powered editor!

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

---

**Happy Writing! ✍️🤖**