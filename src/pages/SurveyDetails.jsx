import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API_URL = "http://localhost:5001/api"

export default function SurveyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/surveys/${id}`)
        setSurvey(response.data.survey)
        setError("")
      } catch (err) {
        setError("Опрос не найден")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurvey()
  }, [id])

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert("Вы должны авторизоваться для ответа на опрос")
      navigate("/login")
      return
    }

    if (!user) {
      alert("Вы должны авторизоваться для ответа на опрос")
      navigate("/login")
      return
    }

    try {
      await axios.post(`${API_URL}/surveys/${id}/respond`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmitted(true)
      alert("✓ Спасибо за ваши ответы!")
      navigate("/surveys")
    } catch (err) {
      const message = err.response?.data?.message || "Ошибка при отправке ответов"
      alert(message)
      console.error(err)
    }
  }

  if (loading) {
    return <main className="container"><p>Загрузка опроса...</p></main>
  }

  if (!survey) {
    return <main className="container"><p>{error}</p></main>
  }

  return (
    <main className="container">
      <section className="survey-section">
        <h2>{survey.title}</h2>
        <p>{survey.description}</p>
        <small>Автор: {survey.author?.username}</small>

        {!survey.isActive && (
          <p style={{ color: "red" }}>⚠️ Этот опрос больше не активен</p>
        )}

        {submitted ? (
          <p style={{ color: "green" }}>✓ Спасибо за ваш ответ!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {survey.questions && survey.questions.map((q, qi) => (
              <article key={q._id || qi} className="card">
                <h3>{q.text}</h3>

                {q.type === "choice" && q.options ? (
                  <div>
                    {q.options.map((opt, oi) => (
                      <label key={oi} style={{ display: "block", marginBottom: "8px" }}>
                        <input
                          type="radio"
                          name={q._id || qi}
                          value={opt}
                          onChange={() => handleAnswer(q._id || qi, opt)}
                          required={q.required}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === "rating" ? (
                  <div style={{ display: "flex", gap: "5px" }}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleAnswer(q._id || qi, rating)}
                        style={{
                          padding: "10px 15px",
                          backgroundColor: answers[q._id || qi] === rating ? "#4CAF50" : "#ddd",
                          color: answers[q._id || qi] === rating ? "white" : "black",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Введите ваш ответ"
                    value={answers[q._id || qi] || ""}
                    onChange={(e) => handleAnswer(q._id || qi, e.target.value)}
                    required={q.required}
                    style={{ width: "100%", padding: "8px" }}
                  />
                )}
              </article>
            ))}

            <button 
              type="submit" 
              style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
              disabled={!survey.isActive}
            >
              Отправить ответы
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
