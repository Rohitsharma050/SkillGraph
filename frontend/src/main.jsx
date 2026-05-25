import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './Context/AppContext.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
createRoot(document.getElementById('root')).render(


 
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
 <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
  <BrowserRouter>
  <StrictMode>
    <AppContextProvider>
    <App />
    </AppContextProvider>
  </StrictMode>
  
  </BrowserRouter>
  </GoogleOAuthProvider>
)
