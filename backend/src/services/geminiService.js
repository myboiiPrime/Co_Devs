const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_new_api_key_here') {
      console.error('❌ GEMINI_API_KEY is not configured properly');
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.');
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log('✅ Gemini service initialized successfully with gemini-2.5-flash');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini service:', error);
      throw error;
    }
  }

  async getCodeCompletion(code, language, cursor) {
    try {
      console.log('🤖 Gemini API call: getCodeCompletion');
      const prompt = `
You are a code completion assistant. Given the following code context:

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Cursor position: Line ${cursor.line}, Column ${cursor.column}

Provide 3-5 relevant code completion suggestions. Return ONLY a JSON array with this format:
[
  {
    "text": "completion text",
    "detail": "description",
    "kind": "function|variable|keyword|class|method"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON response, using fallback');
        // Fallback if AI doesn't return valid JSON
        return [
          {
            text: text.split('\n')[0] || 'suggestion',
            detail: 'AI suggestion',
            kind: 'function'
          }
        ];
      }
    } catch (error) {
      console.error('❌ Gemini completion error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async explainCode(code, language) {
    try {
      console.log('🤖 Gemini API call: explainCode');
      const prompt = `
Explain the following ${language} code in a clear, concise way:

\`\`\`${language}
${code}
\`\`\`

Provide a detailed explanation of what this code does, how it works, and any important concepts.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini explanation error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async optimizeCode(code, language) {
    try {
      console.log('🤖 Gemini API call: optimizeCode');
      const prompt = `
Analyze the following ${language} code and suggest optimizations:

\`\`\`${language}
${code}
\`\`\`

Return suggestions as JSON array with this format:
[
  {
    "line": line_number,
    "suggestion": "optimization suggestion",
    "severity": "info|warning|error",
    "reason": "explanation why this optimization helps"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON response, using fallback');
        // Fallback response
        return [
          {
            line: 1,
            suggestion: text.split('\n')[0] || 'Consider code optimization',
            severity: 'info',
            reason: 'AI analysis'
          }
        ];
      }
    } catch (error) {
      console.error('❌ Gemini optimization error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async generateCode(prompt, language) {
    try {
      console.log('🤖 Gemini API call: generateCode');
      const fullPrompt = `
You are a helpful coding assistant. Respond to this request: ${prompt}

If the request is asking for code in ${language}, provide the code.
If the request is asking a general programming question, provide a helpful explanation.
If the request is asking for code generation, create clean, well-commented code.

Be conversational and helpful in your response.
`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini code generation error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();