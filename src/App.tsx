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
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ContentLibrary from './pages/ContentLibrary'
import MusicPlayer from './pages/MusicPlayer'
import PremiumUpgrade from './pages/PremiumUpgrade'
import AccountPage from './pages/AccountPage'
import ArticleDetail from './pages/ArticleDetail'
import Onboarding from './pages/Onboarding'

import MainLayout from './components/MainLayout'

// ...

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Wrap everything in MainLayout
    children: [
      { index: true, element: <Home /> },
      { path: 'onboarding', element: <Onboarding /> },
      { path: 'library', element: <ContentLibrary /> },
      { path: 'library/play/:id', element: <MusicPlayer /> },
      { path: 'confessions', element: <Confessions /> },
      { path: 'confessions/new', element: <NewConfession /> },
      { path: 'confessions/:id', element: <ConfessionDetail /> },
      { path: 'chat', element: <Chat /> },
      { path: 'habits', element: <Habits /> },
      { path: 'admin', element: <Admin /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'articles/:id', element: <ArticleDetail /> },
      { path: 'premium', element: <PremiumUpgrade /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  {
    // Auth pages outside of MainLayout (optional, but usually cleaner)
    path: '/',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
