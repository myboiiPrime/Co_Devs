const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async getCodeCompletion(code, language, cursor) {
    try {
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
      console.error('Gemini completion error:', error);
      throw error;
    }
  }

  async explainCode(code, language) {
    try {
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
      console.error('Gemini explanation error:', error);
      throw error;
    }
  }

  async optimizeCode(code, language) {
    try {
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
      console.error('Gemini optimization error:', error);
      throw error;
    }
  }

  async generateCode(prompt, language) {
    try {
      const fullPrompt = `
Generate ${language} code based on this request: ${prompt}

Return only the code without explanations or markdown formatting.
`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini code generation error:', error);
      throw error;
    }
  }
}

module.exports = new GeminiService();