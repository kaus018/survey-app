import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:5001/api"

export default function Profile() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [votedSurveys, setVotedSurveys] = useState([])
  const [createdSurveys, setCreatedSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSurvey, setExpandedSurvey] = useState(null)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/surveys`)
        
        // Опросы которые пользователь создал
        const created = response.data.surveys.filter(s => 
          s.author._id === user.id || s.author === user.id
        )
        
        // Опросы на которые пользователь ответил
        const voted = response.data.surveys.filter(survey =>
          survey.responses.some(resp => {
            const respUserId = typeof resp.user === 'object' ? resp.user._id : resp.user
            return respUserId === user.id || respUserId.toString() === user.id || respUserId._id === user.id
          })
        )
        
        setCreatedSurveys(created)
        setVotedSurveys(voted)
      } catch (error) {
        // Ошибка при загрузке опросов
      } finally {
        setLoading(false)
      }
    }

    if (user && token) {
      fetchSurveys()
    }
  }, [user, token])

  // Получить ответы пользователя для конкретного опроса
  const getUserAnswers = (survey) => {
    const userResponse = survey.responses.find(resp => {
      const respUserId = typeof resp.user === 'object' ? resp.user._id : resp.user
      return respUserId === user.id || respUserId.toString() === user.id
    })
    return userResponse ? userResponse.answers : null
  }

  // Получить текст вопроса по ID
  const getQuestionText = (survey, questionId) => {
    const question = survey.questions.find(q => 
      (q._id && q._id.toString() === questionId.toString()) || 
      q._id === questionId
    )
    return question ? question.text : "Вопрос"
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (!user) {
    return (
      <main className="container">
        <section className="auth-section">
          <h2>Требуется авторизация</h2>
          <p>Пожалуйста, войдите в свой аккаунт</p>
          <button onClick={() => navigate("/login")}>Перейти к входу</button>
        </section>
      </main>
    )
  }

  return (
    <main className="container profile-main">
      <article className="profile-header">
        <img src="/images/Profile-PNG-File.png" alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h1>Никнейм: {user?.username || "Не заполнен"}</h1>
          <p>Электронная почта: {user?.email || "Не указана"}</p>
        </div>
      </article>

      <section className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">{createdSurveys.length}</div>
          <div className="stat-label">Созданных опросов</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{votedSurveys.length}</div>
          <div className="stat-label">Проголосовано опросов</div>
        </div>
      </section>

      {loading ? (
        <p>Загрузка опросов...</p>
      ) : (
        <>
          {createdSurveys.length > 0 && (
            <section className="profile-surveys">
              <h2>Ваши созданные опросы</h2>
              <ul className="surveys-list">
                {createdSurveys.map(survey => (
                  <li 
                    key={survey._id} 
                    className="survey-item"
                    onClick={() => navigate(`/surveys/${survey._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="survey-title">{survey.title}</span>
                    <span className="survey-badge">📝</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {votedSurveys.length > 0 && (
            <section className="profile-surveys">
              <h2>Ваши ответы на опросы</h2>
              <ul className="surveys-list">
                {votedSurveys.map(survey => {
                  const userAnswers = getUserAnswers(survey)
                  const isExpanded = expandedSurvey === survey._id
                  
                  return (
                    <li 
                      key={survey._id} 
                      className="survey-item"
                      style={{ borderLeft: '4px solid #4CAF50', paddingLeft: '10px' }}
                    >
                      <div 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedSurvey(isExpanded ? null : survey._id)}
                      >
                        <div style={{ flex: 1 }}>
                          <span className="survey-title">{survey.title}</span>
                          <span className="survey-badge">✓</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {isExpanded ? '▼' : '▶'} Ответы
                        </span>
                      </div>

                      {isExpanded && userAnswers && (
                        <div style={{ 
                          marginTop: '10px', 
                          paddingTop: '10px', 
                          borderTop: '1px solid #eee',
                          backgroundColor: '#f9f9f9',
                          padding: '10px',
                          borderRadius: '4px'
                        }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Ваши ответы:</p>
                          {Object.entries(userAnswers).map(([questionId, answer]) => (
                            <div key={questionId} style={{ marginBottom: '8px', fontSize: '13px' }}>
                              <strong>{getQuestionText(survey, questionId)}:</strong>
                              <div style={{ marginLeft: '10px', color: '#444' }}>
                                {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => navigate(`/surveys/${survey._id}`)}
                            style={{
                              marginTop: '10px',
                              padding: '6px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Открыть полный опрос →
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {createdSurveys.length === 0 && votedSurveys.length === 0 && (
            <p>У вас еще нет опросов.</p>
          )}
        </>
      )}

      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-btn">Выйти</button>
      </div>
    </main>
  )
}
