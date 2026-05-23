import React from "react";

const ProblemSection = () => {
  return (
    <section className="w-full bg-white text-black py-40 px-6 md:px-2">

      {/* Heading Section */}
      <div className="max-w-5xl mx-12">

        <h1 className="text-3xl md:text-3xl font-bold leading-tight tracking-tight max-w-4xl">
          The Career Learning Problems
          
        </h1>

        <p className="mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
          Students today have unlimited access to courses, tutorials, <br />
          and roadmaps. Yet most learners still struggle to answer one
          critical question:
        </p>

        <p className="mt-4 text-xl md:text-2xl font-semibold">
          “What should I learn next?”
        </p>

       
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition duration-300">
          
          <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-sm font-semibold">
            01
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Unstructured Learning Paths
          </h2>

          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Most career roadmaps are flat lists of technologies without
            dependency awareness. Learners often study advanced concepts
            before mastering foundations.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-black text-white rounded-2xl p-6 hover:shadow-md transition duration-300">

          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-sm font-semibold">
            02
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Generic AI Recommendations
          </h2>

          <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
            AI-generated recommendations often lack explainability.
            Users don’t understand why a skill matters or what it unlocks.
          </p>
        </div>

        {/* Card 3 */}
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition duration-300">

          <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-sm font-semibold">
            03
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Time Constraints
          </h2>

          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Students must optimize learning under limited time and
            cognitive constraints, but most systems fail to prioritize
            high-impact skills efficiently.
          </p>
        </div>

     
{/* Card 4 */}
<div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition duration-300 md:col-span-2 lg:col-span-3">

  <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-sm font-semibold">
    04
  </div>

  <h2 className="mt-5 text-xl font-semibold">
    Scattered Job Tracking
  </h2>

  <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-4xl">
    Students often manage internships and job applications across
    spreadsheets, emails, and multiple platforms, making it difficult
    to track progress, deadlines, interview stages, and career growth
    in one organized system.
  </p>
</div>

      </div>

    

    </section>
  );
};

export default ProblemSection;