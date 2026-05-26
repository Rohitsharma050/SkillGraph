import React from "react";
import DashboardNavbar from "../Components/DashboardNavbar";

const Dashboard = () => {
  return (
    <>
      <DashboardNavbar />

      <section className="min-h-[calc(100vh-80px)]  px-6 md:px-10 py-10">

        <div
          className="
          max-w-7xl
          mx-auto
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-12
          items-center
          "
        >

          {/* LEFT */}
          <div>

            {/* Small Badge */}
            <div
              className="
              inline-block
              px-4
              py-2
              rounded-full
              border
              border-black/10
              bg-white
              text-sm
              font-medium
              "
            >
              Adaptive Career Intelligence
            </div>

            {/* Heading */}
            <h1
              className="
              mt-6
              text-4xl
              md:text-5xl
              font-bold
              leading-tight
              tracking-tight
              text-black
              "
            >
              Build Your Personalized
              <br />
              Career Roadmap
            </h1>

            {/* Paragraph */}
            <p
              className="
              mt-6
              text-gray-700
              leading-relaxed
              max-w-2xl
              text-[15px]
              md:text-base
              "
            >
              Upload your resume, select your target role and
              company, and let SkillGraph generate an
              optimized learning roadmap powered by graph
              algorithms, dependency analysis, and adaptive
              skill planning.
            </p>

            {/* FORM CARD */}
            <div
              className="
              mt-10
              bg-white
              rounded-[28px]
              border
              border-black/10
              p-7
              shadow-sm
              "
            >

              <h2 className="text-xl font-semibold text-black">
                Start Your Journey
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Generate a roadmap tailored to your goals.
              </p>

              {/* Upload Resume */}
              <div className="mt-6">

                <label className="text-sm font-medium text-black">
                  Upload Resume
                </label>

                <input
                  type="file"
                  className="
                  mt-2
                  w-full
                  border
                  border-black/10
                  rounded-2xl
                  px-4
                  py-3
                  bg-[#faf7f2]
                  text-sm
                  "
                />

              </div>

              {/* Target Role */}
              <div className="mt-5">

                <label className="text-sm font-medium text-black">
                  Target Role
                </label>

                <select
                  className="
                  mt-2
                  w-full
                  border
                  border-black/10
                  rounded-2xl
                  px-4
                  py-3
                  bg-[#faf7f2]
                  outline-none
                  text-sm
                  "
                >

                  <option>Select Target Role</option>

                  <option>Frontend Developer</option>

                  <option>Backend Developer</option>

                  <option>Full Stack Developer</option>

                  <option>Data Analyst</option>

                  <option>System Design Engineer</option>

                </select>

              </div>

              {/* Target Company */}
              <div className="mt-5">

                <label className="text-sm font-medium text-black">
                  Dream Company
                </label>

                <input
                  type="text"
                  placeholder="Google, Amazon, Microsoft..."
                  className="
                  mt-2
                  w-full
                  border
                  border-black/10
                  rounded-2xl
                  px-4
                  py-3
                  bg-[#faf7f2]
                  outline-none
                  text-sm
                  "
                />

              </div>

              {/* Generate Button */}
              <button
                className="
                mt-7
                w-full
                bg-black
                text-white
                py-3.5
                rounded-2xl
                font-semibold
                hover:bg-gray-800
                transition-all
                duration-300
                "
              >
                Generate Smart Roadmap
              </button>

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex justify-center">

            <div
              className="
              relative
              w-full
              max-w-[560px]
              h-[620px]
              rounded-[40px]
              overflow-hidden
              border
              border-black/10
              bg-black
              "
            >

              {/* Image */}
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                alt="SkillGraph Dashboard"
                className="
                w-full
                h-full
                object-cover
                opacity-80
                "
              />

              {/* Overlay */}
              <div
                className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/80
                via-black/20
                to-transparent
                "
              />

              {/* Floating Content */}
              <div className="absolute bottom-8 left-8 right-8">

                <div
                  className="
                  bg-white/10
                  backdrop-blur-md
                  border
                  border-white/10
                  rounded-3xl
                  p-6
                  "
                >

                  <p className="text-sm text-gray-300">
                    AI-Assisted • Graph Optimized
                  </p>

                  <h2
                    className="
                    mt-3
                    text-3xl
                    font-bold
                    leading-tight
                    text-white
                    "
                  >
                    Learn Smarter,
                    <br />
                    Not Randomly.
                  </h2>

                  <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                    SkillGraph creates structured and
                    explainable learning paths using
                    graph theory, dependency analysis,
                    and adaptive optimization.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default Dashboard;