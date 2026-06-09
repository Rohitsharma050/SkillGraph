import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-zinc-100 px-6 md:px-10 pt-16 pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-zinc-100">

          {/* Brand */}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              SkillGraph
            </h2>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed max-w-xs">
              A graph-driven platform for structured career learning — built on dependency analysis, skill gap detection, and adaptive roadmaps.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-5">
              Company
            </h3>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <Link to="/about" className="hover:text-zinc-900 transition-colors duration-200">About</Link>
              <Link to="/guide" className="hover:text-zinc-900 transition-colors duration-200">Guide</Link>
              <Link to="/support" className="hover:text-zinc-900 transition-colors duration-200">Support</Link>
              <Link to="/policy" className="hover:text-zinc-900 transition-colors duration-200">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-zinc-900 transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-5">
              Product
            </h3>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <Link to="/dashboard" className="hover:text-zinc-900 transition-colors duration-200">Skill Roadmap</Link>
              <Link to="/jobtracker/dashboard" className="hover:text-zinc-900 transition-colors duration-200">Job Tracker</Link>
              <Link to="/signup" className="hover:text-zinc-900 transition-colors duration-200">Get Started — Free</Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-zinc-400">
            © 2026 SkillGraph. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-zinc-700 transition-colors duration-200">
              LinkedIn
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-700 transition-colors duration-200">
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;