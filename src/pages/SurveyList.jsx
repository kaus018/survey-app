import { useState, useEffect } from "react"
import SurveyCard from "../components/SurveyCard"
import axios from "axios"

const API_URL = "http://localhost:5001/api"

export default function SurveyList() {
  const [surveys, setSurveys] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/surveys`)
        setSurveys(response.data.surveys)
        setError("")
      } catch (err) {
        setError("Ошибка при загрузке опросов")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurveys()
  }, [])

  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return <main className="container"><p>Загрузка опросов...</p></main>
  }

  return (
    <main className="container surveys-page">
      <header className="surveys-header">
        <div>
          <h1>Доступные опросы</h1>
          <p className="surveys-subtitle">Найдите и пройдите интересующие вас опросы</p>
        </div>
        <div className="surveys-count">
          <span className="count-badge">{filtered.length}</span>
          <span className="count-label">опросов</span>
        </div>
      </header>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <section className="surveys-search">
        <input
          className="search-input"
          type="text"
          placeholder="Поиск опроса..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </section>

      {filtered.length > 0 ? (
        <section className="card-grid surveys-grid">
          {filtered.map(survey => (
            <SurveyCard key={survey._id} survey={survey} />
          ))}
        </section>
      ) : (
        <section className="no-surveys">
          <h3>Опросы не найдены</h3>
          <p>Попробуйте использовать другое ключевое слово</p>
        </section>
      )}
    </main>
  )
}
