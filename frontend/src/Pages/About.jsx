import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
  <div className="bg-white min-h-screen py-15 px-6 md:pl-20">

      <div className="max-w-5xl">

        {/* Back Button */}
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 py-10 text-zinc-400 hover:text-zinc-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />

          <Link to="/" className="text-sm">
            Back to Home
          </Link>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          About SkillGraph
        </h1>

        <p className="text-zinc-400 mt-3">
          Last Updated: March 2026
        </p>

        <div className="h-px w-full bg-zinc-200 mt-10 mb-14" />

        {/* Sections */}
        {[
          {
            title: "1. What is SkillGraph",
            content:
              "SkillGraph is an adaptive career progression platform designed to help learners build structured and efficient learning paths for modern technology careers. Instead of showing random tutorials or flat skill checklists, SkillGraph analyzes prerequisite relationships between skills and generates personalized roadmaps based on a learner’s current knowledge, target role, time availability, and learning capacity."
          },

          {
            title: "2. The Problem SkillGraph Solves",
            content:
              "Modern learners have access to thousands of courses, videos, and online resources, but most people still struggle with one fundamental question — what should I learn next? Existing platforms usually provide unordered roadmaps, generic AI suggestions, or static checklists without understanding dependencies between concepts. As a result, learners often study advanced topics before mastering fundamentals, waste time on low-impact technologies, and feel overwhelmed by the learning process."
          },

          {
            title: "3. How SkillGraph Works",
            content:
              "SkillGraph models career learning as a dependency-aware skill graph. Every skill is represented as a node, and prerequisite relationships are represented as directed connections between them. The platform then applies graph algorithms, optimization strategies, and personalized weighting systems to compute the most efficient learning path for each user."
          },

          {
            title: "4. Personalized Learning Roadmaps",
            content:
              "Every learner starts with different strengths and weaknesses. SkillGraph adapts roadmap recommendations based on existing mastery levels, completed skills, study availability, and target career roles. Two users targeting the same role may receive completely different learning sequences because the system dynamically adjusts learning difficulty and optimization cost according to user readiness."
          },

          {
            title: "5. Explainable Recommendations",
            content:
              "Unlike black-box recommendation systems, SkillGraph provides explainable recommendations. The platform clearly explains why a skill is being recommended, what future technologies it unlocks, how it contributes to role readiness, and why it should be prioritized at the current stage of learning."
          },

          {
            title: "6. Skill Dependency Graph",
            content:
              "The core of SkillGraph is a weighted Directed Acyclic Graph (DAG). This graph structure ensures that learning paths follow valid prerequisite order. For example, the system understands that JavaScript should typically be learned before React, or that Operating Systems knowledge is important before advanced System Design topics."
          },

          {
            title: "7. Adaptive Optimization Engine",
            content:
              "SkillGraph uses optimization algorithms to recommend the most efficient learning sequence under realistic constraints such as limited study time, difficulty tolerance, and learning fatigue. The system continuously recalculates the next best skill based on progress updates and mastery changes."
          },

          {
            title: "8. Skill Decay and Retention Tracking",
            content:
              "Learning is not permanent. Over time, unused skills become weaker. SkillGraph includes a retention and decay model that estimates how much a learner remembers over time. The platform can identify forgotten concepts and recommend timely revisions before those skills become major learning bottlenecks."
          },

          {
            title: "9. Career Readiness Scoring",
            content:
              "SkillGraph continuously estimates a user’s readiness for specific career roles such as Frontend Developer, Backend Developer, Full Stack Engineer, or Data Analyst. Readiness scores are calculated using completed skills, mastery levels, prerequisite coverage, and retention strength."
          },

          {
            title: "10. Job Application Tracking",
            content:
              "The platform also includes a lightweight job and internship application tracker. Learners can organize applications, interview stages, and opportunities in one place while simultaneously improving their technical roadmap."
          },

          {
            title: "11. Research and Algorithmic Foundation",
            content:
              "SkillGraph is not just a learning platform — it is also a research-oriented optimization system. The platform combines graph theory, topological sorting, weighted shortest path algorithms, dynamic programming, bottleneck analysis, and temporal decay modeling to create adaptive and explainable career progression strategies."
          },

         

          {
            title: "12. Who SkillGraph Is For",
            content:
              "SkillGraph is designed for students, self-taught developers, career switchers, and early-career professionals who want structured guidance for technical growth. It is especially useful for learners who feel overwhelmed by the number of available technologies and learning resources."
          },

          {
            title: "13. Our Vision",
            content:
              "We believe learning should be structured, explainable, and optimized — not random or overwhelming. SkillGraph aims to become an intelligent career navigation system that helps learners make better decisions, reduce confusion, and progress with clarity and confidence."
          },

        ].map((section, i) => (

          <div key={i} className="mb-14">

            <h2 className="text-2xl font-semibold text-zinc-900 mb-5">
              {section.title}
            </h2>

            <p className="text-zinc-500 leading-[1.9] text-[15px] md:text-base">
              {section.content}
            </p>

          </div>

        ))}

        {/* Contact */}
        <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
          14. Contact
        </h2>

        <p className="text-zinc-500 leading-relaxed">
          Have questions, suggestions, or feedback regarding SkillGraph?
          We would love to hear from you.
        </p>

        <div className="mt-8 inline-block rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5">

          <p className="text-[#1a1a1a] text-sm leading-relaxed">
            SkillGraph Support
            <br />

            <span className="text-zinc-400">
              support@skillgraph.dev
            </span>

          </p>

        </div>

      </div>

    </div>
  );
};

export default About;