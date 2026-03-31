export default function NotFound() {
  return (
    <div className="container">
      <section className="not-found-section">
        <h1>404 - Страница не найдена</h1>
        <p>Извините, но запрашиваемая страница не существует.</p>
        <a href="/" className="btn btn-primary">Вернуться на главную</a>
      </section>
    </div>
  )
}