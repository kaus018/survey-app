import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API_URL = "http://localhost:5001/api"

export default function CreateSurvey() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState([
    { text: "", type: "choice", options: [""], required: true }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!token || !user) {
      alert("Вы должны авторизоваться")
      navigate("/login")
      return
    }

    if (!title.trim()) {
      setError("Название опроса обязательно")
      return
    }

    try {
      setLoading(true)
      await axios.post(
        `${API_URL}/surveys`,
        { title, description, questions },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("✅ Опрос создан успешно!")
      navigate("/surveys")
    } catch (err) {
      const message = err.response?.data?.message || "Ошибка при создании опроса"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", type: "choice", options: [""], required: true }
    ])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push("")
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  return (
    <main className="container">
      <section className="survey-section">
        <h2>Создать новый опрос</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Название опроса *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название опроса"
              required
            />
          </div>

          <div>
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание опроса (опционально)"
              rows="3"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <h3>Вопросы</h3>

          {questions.map((question, qIndex) => (
            <article key={qIndex} className="card" style={{ marginBottom: "20px" }}>
              <div>
                <label>Текст вопроса *</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                  placeholder="Введите текст вопроса"
                  required
                />
              </div>

              <div>
                <label>Тип вопроса</label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                >
                  <option value="choice">Выбор ответа</option>
                  <option value="text">Текстовый ответ</option>
                  <option value="rating">Рейтинг (1-5)</option>
                </select>
              </div>

              {question.type === "choice" && (
                <div>
                  <label>Варианты ответов</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} style={{ marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Вариант ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    style={{ marginTop: "8px" }}
                  >
                    + Добавить вариант
                  </button>
                </div>
              )}

              <label>
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(qIndex, "required", e.target.checked)}
                />
                Обязательный вопрос
              </label>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  style={{ marginTop: "10px", backgroundColor: "#f44336", color: "white" }}
                >
                  Удалить вопрос
                </button>
              )}
            </article>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            style={{ marginBottom: "20px" }}
          >
            + Добавить вопрос
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            {loading ? "Создание..." : "Создать опрос"}
          </button>
        </form>
      </section>
    </main>
  )
}
