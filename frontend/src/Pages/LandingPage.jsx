import React from 'react'
import { HeroSection } from '../Components/HeroSection'
import ProblemSection from '../Components/ProblemSection'
import SolutionSection from '../Components/SolutionSection'
import CTASection from '../Components/CTASection'
import Footer from '../Components/Footer'
import { Navbar } from '../Components/Navbar'


const LandingPage = () => {
  return (
    <>
    <Navbar/>
    <HeroSection/>
    <ProblemSection/>
    <SolutionSection/>
    <CTASection/>
    <Footer/>
    </>
  )
}

export default LandingPage