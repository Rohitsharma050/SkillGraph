import { useState } from 'react'

import './App.css'
import { Navbar } from './Components/Navbar'
import LandingPage from './Pages/LandingPage'
import {Route,Routes} from 'react-router-dom'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import Dashboard from './Pages/Dashboard'
import About from './Pages/About'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfService from './Pages/TermsOfServices'
import Support from './Pages/Support'
import Steps from './Pages/Steps'
function App() {
  

  return (
    <>
      
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path ='/login' element={<LoginPage/>}/>
        <Route path ='/signup' element={<SignupPage/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/policy' element = {<PrivacyPolicy/>}/>
        <Route path='/terms' element = {<TermsOfService/>}/>
        <Route path='/support' element = {<Support/>}/>
        <Route path='/guide' element = {<Steps/>}/>
      </Routes>
      
    </>
  )
}

export default App
