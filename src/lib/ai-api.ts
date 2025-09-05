// AI API Integration with Gemini API

interface AIResponse {
  text: string
  success: boolean
  error?: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Gemini API Integration
export const callAI = async (
  messages: ChatMessage[],
): Promise<AIResponse> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    return {
      text: 'Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env.local.',
      success: false,
      error: 'API key required'
    }
  }

  try {
    // Convert messages to Gemini format
    const systemPrompt = messages.find(m => m.role === 'system')?.content || 
      'You are a helpful AI writing assistant. Help users with their writing, editing, grammar, and content creation. Be concise but helpful.'
    
    const userMessages = messages.filter(m => m.role !== 'system')
    const conversationText = userMessages.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n\n')

    const prompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nAssistant:`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      const message = data?.error?.message || data?.message || JSON.stringify(data)
      throw new Error(message || 'Gemini API request failed')
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return {
      text: generatedText,
      success: true
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Text processing functions for floating toolbar actions with Gemini API
export const processText = async (
  text: string, 
  action: 'shorten' | 'lengthen' | 'table' | 'grammar' | 'rewrite'
): Promise<AIResponse> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    return {
      text: 'Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env.local.',
      success: false,
      error: 'API key required'
    }
  }

  try {
    let prompt = ''
    
    switch (action) {
      case 'shorten':
        prompt = `Please shorten the following text while keeping the main message and important details:\n\n"${text}"\n\nProvide only the shortened version without any explanations.`
        break
        
      case 'lengthen':
        prompt = `Please expand and elaborate on the following text with additional context, details, and explanations:\n\n"${text}"\n\nProvide only the expanded version without any explanations.`
        break
        
      case 'table':
        prompt = `Convert the following text into a well-structured HTML table format. Extract key information and organize it logically:\n\n"${text}"\n\nProvide only the HTML table without any explanations.`
        break
        
      case 'grammar':
        prompt = `Please fix any grammar, spelling, and punctuation errors in the following text. Improve clarity and readability:\n\n"${text}"\n\nProvide only the corrected version without any explanations.`
        break
      
      case 'rewrite':
        prompt = `Rewrite the following text to improve clarity, flow, and style while preserving the original meaning. Vary the wording and sentence structure slightly, keep approximately the same length, and make it feel polished and natural.\n\n"${text}"\n\nProvide only the rewritten version without any explanations.`
        break
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      const message = data?.error?.message || data?.message || JSON.stringify(data)
      throw new Error(message || 'Gemini API request failed')
    }

    const processedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text
    
    return {
      text: processedText.trim(),
      success: true
    }
  } catch (error) {
    console.error('Gemini text processing error:', error)
    return {
      text: text,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Real AI API integration examples (uncomment and configure when ready)

/*
// OpenAI API Integration
export const callOpenAI = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<AIResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed')
    }

    return {
      text: data.choices[0]?.message?.content || '',
      success: true
    }
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Anthropic Claude API Integration  
export const callClaude = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<AIResponse> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed')
    }

    return {
      text: data.content[0]?.text || '',
      success: true
    }
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
*/