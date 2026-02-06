import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Confessions from './pages/Confessions'
import NewConfession from './pages/NewConfession'
import ConfessionDetail from './pages/ConfessionDetail'
import Chat from './pages/Chat'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
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
import PaymentPage from './pages/PaymentPage'

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
      { path: 'challenges', element: <Challenges /> },
      { path: 'challenges/:id/:type', element: <ChallengeDetail /> },
      { path: 'admin', element: <Admin /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'articles/:id', element: <ArticleDetail /> },
      { path: 'premium', element: <PremiumUpgrade /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'challenge', element: <ChallengeDetail /> },
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
