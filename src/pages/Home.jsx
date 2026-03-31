import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

const slides = [
  { id: 1, image: "/images/1.jpg", title: "Online Survey Platform", subtitle: "Создавайте, проходите и анализируйте онлайн-опросы" },
  { id: 2, image: "/images/2.jpg", title: "Опрос студентов AITU", subtitle: "Узнайте мнение учащихся" },
  { id: 3, image: "/images/3.jpg", title: "Исследования аудитории", subtitle: "Сбор и анализ данных просто" }
]

export default function Home() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  // не используемся, но ножны для автопрокрутки

  return (
    <main className="container">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === current ? "active" : ""}`}
          >
            <img src={slide.image} alt={slide.title} />
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}

        <div className="slide-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      <div className="slideshow-button">
        <Link to="/surveys">
          <button>Посмотреть опросы</button>
        </Link>
      </div>

      <h2>Возможности платформы:</h2>
      <ul>
        <li>Просмотр списка опросов</li>
        <li>Прохождение опросов</li>
        <li>Сохранение результатов в браузере</li>
        <li>Регистрация и вход для отслеживания прогресса</li>
        <li>Фильтрация и сортировка опросов</li>
      </ul>

    </main>
  )
}
