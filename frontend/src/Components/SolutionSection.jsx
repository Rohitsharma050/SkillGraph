import React, { useState } from "react";

const solutions = [
  {
    title: "Resume-based skill extraction",
    answer:
      "SkillGraph parses your resume to identify your current technical strengths, active frameworks, and professional experience — so the system knows exactly where you stand before building anything.",
  },
  {
    title: "Role-based skill gap analysis",
    answer:
      "Select a target role and the platform maps the delta between your current skills and what the role requires. No guesswork — just a clear view of what's missing and by how much.",
  },
  {
    title: "DAG-based dependency-aware roadmap",
    answer:
      "Skills are modeled as nodes in a Directed Acyclic Graph. Prerequisites are enforced automatically, so you never encounter a concept before you have the foundation to understand it.",
  },
  {
    title: "Explainable learning order",
    answer:
      "Every recommendation includes a reason: what it unlocks, how it contributes to role readiness, and why it's the right next step at your current stage.",
  },
  {
    title: "Curated resources for every skill",
    answer:
      "Each skill node links to hand-verified resources — documentation, video courses, and practice problems — so you spend time learning, not searching.",
  },
  {
    title: "Progress tracking across skills",
    answer:
      "Mark skills as complete, track your readiness score per role, and see your learning graph evolve over time. Everything is persistent and tied to your profile.",
  },
];

const SolutionSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="features" className="w-full bg-white border-t border-zinc-100 py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">
            How SkillGraph solves it
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
            Structured answers to real problems.
          </h2>
          <p className="mt-4 text-base text-zinc-500 leading-relaxed">
            Graph theory, optimization, and explainable analytics — applied to career learning.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3 max-w-4xl">
          {solutions.map((item, i) => (
            <div
              key={i}
              className={`border rounded-xl transition-all duration-200 ${
                openIndex === i ? "border-zinc-300 bg-zinc-50" : "border-zinc-200 bg-white"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-zinc-400 tracking-widest shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm md:text-base font-semibold text-zinc-900 leading-snug">
                    {item.title}
                  </h3>
                </div>
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-md border text-zinc-500 text-sm shrink-0 transition-colors duration-200 ${
                    openIndex === i ? "border-zinc-300 bg-zinc-900 text-white" : "border-zinc-200"
                  }`}
                >
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-6 text-sm text-zinc-500 leading-relaxed ml-10">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SolutionSection;