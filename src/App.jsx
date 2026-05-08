import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import MyShorts from './pages/MyShorts'
import Channels from './pages/Channels'
import Explore from './pages/Explore'
import ChannelDetail from './pages/ChannelDetail'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/myshorts" replace />} />
        <Route path="myshorts" element={<MyShorts />} />
        <Route path="channels" element={<Channels />} />
        <Route path="channels/:id" element={<ChannelDetail />} />
        <Route path="explore" element={<Explore />} />
      </Route>
    </Routes>
  )
}
