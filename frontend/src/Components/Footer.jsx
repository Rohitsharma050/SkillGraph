import React from "react";

const Footer = () => {
  return (
    <footer className="w-full  px-6 md:px-12 pt-20 pb-10">

      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-12 border-b border-black/10 pb-14">

          {/* Brand */}
          <div>

            <h1 className="text-3xl font-bold tracking-tight">
              SkillGraph
            </h1>

            <p className="mt-5 text-sm md:text-base text-gray-600 leading-relaxed max-w-sm">
              A graph-driven career optimization platform designed
              to help learners build smarter roadmaps, track growth,
              and unlock opportunities efficiently.
            </p>

          </div>

    
          {/* Resources */}
          <div className="px-20">

            <h2 className="text-lg font-semibold">
                COMPANY
            </h2>

            <div className="mt-5 flex flex-col gap-3 text-gray-600">

              <a href="#" className="hover:text-black transition">
                About Us
              </a>

              <a href="#" className="hover:text-black transition">
                Privacy Policy
              </a>

              <a href="#" className="hover:text-black transition">
                Terms & Services
              </a>

              <a href="#" className="hover:text-black transition">
                Contact
              </a>

            </div>

          </div>

          {/* CTA */}
          <div>

            <h2 className="text-lg font-semibold leading-snug">
              Start Building Smarter Career Paths
            </h2>

            <p className="mt-5 text-gray-600 text-sm leading-relaxed">
              Join SkillGraph and experience adaptive career
              progression powered by graph optimization.
            </p>

            <button
              className="
              mt-6
              bg-black
              text-white
              px-5
              py-3
              rounded-full
              font-medium
              hover:bg-gray-800
              transition-all
              duration-300
              "
            >
              Get Started
            </button>

          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">

          <p className="text-sm text-gray-500">
            © 2026 SkillGraph. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">

            <a href="#" className="hover:text-black transition">
              Linkdin
            </a>

            <a href="#" className="hover:text-black transition">
              Github
            </a>


          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;