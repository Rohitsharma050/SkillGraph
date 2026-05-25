import React, { useState } from "react";

const solutions = [
  {
    title: "How does SkillGraph+ create structured learning paths?",
    answer:
      "SkillGraph+ models skills as a dependency-aware Directed Acyclic Graph (DAG), ensuring learners follow a valid prerequisite order instead of random technology lists.",
  },

  {
    title: "Why are SkillGraph+ recommendations explainable?",
    answer:
      "Every recommendation is generated using deterministic graph algorithms, allowing the system to explain why a skill matters and what it unlocks.",
  },

  {
    title: "How does the platform optimize learning under limited time?",
    answer:
      "The platform uses weighted path optimization and multi-dimensional knapsack-based planning to maximize readiness within realistic weekly study limits.",
  },

  {
    title: "How does SkillGraph+ simplify job tracking?",
    answer:
      "The platform centralizes internship applications, interview stages, deadlines, and learning progress into a single organized workflow.",
  },
];

const SolutionSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="features" className="w-full py-20 px-6 md:px-12">

      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="max-w-4xl">

          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500">
            Solutions
          </p>

          <h1 className="mt-4 text-3xl md:text-3xl font-bold leading-tight text-black">
            What Problems Does SkillGraph Solve and How?
          </h1>

          <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
            SkillGraph+ combines graph theory, adaptive optimization,
            and explainable analytics to solve modern career learning
            challenges.
          </p>

        </div>

        {/* Accordion */}
        <div className="mt-14 flex flex-col gap-5">

          {solutions.map((item, index) => (

            <div
              key={index}
              className="bg-white border border-[#ddd4c8] rounded-3xl px-6 md:px-8 py-6 shadow-sm transition-all duration-300"
            >

              {/* Top */}
              <div
                onClick={() => toggleAccordion(index)}
                className="flex items-center justify-between gap-6 cursor-pointer"
              >

                <h2 className="text-lg md:text-xl font-semibold text-black leading-snug">
                  {item.title}
                </h2>

                <button
                  className="min-w-[45px] h-[45px] rounded-xl border border-[#ddd4c8] flex items-center justify-center text-2xl font-light hover:bg-black hover:text-white transition-all duration-300"
                >
                  {openIndex === index ? "−" : "+"}
                </button>

              </div>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-40 opacity-100 mt-5"
                    : "max-h-0 opacity-0"
                }`}
              >

                <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-4xl">
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