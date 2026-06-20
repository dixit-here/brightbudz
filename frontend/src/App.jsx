import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Quiz from "./pages/Quiz"
import Practice from "./pages/Practice"
import Result from "./pages/Result"
import Layout from "./components/Layout"

import Login from "./pages/Login"
import Signup from "./pages/Signup";
import AddQuestions from "./pages/AddQuestions";
import AddQuestionAlpha from "./pages/AddQuestionAlpha";


function App() {
  return (
    <Layout>
      <Routes>
        {/* Landing page — Home */}
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App pages */}
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/add-questions" element={<AddQuestions />} />
        <Route path="/add-question-alpha" element={<AddQuestionAlpha />} />
      </Routes>
    </Layout>
  )
}

export default App