import React from 'react'
import { HeroSection } from '../Components/HeroSection'
import ProblemSection from '../Components/ProblemSection'
import SolutionSection from '../Components/SolutionSection'
import CTASection from '../Components/CTASection'
import Footer from '../Components/Footer'
import { Navbar } from '../Components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../Context/AppContext'

/* ─── How It Works ──────────────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: 'Upload or describe your resume',
    body: 'Paste your resume or fill in your skills manually. The system extracts your current competencies and identifies your experience level.',
  },
  {
    num: '02',
    title: 'Select your target role',
    body: 'Choose from roles like Frontend Engineer, Backend Developer, or Data Analyst. SkillGraph pulls the skill requirements for that exact role.',
  },
  {
    num: '03',
    title: 'Generate your roadmap',
    body: 'The system runs a gap analysis and builds a dependency-ordered DAG roadmap — showing which skills to learn, in what order, and why.',
  },
  {
    num: '04',
    title: 'Learn, track, and apply',
    body: 'Follow curated resources for each skill, track your progress, and manage job applications — all from the same dashboard.',
  },
]

const HowItWorksSection = () => (
  <section className="w-full bg-white border-t border-zinc-100 py-24 px-6 md:px-10">
    <div className="max-w-7xl mx-auto">

      <div className="max-w-2xl mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">
          How it works
        </p>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
          Four steps from resume<br />to learning path.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="border border-zinc-200 rounded-xl p-6 bg-white hover:border-zinc-300 transition-colors duration-200">
            <span className="text-xs font-semibold tracking-widest text-zinc-400">{step.num}</span>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 leading-snug">{step.title}</h3>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
)

/* ─── Features ───────────────────────────────────────────────── */
const features = [
  {
    title: 'Adaptive Roadmap',
    body: 'Your roadmap updates as you complete skills. The system continuously recalculates the most efficient next step.',
  },
  {
    title: 'Skill Dependency Graph',
    body: 'Skills are connected as a DAG. Prerequisites are enforced — no more studying out of order.',
  },
  {
    title: 'Resource Discovery',
    body: 'Every skill node links to curated documentation, courses, and practice resources — no searching required.',
  },
  {
    title: 'Roadmap History',
    body: 'Your progress is saved across sessions. Come back anytime and pick up exactly where you left off.',
  },
  {
    title: 'Job Application Tracker',
    body: 'A Kanban-style board to track applications, interview stages, and deadlines — connected to your learning context.',
  },
  {
    title: 'Profile Personalization',
    body: 'Roadmaps adapt to your declared skills, mastery levels, and weekly study availability.',
  },
]

const FeaturesSection = () => (
  <section id="features-grid" className="w-full bg-zinc-50 border-t border-zinc-100 py-24 px-6 md:px-10">
    <div className="max-w-7xl mx-auto">

      <div className="max-w-2xl mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">
          Features
        </p>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
          Everything in one place.
        </h2>
        <p className="mt-4 text-base text-zinc-500 leading-relaxed">
          Tools designed to support every part of the career development process — from skill gaps to job offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center mb-4">
              <span className="text-xs font-bold text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">{f.title}</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
)

/* ─── Landing Page ────────────────────────────────────────────── */
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

export default LandingPage