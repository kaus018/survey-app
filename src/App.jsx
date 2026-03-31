import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home.jsx"
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import Profile from "./pages/Profile.jsx"
import SurveyList from "./pages/SurveyList.jsx"
import SurveyDetails from "./pages/SurveyDetails.jsx"
import CreateSurvey from "./pages/CreateSurvey.jsx"
import About from "./pages/About.jsx"
import NotFound from "./pages/NotFound.jsx"

import PrivateRoute from "./components/PrivateRoute.jsx"
import Header from "./layouts/Header.jsx"
import Footer from "./layouts/Footer.jsx"
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route path="/surveys" element={<SurveyList />} />
            <Route path="/surveys/:id" element={<SurveyDetails />} />
            <Route
              path="/create-survey"
              element={
                <PrivateRoute>
                  <CreateSurvey />
                </PrivateRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}
