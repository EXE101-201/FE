import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme, App as AntdApp } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          components: {
            Menu: {
              darkItemSelectedBg: "transparent",
            }
          },
        }}
      >
        <AntdApp>
          <App /></AntdApp>
      </ConfigProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
