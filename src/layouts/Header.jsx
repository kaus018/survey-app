import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="header">
      <h2>Survey Platform</h2>
      <nav>
        <Link to="/">Главная</Link>
        <Link to="/surveys">Опросы</Link>
        <Link to="/about">О нас</Link>
        {user ? (
          <>
            <Link to="/create-survey">+ Создать опрос</Link>
            <Link to="/profile">Профиль ({user.username})</Link>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  )
}
