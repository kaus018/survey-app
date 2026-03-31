import crypto from 'crypto'

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map()

// Generate CSRF token
export const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    req.session = {}
  }
  
  // Generate new token if one doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex')
    csrfTokens.set(req.session.csrfToken, {
      createdAt: Date.now(),
      used: false
    })
  }
  
  // Return token in response header
  res.set('X-CSRF-Token', req.session.csrfToken)
  next()
}

// Verify CSRF token for state-changing requests (POST, PUT, DELETE)
export const verifyCSRFToken = (req, res, next) => {
  // Skip CSRF check for GET and HEAD requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf

  if (!token) {
    return res.status(403).json({ 
      message: 'CSRF token missing',
      code: 'CSRF_MISSING'
    })
  }

  if (!csrfTokens.has(token)) {
    return res.status(403).json({ 
      message: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    })
  }

  const tokenData = csrfTokens.get(token)
  
  // Check if token has expired (1 hour)
  if (Date.now() - tokenData.createdAt > 60 * 60 * 1000) {
    csrfTokens.delete(token)
    return res.status(403).json({ 
      message: 'CSRF token expired',
      code: 'CSRF_EXPIRED'
    })
  }

  // Mark token as used (rotate it after use)
  csrfTokens.delete(token)
  
  next()
}

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour

  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > maxAge) {
      csrfTokens.delete(token)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes
