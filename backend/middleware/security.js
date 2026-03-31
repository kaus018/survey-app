// Security logging middleware for tracking suspicious activities
export const securityLogger = (req, res, next) => {
  // Log failed authentications
  const originalJson = res.json

  res.json = function (data) {
    // Log 401/403 errors (authentication/authorization failures)
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn(`[SECURITY] ${res.statusCode} - ${req.method} ${req.path}`)
      console.warn(`[SECURITY] IP: ${req.ip}, User: ${req.userId || 'anonymous'}`)
    }

    // Log rate limit hits
    if (res.statusCode === 429) {
      console.warn(`[RATE_LIMIT] ${req.method} ${req.path} from IP: ${req.ip}`)
    }

    return originalJson.call(this, data)
  }

  next()
}

// Log validation errors and suspicious input
export const logSuspiciousInput = (pattern = null) => {
  return (req, res, next) => {
    const dbg = process.env.DEBUG_SECURITY === 'true'
    
    // Check for common attack patterns in user input
    const suspiciousPatterns = [
      /<script/gi,           // XSS attempt
      /union.*select/gi,     // SQL injection attempt
      /--/g,                 // SQL comment
      /;.*drop/gi,           // DROP command
      /javascript:/gi,       // JavaScript protocol
    ]

    const checkString = JSON.stringify(req.body || '') + JSON.stringify(req.query || '')

    for (const pat of suspiciousPatterns) {
      if (pat.test(checkString)) {
        console.warn(`[SUSPICIOUS] Potential attack pattern detected: ${pat}`)
        console.warn(`[SUSPICIOUS] IP: ${req.ip}, Path: ${req.path}`)
        if (dbg) console.warn(`[SUSPICIOUS] Payload: ${checkString.substring(0, 100)}`)
      }
    }

    next()
  }
}
