import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function CreateSurvey() {
  const navigate = useNavigate()
  const { token, user, apiClient } = useAuth()
  
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

    const normalizedQuestions = questions
      .map((question) => ({
        ...question,
        text: question.text.trim(),
        options: question.type === "choice"
          ? question.options.map((option) => option.trim()).filter(Boolean)
          : []
      }))
      .filter((question) => question.text)

    if (normalizedQuestions.length === 0) {
      setError("Добавьте хотя бы один корректный вопрос")
      return
    }

    const invalidChoiceQuestion = normalizedQuestions.find(
      (question) => question.type === "choice" && question.options.length < 2
    )

    if (invalidChoiceQuestion) {
      setError("У вопроса с выбором должно быть минимум два варианта ответа")
      return
    }

    try {
      setLoading(true)
      await apiClient.post("/surveys", {
        title,
        description,
        questions: normalizedQuestions
      })
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
    <main className="container create-survey-page">
      <section className="survey-section create-survey-section">
        <h2>Создать новый опрос</h2>
        <p className="create-survey-subtitle">
          Соберите форму так, как вам удобно: добавляйте вопросы, варианты ответов и рейтинг.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="create-survey-form">
          <div className="form-field">
            <label>Название опроса *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название опроса"
              required
            />
          </div>

          <div className="form-field">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание опроса (опционально)"
              rows="3"
            />
          </div>

          <div className="create-survey-toolbar">
            <h3>Вопросы</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="secondary-action-btn"
            >
              + Добавить вопрос
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <article key={qIndex} className="question-editor-card">
              <div className="question-editor-header">
                <h4>Вопрос {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="danger-text-btn"
                  >
                    Удалить
                  </button>
                )}
              </div>

              <div className="question-editor-grid">
                <div className="form-field question-editor-main">
                  <label>Текст вопроса *</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                    placeholder="Введите текст вопроса"
                    required
                  />
                </div>

                <div className="form-field">
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
              </div>

              {question.type === "choice" && (
                <div className="choice-options-block">
                  <label>Варианты ответов</label>
                  <div className="choice-options-list">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="choice-option-row">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Вариант ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="secondary-action-btn"
                  >
                    + Добавить вариант
                  </button>
                </div>
              )}

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(qIndex, "required", e.target.checked)}
                />
                Обязательный вопрос
              </label>
            </article>
          ))}

          <div className="create-survey-actions">
            <button
              type="button"
              onClick={addQuestion}
              className="secondary-action-btn"
            >
              + Добавить ещё вопрос
            </button>

            <button
              type="submit"
              disabled={loading}
              className="primary-action-btn"
            >
              {loading ? "Создание..." : "Создать опрос"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
