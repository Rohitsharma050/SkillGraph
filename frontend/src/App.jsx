import { useState } from 'react'

import './App.css'
import { Navbar } from './Components/Navbar'
import LandingPage from './Pages/LandingPage'
import {Route,Routes} from 'react-router-dom'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import Dashboard from './Pages/Dashboard'
function App() {
  

  return (
    <>
      
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path ='/login' element={<LoginPage/>}/>
        <Route path ='/signup' element={<SignupPage/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
      
    </>
  )
}

export default App
