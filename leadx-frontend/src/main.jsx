import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '../src/context/AuthContext.jsx'
import { CustomizationProvider } from '../src/context/CustomizationContext.jsx'
import { ColorProvider } from '../src/context/ColorContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CustomizationProvider>
        <ColorProvider>
      <App />
      </ColorProvider>
      </CustomizationProvider>
    </AuthProvider>
  </StrictMode>,
)
