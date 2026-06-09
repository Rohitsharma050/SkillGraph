import React from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";

const CTASection = () => {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="w-full bg-zinc-50 border-t border-zinc-100 py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-2xl px-8 md:px-16 py-16 md:py-20">

          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-5">
              SkillGraph
            </p>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white">
              Build your roadmap<br />with clarity.
            </h2>

            <p className="mt-5 text-base text-zinc-400 leading-relaxed max-w-lg">
              Stop guessing what to learn next. Get a dependency-aware roadmap built from your resume — for free.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => { token ? navigate('/dashboard') : navigate('/signup') }}
                className="bg-white text-zinc-900 text-sm font-semibold px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors duration-200"
              >
                Start Now
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border border-zinc-700 text-zinc-300 text-sm font-semibold px-6 py-3 rounded-lg hover:border-zinc-500 hover:text-white transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;