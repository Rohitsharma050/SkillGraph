import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const questions = [
  { 
    q: "How does the AI match my resume to job roles?", 
    a: "skillGraph extracts technical and soft skills from your uploaded PDF using an LLM. It then calculates a similarity score against your targeted job description, directly pinpointing matching attributes and critical skill gaps." 
  },
  { 
    q: "What is a DAG-based learning roadmap?", 
    a: "A Directed Acyclic Graph (DAG) organizes skills based on dependencies. It maps out your educational journey linearly, ensuring you unlock and learn essential foundational prerequisites before moving on to complex target technologies." 
  },
  { 
    q: "Can I manually add skills or override the AI parser?", 
    a: "Yes! If the AI scanner misses specific frameworks, you can customize your skill dashboard profile manually. Your generated DAG roadmap updates instantly to match your manual inputs." 
  },
  { 
    q: "Where does skillGraph source its learning resources?", 
    a: "We aggregate curated educational links, official open-source documentation, and structured tutorial tutorials from verified open APIs and community repositories tailored to each specific skill node." 
  },
];

const Support = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("AI Parsing");
  const [message, setMessage] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message received! Our team will review your ticket shortly.");
    setName(""); setEmail(""); setSubject("AI Parsing"); setMessage("");
  };

  return (
    <div className="bg-white min-h-screen py-15 px-6 md:pl-20">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.4 }} 
        className="flex items-center gap-2 py-10 text-[#aaa] hover:text-[#1a1a1a] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <Link to="/" className="text-sm">Back to Home</Link>
      </motion.div>

      <div className="max-w-5xl">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Help Center</h1>
        <h3 className="text-[#aaa] mt-2">How can we help you optimize your career path today?</h3>
        <div className="h-px w-full bg-[#e8e3dc] mt-6 mb-12" />

        <h2 className="text-xl font-medium text-[#1a1a1a] mb-6">Common Questions</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {questions.map((item, i) => {
            const isOpen = activeIndex === i;
            return (
              <div 
                key={i} 
                onClick={() => setActiveIndex(isOpen ? null : i)} 
                className="px-6 py-5 rounded-xl bg-[#faf7f2] border border-[#e8e3dc] cursor-pointer transition-all hover:border-[#1a1a1a]/30"
              >
                <div className="flex items-center justify-between text-[#1a1a1a]">
                  <span className="text-sm md:text-base font-medium">{item.q}</span>
                  <ChevronRight className={`h-5 w-5 transition-transform duration-300 flex-shrink-0 ml-2 ${isOpen ? "rotate-90 text-[#1a1a1a]" : "text-[#aaa]"}`} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }} 
                      transition={{ duration: 0.25, ease: "easeOut" }} 
                      className="overflow-hidden"
                    >
                      <div className="mt-4 text-sm text-[#888] leading-relaxed">{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="mt-24 grid md:grid-cols-[1fr_1.5fr] gap-12"
        >
          <div>
            <h2 className="text-3xl font-semibold text-[#1a1a1a]">Contact Support</h2>
            <p className="text-[#888] mt-4 leading-relaxed max-w-md">
              Encountering errors with resume parsing, broken dependency nodes, or track pipelines? File a support ticket below.
            </p>
            <div className="mt-8 p-6 rounded-xl border border-[#e8e3dc] bg-[#faf7f2] w-fit">
              <div className="flex items-center gap-3 text-[#aaa] text-sm mb-2"><span>EMAIL</span></div>
              <p className="text-[#1a1a1a] font-medium">support@skillgraph.ai</p>
            </div>
            <div className="mt-8 h-px w-full bg-[#e8e3dc] max-w-md" />
            <p className="text-sm text-[#aaa] mt-6">Typical response time: <span className="text-[#1a1a1a]">Within 24 hours</span></p>
          </div>

          <form onSubmit={onSubmitHandler}>
            <div className="p-8 rounded-2xl border border-[#e8e3dc] bg-[#faf7f2]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-[#888]">Name</label>
                  <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg bg-white border border-[#e8e3dc] px-4 py-3 text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition" />
                </div>
                <div>
                  <label className="text-sm text-[#888]">Email Address</label>
                  <input type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg bg-white border border-[#e8e3dc] px-4 py-3 text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition" />
                </div>
              </div>
              <div className="mt-6">
                <label className="text-sm text-[#888]">Subject Topic</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full rounded-lg bg-white border border-[#e8e3dc] px-4 py-3 text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition">
                  <option value="AI Parsing">AI Resume Parsing Error</option>
                  <option value="Graph Nodes">Graph Dependency / Roadmap Bug</option>
                  <option value="Job Tracker">Application Tracker Pipe Error</option>
                  <option value="Feature Request">Feature Request / Feedback</option>
                </select>
              </div>
              <div className="mt-6">
                <label className="text-sm text-[#888]">Message Details</label>
                <textarea rows={6} required placeholder="Detail the steps to reproduce the issue..." value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full rounded-lg bg-white border border-[#e8e3dc] px-4 py-3 text-[#1a1a1a] outline-none resize-none focus:border-[#1a1a1a] transition" />
              </div>
              <button type="submit" className="mt-8 w-full rounded-xl py-4 bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition cursor-pointer">
                Send Support Ticket
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
