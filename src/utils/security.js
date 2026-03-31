// Security utility for preventing XSS attacks on the frontend
// Escapes HTML special characters to prevent XSS

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  }
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char])
}

/**
 * Sanitizes user input by removing dangerous characters and scripts
 * @param {string} input - The input to sanitize
 * @returns {string} - The sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove <script> tags and onclick handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  return sanitized
}

/**
 * Validates that input doesn't contain suspicious patterns
 * @param {string} input - The input to validate
 * @returns {boolean} - True if input is safe, false otherwise
 */
export const isInputSafe = (input) => {
  if (typeof input !== 'string') return true
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i,
  ]
  
  return !suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Extracts and returns text content only (removes HTML)
 * @param {string} html - The HTML to strip
 * @returns {string} - Plain text
 */
export const stripHtml = (html) => {
  if (typeof html !== 'string') return html
  
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL to prevent javascript: protocol
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if safe URL
 */
export const isUrlSafe = (url) => {
  if (typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
