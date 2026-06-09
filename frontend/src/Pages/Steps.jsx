import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Steps = () => {
  return (
    <section className="bg-white min-h-screen py-15 px-6 md:px-20">
      <div className="max-w-7xl mx-auto mb-24">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 py-10 text-zinc-400 hover:text-zinc-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <Link to="/" className="text-sm">Back to Home</Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm tracking-widest text-[#888] font-semibold mb-4 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
          HOW IT WORKS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-extrabold text-zinc-900 leading-tight"
        >
          Accelerate your career path <br /> in three simple steps
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Core Steps Hierarchy */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-200"
        >
          {[
            { 
              num: "01", 
              title: "Upload & Parse Resume", 
              desc: "Drop your PDF resume into our AI analyzer. The engine extracts your core competencies, active technical frameworks, and professional history instantly." 
            },
            { 
              num: "02", 
              title: "Generate Your DAG Graph", 
              desc: "Input your target role. Our system analyzes the gap, maps prerequisites, and compiles a personalized, non-linear Directed Acyclic Graph learning tree.", 
              highlight: true 
            },
            { 
              num: "03", 
              title: "Track Application Funnels", 
              desc: "Settle into your central job board pipeline. Monitor tech stack matching percentages, upcoming deadlines, and interview stages contextually." 
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className={`px-10 py-24 ${step.highlight ? "bg-zinc-50 relative" : ""}`}
            >
              <div className="text-7xl font-light text-zinc-200 mb-10">{step.num}</div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">{step.title}</h3>
              {step.highlight && <div className="w-8 h-[2px] bg-zinc-900 mb-6" />}
              {!step.highlight && <div className="mb-4" />}
              <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tactical Strategy Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 border border-zinc-200 bg-zinc-50 rounded-2xl px-10 md:px-20 py-14"
        >
          <p className="text-xs tracking-widest text-zinc-400 mb-8 uppercase">
            Pro Tips for Career Graph Optimization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: "Follow Node Dependencies", desc: "Always clear baseline prerequisite nodes (e.g., Core JavaScript) before hacking advanced frameworks to maintain structural retention." },
              { title: "Tailor Matches Contextually", desc: "Execute target skill-gap runs for each specific job description to discover hidden role requirements." },
              { title: "Log Applications Fluidly", desc: "Move your job pipelines through Kanban columns right after status updates to automatically recalculate deadline milestones." },
              { title: "Review Curated Resources", desc: "Utilize the mapped code documentations and verified video channels pinned to your active skill nodes to accelerate learning." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Global Conversion CTA Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mt-20 px-6 md:px-20 mx-auto"
        >
          <div className="rounded-3xl bg-[#1a1a1a] p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Ready to map your engineering career?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard" className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition">
                Build Your Graph — Free
              </Link>
              <Link to="/about" className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                Explore More
              </Link>
            </div>
          </div>
          <div className="mb-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default Steps;
