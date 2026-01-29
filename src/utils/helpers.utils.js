import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOM environment for server-side DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
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
    KEEP_CONTENT: true,
  });
}

// Simple text formatter for basic formatting without markdown
export function formatText(text) {
  if (!text) return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/\n/g, '<br>'); // line breaks
}

// Validate and sanitize product rating
export function safeRating(rating) {
  const r = parseFloat(rating);
  return r >= 1 && r <= 5 ? r : 0;
}

// Sanitize text input
export function sanitizeInput(input) {
  if (!input) return '';
  return DOMPurify.sanitize(input.toString().trim(), {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

// Validate price
export function validatePrice(price) {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
}

// Validate rating range
export function validateRating(rating) {
  const numRating = parseFloat(rating);
  return !isNaN(numRating) && numRating >= 1 && numRating <= 5;
}

// Validate file upload
export function validateFileUpload(file) {
  if (!file) return { valid: false, error: 'Product image is required' };

  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, error: 'Image must be less than 2MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, WebP, and GIF images are allowed',
    };
  }

  return { valid: true };
}
