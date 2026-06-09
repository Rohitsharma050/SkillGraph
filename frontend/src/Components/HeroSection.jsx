import React, { useContext } from 'react'
import { AppContext } from '../Context/AppContext'
import { useNavigate } from 'react-router-dom'

// Minimal inline mockup card — no external images
const RoadmapMockup = () => (
  <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 select-none">
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <div>
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Target Role</p>
        <p className="text-sm font-semibold text-zinc-900 mt-0.5">Frontend Engineer</p>
      </div>
      <div className="bg-zinc-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
        72% ready
      </div>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-5">
      <div className="bg-zinc-900 h-1.5 rounded-full" style={{ width: '72%' }} />
    </div>

    {/* Skill Nodes */}
    <div className="space-y-2.5">
      {[
        { label: 'HTML & CSS', done: true },
        { label: 'JavaScript Core', done: true },
        { label: 'React Fundamentals', done: true },
        { label: 'State Management', done: false },
        { label: 'TypeScript', done: false },
      ].map((skill, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              skill.done
                ? 'bg-zinc-900 border-zinc-900'
                : 'bg-white border-zinc-300'
            }`}
          >
            {skill.done && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={`text-sm ${skill.done ? 'text-zinc-400 line-through' : 'text-zinc-700 font-medium'}`}>
            {skill.label}
          </span>
          {!skill.done && i === 3 && (
            <span className="ml-auto text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">Next</span>
          )}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
      <p className="text-xs text-zinc-400">5 of 14 skills completed</p>
      <div className="flex -space-x-1">
        {['bg-zinc-900', 'bg-zinc-500', 'bg-zinc-300'].map((c, i) => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 border-white ${c}`} />
        ))}
      </div>
    </div>
  </div>
)

export const HeroSection = () => {
  const { token } = useContext(AppContext)
  const navigate = useNavigate()

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — Text */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-5">
            Skill-graph powered career intelligence
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900">
            Your career roadmap,<br />
            built from your resume.
          </h1>

          <p className="mt-6 text-base md:text-lg text-zinc-500 leading-relaxed max-w-lg">
            Upload your resume, pick a target role. SkillGraph analyzes your skill gaps, builds a dependency-aware learning path, and shows you exactly what to learn next — and why.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={() => { token ? navigate('/dashboard') : navigate('/login') }}
              className="bg-zinc-900 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
            >
              Get Your Roadmap
            </button>

            <button
              onClick={() => { token ? navigate('/jobtracker/dashboard') : navigate('/login') }}
              className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-6 py-3 rounded-lg hover:border-zinc-400 hover:text-zinc-900 transition-colors duration-200"
            >
              Track Job Applications
            </button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-zinc-400">
            Graph-based · Resume-aware · Dependency-ordered · Free to start
          </p>
        </div>

        {/* Right — Product Mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-zinc-50 rounded-3xl scale-105 -z-10" />
            <RoadmapMockup />
          </div>
        </div>

      </div>
    </section>
  )
}
