import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/pages/login'
import Register from './components/pages/register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App