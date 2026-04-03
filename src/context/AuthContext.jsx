import { createContext, useContext, useState, useEffect, useRef } from "react"
import axios from "axios"
import { validateEmail, isInputSafe } from "../utils/security"

const AuthContext = createContext()

const API_URL = "http://localhost:5001/api"
const BACKEND_URL = "http://localhost:5001"

// Create axios instance for CSRF token initialization
const csrfClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true
})

// Interceptor to capture CSRF token from responses
csrfClient.interceptors.response.use(
  (response) => {
    const csrfToken = response.headers['x-csrf-token'] || response.data?.token
    if (csrfToken) {
      sessionStorage.setItem('csrfToken', csrfToken)
      console.log('✅ CSRF token received and saved')
    }
    return response
  },
  (error) => {
    console.error('Error getting CSRF token:', error)
    return Promise.reject(error)
  }
)

// Create axios instance with CSRF token handling
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Interceptor to add CSRF token to requests
apiClient.interceptors.request.use((config) => {
  const csrfToken = sessionStorage.getItem('csrfToken')
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  } else {
    console.warn('⚠️ CSRF token not found in session storage')
  }
  return config
})

// Interceptor to capture CSRF token from responses
apiClient.interceptors.response.use(
  (response) => {
    const csrfToken = response.headers['x-csrf-token'] || response.data?.token
    if (csrfToken) {
      sessionStorage.setItem('csrfToken', csrfToken)
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const csrfInitializedRef = useRef(false)

  // Загружаем токен при монтировании
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Устанавливаем заголовок авторизации для всех запросов
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`
    }

    // Initialize CSRF token
    if (!csrfInitializedRef.current) {
      csrfInitializedRef.current = true
      initializeCSRFToken()
    }
  }, [])

  // Function to initialize CSRF token
  const initializeCSRFToken = async () => {
    try {
      console.log('🔄 Initializing CSRF token...')
      // Make a GET request to the auth token endpoint to get CSRF token
      await csrfClient.get('/api/auth/token')
      console.log('✅ CSRF token initialization response received')
      
      // Double check it's in session storage
      const token = sessionStorage.getItem('csrfToken')
      if (token) {
        console.log(`✅ CSRF token stored: ${token.substring(0, 8)}...`)
      } else {
        console.warn('⚠️ CSRF token not found in sessionStorage after initialization')
      }
    } catch (error) {
      console.error('❌ Error initializing CSRF token:', error.message)
    }
  }

  const register = async (username, email, password, confirmPassword) => {
    try {
      // Validate input before sending
      if (!isInputSafe(username) || !isInputSafe(email) || !isInputSafe(password)) {
        throw new Error("Invalid characters in input")
      }

      if (!validateEmail(email)) {
        throw new Error("Invalid email format")
      }

      setLoading(true)
      setError(null)
      
      const response = await apiClient.post("/auth/register", {
        username,
        email,
        password,
        confirmPassword
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setToken(token)
      setUser(user)
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return { success: true, user }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Ошибка регистрации"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      // Validate input before sending
      if (!isInputSafe(username) || !isInputSafe(password)) {
        throw new Error("Invalid characters in input")
      }

      setLoading(true)
      setError(null)

      const response = await apiClient.post("/auth/login", {
        username,
        password
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setToken(token)
      setUser(user)
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return { success: true, user }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Ошибка входа"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("csrfToken")
    setToken(null)
    setUser(null)
    delete apiClient.defaults.headers.common["Authorization"]
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, error, register, login, logout, apiClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
