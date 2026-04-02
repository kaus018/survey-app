import crypto from 'crypto'

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map()

// Generate CSRF token
export const generateCSRFToken = (req, res, next) => {
  // Generate new token for each request
  const token = crypto.randomBytes(32).toString('hex')
  csrfTokens.set(token, {
    createdAt: Date.now(),
    used: false
  })

  // Return token in response header
  res.set('X-CSRF-Token', token)
  console.log(`[CSRF] 🔑 Generated token for ${req.method} ${req.path}: ${token.substring(0, 8)}... (Total: ${csrfTokens.size})`)
  next()
}

// Verify CSRF token for state-changing requests (POST, PUT, DELETE)
export const verifyCSRFToken = (req, res, next) => {
  // Skip CSRF check for GET and HEAD requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  // Skip CSRF check for auth endpoints (first request without token)
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    console.log(`[CSRF] ⏭️ Skipping CSRF check for ${req.method} ${req.path}`)
    return next()
  }

  const token = req.headers['x-csrf-token']
  console.log(`[CSRF] 🔍 Verifying token for ${req.method} ${req.path}`)
  console.log(`[CSRF] Token received: ${token ? token.substring(0, 8) + '...' : 'MISSING'}`)
  console.log(`[CSRF] Valid tokens in storage: ${csrfTokens.size}`)

  if (!token) {
    console.log(`[CSRF] ❌ CSRF token missing for ${req.method} ${req.path}`)
    return res.status(403).json({
      message: 'CSRF token missing',
      code: 'CSRF_MISSING'
    })
  }

  if (!csrfTokens.has(token)) {
    console.log(`[CSRF] ❌ Invalid CSRF token for ${req.method} ${req.path}`)
    console.log(`[CSRF] Available tokens: ${Array.from(csrfTokens.keys()).map(t => t.substring(0, 8) + '...').join(', ')}`)
    return res.status(403).json({
      message: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    })
  }

  const tokenData = csrfTokens.get(token)

  // Check if token has expired (5 minutes)
  if (Date.now() - tokenData.createdAt > 5 * 60 * 1000) {
    csrfTokens.delete(token)
    console.log(`[CSRF] ❌ Token expired for ${req.method} ${req.path}`)
    return res.status(403).json({
      message: 'CSRF token expired',
      code: 'CSRF_EXPIRED'
    })
  }

  // Don't delete token after use - allow multiple uses within expiration time

  console.log(`[CSRF] ✅ Token verified for ${req.method} ${req.path}`)
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
