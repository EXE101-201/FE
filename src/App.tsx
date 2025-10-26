import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Confessions from './pages/Confessions'
import NewConfession from './pages/NewConfession'
import ConfessionDetail from './pages/ConfessionDetail'
import Chat from './pages/Chat'
import Habits from './pages/Habits'
import Admin from './pages/Admin'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import './App.css'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <Home /> },
      { path: 'confessions', element: <Confessions /> },
      { path: 'confessions/new', element: <NewConfession /> },
      { path: 'confessions/:id', element: <ConfessionDetail /> },
      { path: 'chat', element: <Chat /> },
      { path: 'habits', element: <Habits /> },
      { path: 'admin', element: <Admin /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
