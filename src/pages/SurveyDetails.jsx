import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const getQuestionId = (question, index) => String(question._id || index)
const formatDiscussionDate = (value) => new Date(value).toLocaleString("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
})

export default function SurveyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token, apiClient } = useAuth()

  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isActive: true,
    questions: []
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyLoadingId, setReplyLoadingId] = useState(null)

  const isAuthor = Boolean(user && survey?.author && (survey.author._id === user.id || survey.author === user.id))
  const discussionComments = [...(survey?.comments || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/surveys/${id}`)
        setSurvey(response.data.survey)
        setEditForm({
          title: response.data.survey.title,
          description: response.data.survey.description || "",
          isActive: response.data.survey.isActive,
          questions: response.data.survey.questions?.map((question) => ({
            _id: question._id,
            text: question.text || "",
            type: question.type || "choice",
            options: question.options?.length ? [...question.options] : [""],
            required: Boolean(question.required)
          })) || []
        })
        setError("")
      } catch {
        setError("Опрос не найден")
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [id, apiClient])

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isAuthor || !token) return

      try {
        setStatsLoading(true)
        const response = await apiClient.get(`/surveys/${id}/statistics`)
        setStats(response.data.statistics)
        setStatsError("")
      } catch (err) {
        setStatsError(err.response?.data?.message || "Не удалось загрузить статистику")
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStatistics()
  }, [id, isAuthor, token, apiClient, survey?._id])

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token || !user) {
      alert("Вы должны авторизоваться для ответа на опрос")
      navigate("/login")
      return
    }

    try {
      await apiClient.post(`/surveys/${id}/respond`, { answers })
      setSubmitted(true)
      alert("✓ Спасибо за ваши ответы!")
      navigate("/surveys")
    } catch (err) {
      const message = err.response?.data?.message || "Ошибка при отправке ответов"
      alert(message)
    }
  }

  const updateEditQuestion = (index, field, value) => {
    setEditForm((prev) => {
      const questions = [...prev.questions]
      questions[index] = { ...questions[index], [field]: value }
      return { ...prev, questions }
    })
  }

  const updateEditOption = (questionIndex, optionIndex, value) => {
    setEditForm((prev) => {
      const questions = [...prev.questions]
      const options = [...questions[questionIndex].options]
      options[optionIndex] = value
      questions[questionIndex] = { ...questions[questionIndex], options }
      return { ...prev, questions }
    })
  }

  const addEditQuestion = () => {
    setEditForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", type: "choice", options: ["", ""], required: true }
      ]
    }))
  }

  const removeEditQuestion = (index) => {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, questionIndex) => questionIndex !== index)
    }))
  }

  const addEditOption = (index) => {
    setEditForm((prev) => {
      const questions = [...prev.questions]
      questions[index] = {
        ...questions[index],
        options: [...questions[index].options, ""]
      }
      return { ...prev, questions }
    })
  }

  const handleSaveSurvey = async () => {
    const normalizedQuestions = editForm.questions
      .map((question) => ({
        _id: question._id,
        text: question.text.trim(),
        type: question.type,
        options: question.type === "choice"
          ? question.options.map((option) => option.trim()).filter(Boolean)
          : [],
        required: Boolean(question.required)
      }))
      .filter((question) => question.text)

    if (!editForm.title.trim()) {
      alert("Название опроса обязательно")
      return
    }

    if (normalizedQuestions.length === 0) {
      alert("Должен остаться хотя бы один вопрос")
      return
    }

    const invalidChoiceQuestion = normalizedQuestions.find(
      (question) => question.type === "choice" && question.options.length < 2
    )

    if (invalidChoiceQuestion) {
      alert("У вопроса с выбором должно быть минимум два варианта ответа")
      return
    }

    try {
      setSaveLoading(true)
      const response = await apiClient.put(`/surveys/${id}`, {
        title: editForm.title,
        description: editForm.description,
        isActive: editForm.isActive,
        questions: normalizedQuestions
      })
      setSurvey(response.data.survey)
      setIsEditing(false)
      alert("Опрос обновлён")
    } catch (err) {
      alert(err.response?.data?.message || "Не удалось обновить опрос")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteSurvey = async () => {
    const confirmed = window.confirm("Удалить этот опрос? Действие нельзя отменить.")
    if (!confirmed) return

    try {
      setDeleteLoading(true)
      await apiClient.delete(`/surveys/${id}`)
      alert("Опрос удалён")
      navigate("/surveys")
    } catch (err) {
      alert(err.response?.data?.message || "Не удалось удалить опрос")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!token || !user) {
      alert("Войдите в аккаунт, чтобы участвовать в обсуждении")
      navigate("/login")
      return
    }

    const text = commentText.trim()

    if (!text) {
      return
    }

    try {
      setCommentLoading(true)
      const response = await apiClient.post(`/surveys/${id}/comments`, { text })
      setSurvey((prev) => ({ ...prev, comments: response.data.comments }))
      setCommentText("")
    } catch (err) {
      alert(err.response?.data?.message || "Не удалось отправить комментарий")
    } finally {
      setCommentLoading(false)
    }
  }

  const handleAddReply = async (commentId) => {
    if (!token || !user) {
      alert("Войдите в аккаунт, чтобы отвечать в обсуждении")
      navigate("/login")
      return
    }

    const text = String(replyDrafts[commentId] || "").trim()

    if (!text) {
      return
    }

    try {
      setReplyLoadingId(commentId)
      const response = await apiClient.post(`/surveys/${id}/comments/${commentId}/replies`, { text })
      setSurvey((prev) => ({ ...prev, comments: response.data.comments }))
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }))
      setReplyingTo(null)
    } catch (err) {
      alert(err.response?.data?.message || "Не удалось отправить ответ")
    } finally {
      setReplyLoadingId(null)
    }
  }

  if (loading) {
    return <main className="container"><p>Загрузка опроса...</p></main>
  }

  if (!survey) {
    return <main className="container"><p>{error}</p></main>
  }

  return (
    <main className="container survey-details-page">
      <section className="survey-section survey-details-section">
        {isEditing ? (
          <>
            <div className="survey-author-toolbar">
              <h2>Редактирование опроса</h2>
              <div className="survey-author-actions">
                <button type="button" className="secondary-action-btn" onClick={() => setIsEditing(false)}>
                  Отмена
                </button>
                <button type="button" className="primary-action-btn" onClick={handleSaveSurvey} disabled={saveLoading}>
                  {saveLoading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label>Название опроса</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Описание</label>
              <textarea
                rows="4"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Опрос активен
            </label>

            <div className="create-survey-toolbar">
              <h3>Вопросы</h3>
              <button type="button" className="secondary-action-btn" onClick={addEditQuestion}>
                + Добавить вопрос
              </button>
            </div>

            {editForm.questions.map((question, index) => (
              <article key={question._id || index} className="question-editor-card">
                <div className="question-editor-header">
                  <h4>Вопрос {index + 1}</h4>
                  {editForm.questions.length > 1 && (
                    <button type="button" className="danger-text-btn" onClick={() => removeEditQuestion(index)}>
                      Удалить
                    </button>
                  )}
                </div>

                <div className="question-editor-grid">
                  <div className="form-field question-editor-main">
                    <label>Текст вопроса</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateEditQuestion(index, "text", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Тип вопроса</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateEditQuestion(index, "type", e.target.value)}
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
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="choice-option-row">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateEditOption(index, optionIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <button type="button" className="secondary-action-btn" onClick={() => addEditOption(index)}>
                      + Добавить вариант
                    </button>
                  </div>
                )}

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateEditQuestion(index, "required", e.target.checked)}
                  />
                  Обязательный вопрос
                </label>
              </article>
            ))}
          </>
        ) : (
          <>
            <div className="survey-header-block">
              <div>
                <h2>{survey.title}</h2>
                <p>{survey.description}</p>
                <small>Автор: {survey.author?.username}</small>
              </div>

              {isAuthor && (
                <div className="survey-author-actions">
                  <button type="button" className="secondary-action-btn" onClick={() => setIsEditing(true)}>
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="danger-action-btn"
                    onClick={handleDeleteSurvey}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Удаление..." : "Удалить"}
                  </button>
                </div>
              )}
            </div>

            {!survey.isActive && (
              <p className="form-error">Этот опрос больше не активен</p>
            )}

            {isAuthor && (
              <section className="survey-stats-panel">
                <div className="create-survey-toolbar">
                  <h3>Статистика по вашему опросу</h3>
                </div>

                {statsLoading && <p>Загрузка статистики...</p>}
                {statsError && <p className="form-error">{statsError}</p>}

                {stats && (
                  <>
                    <div className="stats-summary-grid">
                      <div className="stat-item">
                        <div className="stat-number">{stats.totalResponses}</div>
                        <div className="stat-label">Всего ответов</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-number">{stats.questionStats?.length || 0}</div>
                        <div className="stat-label">Вопросов</div>
                      </div>
                    </div>

                    <div className="stats-question-list">
                      {stats.questionStats?.map((question) => (
                        <article key={question.questionId} className="stats-question-card">
                          <h4>{question.questionText}</h4>
                          <p className="stats-meta">
                            Тип: {question.questionType} | Ответов: {question.totalAnswers}
                          </p>

                          {question.questionType === "rating" && (
                            <p className="stats-best-answer">
                              Средняя оценка: <strong>{question.average}</strong>
                              {question.topAnswer && ` | Чаще всего: ${question.topAnswer.value} (${question.topAnswer.percent}%)`}
                            </p>
                          )}

                          {question.questionType !== "text" && (
                            <div className="stats-bars">
                              {question.options?.map((option) => (
                                <div key={option.value} className="stats-bar-row">
                                  <div className="stats-bar-label">
                                    <span>{option.value}</span>
                                    <span>{option.count} ({option.percent}%)</span>
                                  </div>
                                  <div className="stats-bar-track">
                                    <div className="stats-bar-fill" style={{ width: `${option.percent}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.questionType === "text" && (
                            <>
                              <p className="stats-best-answer">
                                Самый частый ответ: <strong>{question.topAnswer?.value || "Пока нет данных"}</strong>
                              </p>
                              <div className="text-answer-cloud">
                                {question.topResponses?.length ? (
                                  question.topResponses.map((response) => (
                                    <div key={response.value} className="text-answer-item">
                                      <span>{response.value}</span>
                                      <span>{response.count} ({response.percent}%)</span>
                                    </div>
                                  ))
                                ) : (
                                  <p>Текстовых ответов пока нет.</p>
                                )}
                              </div>
                            </>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="survey-answer-form">
                {survey.questions && survey.questions.map((question, index) => {
                  const questionId = getQuestionId(question, index)

                  return (
                    <article key={questionId} className="card">
                      <h3>{question.text}</h3>

                      {question.type === "choice" && question.options ? (
                        <div>
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} style={{ display: "block", marginBottom: "8px" }}>
                              <input
                                type="radio"
                                name={questionId}
                                value={option}
                                onChange={() => handleAnswer(questionId, option)}
                                required={question.required}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : question.type === "rating" ? (
                        <div className="rating-row">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => handleAnswer(questionId, rating)}
                              className={answers[questionId] === rating ? "rating-btn active" : "rating-btn"}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Введите ваш ответ"
                          value={answers[questionId] || ""}
                          onChange={(e) => handleAnswer(questionId, e.target.value)}
                          required={question.required}
                        />
                      )}
                    </article>
                  )
                })}

                <button type="submit" className="primary-action-btn" disabled={!survey.isActive}>
                  Отправить ответы
                </button>
              </form>
            ) : (
              <p style={{ color: "green" }}>Спасибо за ваш ответ!</p>
            )}

            <section className="discussion-panel">
              <div className="discussion-header">
                <div>
                  <h3>Обсуждение</h3>
                  <p className="discussion-subtitle">
                    Формат как в социальных сетях: делитесь мнением и отвечайте друг другу.
                  </p>
                </div>
                <div className="discussion-count">
                  {discussionComments.length} комментариев
                </div>
              </div>

              <form onSubmit={handleAddComment} className="discussion-composer">
                <textarea
                  rows="3"
                  placeholder="Напишите, что думаете об этом опросе..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="discussion-composer-actions">
                  <button type="submit" className="primary-action-btn" disabled={commentLoading}>
                    {commentLoading ? "Публикация..." : "Опубликовать"}
                  </button>
                </div>
              </form>

              <div className="discussion-feed">
                {discussionComments.length > 0 ? (
                  discussionComments.map((comment) => (
                    <article key={comment._id} className="thread-card">
                      <div className="thread-avatar">
                        {comment.user?.avatar ? (
                          <img
                            src={`http://localhost:5001${comment.user.avatar}`}
                            alt={comment.user?.username || "User"}
                          />
                        ) : (
                          <span>{(comment.user?.username || "U").charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="thread-body">
                        <div className="thread-meta">
                          <strong>{comment.user?.username || "Пользователь"}</strong>
                          <span>{formatDiscussionDate(comment.createdAt)}</span>
                        </div>

                        <p className="thread-text">{comment.text}</p>

                        <div className="thread-actions">
                          <button
                            type="button"
                            className="thread-reply-btn"
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          >
                            Ответить
                          </button>
                        </div>

                        {replyingTo === comment._id && (
                          <div className="thread-reply-editor">
                            <textarea
                              rows="2"
                              placeholder="Напишите ответ..."
                              value={replyDrafts[comment._id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({ ...prev, [comment._id]: e.target.value }))
                              }
                            />
                            <div className="discussion-composer-actions">
                              <button
                                type="button"
                                className="secondary-action-btn"
                                onClick={() => setReplyingTo(null)}
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                className="primary-action-btn"
                                onClick={() => handleAddReply(comment._id)}
                                disabled={replyLoadingId === comment._id}
                              >
                                {replyLoadingId === comment._id ? "Отправка..." : "Ответить"}
                              </button>
                            </div>
                          </div>
                        )}

                        {comment.replies?.length > 0 && (
                          <div className="thread-replies">
                            {[...comment.replies]
                              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                              .map((reply) => (
                                <div key={reply._id} className="thread-reply-item">
                                  <div className="thread-reply-avatar">
                                    {reply.user?.avatar ? (
                                      <img
                                        src={`http://localhost:5001${reply.user.avatar}`}
                                        alt={reply.user?.username || "User"}
                                      />
                                    ) : (
                                      <span>{(reply.user?.username || "U").charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="thread-reply-content">
                                    <div className="thread-meta">
                                      <strong>{reply.user?.username || "Пользователь"}</strong>
                                      <span>{formatDiscussionDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="thread-text">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="discussion-empty">
                    Пока обсуждения нет. Станьте первым участником разговора.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
