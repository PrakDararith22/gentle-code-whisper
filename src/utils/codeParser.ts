export interface ParsedCodeBlock {
  code: string;
  language: string;
  index: number;
}

/**
 * Parse multiple code blocks from markdown-style text
 * Supports ```language\ncode\n``` format
 */
export function parseCodeBlocks(text: string): ParsedCodeBlock[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: ParsedCodeBlock[] = [];
  let match;
  let index = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    if (code) {
      blocks.push({
        code,
        language,
        index: index++,
      });
    }
  }

  return blocks;
}

/**
 * Detect language from code content if not specified
 */
export function detectLanguage(code: string): string {
  // Simple heuristics
  if (code.includes('function') || code.includes('const') || code.includes('let')) {
    return 'javascript';
  }
  if (code.includes('def ') || code.includes('import ')) {
    return 'python';
  }
  if (code.includes('<html') || code.includes('<!DOCTYPE')) {
    return 'html';
  }
  if (code.includes('{') && code.includes('}') && code.includes(':')) {
    return 'css';
  }
  
  return 'text';
}

/**
 * Extract all code blocks from AI response
 * Returns array of code strings
 */
export function extractCodeBlocks(response: string): string[] {
  const parsed = parseCodeBlocks(response);
  return parsed.map(block => block.code);
}
