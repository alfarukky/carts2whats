import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOM environment for server-side DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true
});

// Sanitize markdown text and convert to safe HTML
export function sanitizeMarkdown(text) {
  if (!text) return '';
  
  // Convert markdown to HTML
  const html = marked(text);
  
  // Sanitize HTML - only allow safe formatting tags
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'p', 'br', 'span'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

// Simple text formatter for basic formatting without markdown
export function formatText(text) {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\n/g, '<br>');                           // line breaks
}
