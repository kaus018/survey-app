import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { validateEmail, isInputSafe } from "../utils/security"

export default function Register() {
  const [username , setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { register, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Введите имя пользователя")
      return
    }

    // Check for safe input
    if (!isInputSafe(username) || !isInputSafe(email) || !isInputSafe(password)) {
      setError("Обнаружены недопустимые символы. Пожалуйста, проверьте ввод")
      return
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email")
      return
    }

    // Strengthen password requirement
    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов")
      return
    }

    // Check for uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
    if (!passwordRegex.test(password)) {
      setError("Пароль должен содержать: прописные и строчные буквы, цифры и спецсимволы (@$!%*?&)")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    const result = await register(username, email, password, confirmPassword)
    
    if (result.success) {
      alert(`✓ Регистрация успешна!\n\nДобро пожаловать, ${result.user.username}!`)
      setUsername("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      navigate("/")
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="container">
      <section className="auth-section">
        <h2>Регистрация</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            value={username}
            required
            disabled={loading}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            disabled={loading}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль (мин. 8 символов, буквы, цифры, спецсимволы)"
            value={password}
            required
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            required
            disabled={loading}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>{loading ? "Загрузка..." : "Зарегистрироваться"}</button>
        </form>
      </section>
    </main>
  )
}