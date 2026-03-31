import { Link } from "react-router-dom"

export default function SurveyCard({ survey }) {
  return (
    <article className="card">
      {survey.img && <img src={survey.img} alt={survey.title} style={{ width: "100%", borderRadius: "10px" }} />}
      <h3>{survey.title}</h3>
      <p>{survey.description}</p>
      <small>Автор: {survey.author?.username}</small>
      <Link to={`/surveys/${survey._id}`}>
        <button>Пройти опрос</button>
      </Link>
    </article>
  )
}
