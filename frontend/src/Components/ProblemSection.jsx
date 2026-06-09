import React from "react";

const problems = [
  {
    num: "01",
    title: "Unstructured Learning Paths",
    body: "Most roadmaps are flat lists of technologies without dependency awareness. Learners end up studying advanced topics before mastering the foundations they actually need.",
  },
  {
    num: "02",
    title: "Generic AI Recommendations",
    body: "AI-generated suggestions often lack explainability. Users don't understand why a skill is being recommended, what it unlocks, or where it fits in their actual learning sequence.",
    highlight: true,
  },
  {
    num: "03",
    title: "Job Tracking Disconnect",
    body: "Learning and job hunting happen in separate silos — spreadsheets, emails, Notion pages. Progress on skills and application pipelines are never connected.",
  },
];

const ProblemSection = () => {
  return (
    <section className="w-full bg-zinc-50 border-t border-zinc-100 py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">
            The Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
            Why most learners stall.
          </h2>
          <p className="mt-4 text-base text-zinc-500 leading-relaxed">
            Unlimited resources, but still stuck on the same question:{" "}
            <span className="text-zinc-800 font-medium">what should I learn next?</span>
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <div
              key={i}
              className={`rounded-xl p-7 border transition-shadow duration-200 hover:shadow-sm ${
                p.highlight
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <span
                className={`text-xs font-semibold tracking-widest ${
                  p.highlight ? "text-zinc-400" : "text-zinc-400"
                }`}
              >
                {p.num}
              </span>

              <h3
                className={`mt-4 text-lg font-semibold leading-snug ${
                  p.highlight ? "text-white" : "text-zinc-900"
                }`}
              >
                {p.title}
              </h3>

              <p
                className={`mt-3 text-sm leading-relaxed ${
                  p.highlight ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProblemSection;