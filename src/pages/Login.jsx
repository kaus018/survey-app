import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { isInputSafe } from "../utils/security"

export default function Login() {
  const [password, setPassword] = useState("")
  const [username , setUsername] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login, loading } = useAuth()   

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    // Check for safe input
    if (!isInputSafe(username) || !isInputSafe(password)) {
      setError("Обнаружены недопустимые символы. Пожалуйста, проверьте ввод")
      return
    }

    const result = await login(username, password)
    if (result.success) {
      alert(`✓ Вход успешен!\n\nДобро пожаловать, ${result.user.username}!`)
      setUsername("")
      setPassword("")
      navigate("/")
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="container">
      <section className="auth-section">
        <h2>Вход</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username или Email"
            value={username}
            required 
            disabled={loading}
            onChange={e => setUsername(e.target.value)}
          />
          <input 
            type="password"
            placeholder="Пароль"
            value={password}
            required
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
          />
        <button type="submit" disabled={loading}>{loading ? "Загрузка..." : "Войти"}</button>
      </form>
      </section>
    </main>
  )
}
