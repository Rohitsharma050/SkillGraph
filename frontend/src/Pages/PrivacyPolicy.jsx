import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="bg-white min-h-screen py-15 px-6 md:pl-20">
      <div className="max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4 }} 
          className="flex items-center gap-2 py-10 text-[#aaa] hover:text-[#1a1a1a] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <Link to="/" className="text-sm">Back to Home</Link>
        </motion.div>

        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Privacy Policy</h1>
        <p className="text-[#aaa] mt-3">Last Updated: May 2026</p>
        <div className="h-px w-full bg-[#e8e3dc] mt-10 mb-14" />

        {[
          { 
            title: "1. Introduction", 
            content: 'skillGraph ("we", "us", or "our") values your privacy. This Privacy Policy explains how we collect, use, process, and protect your information when you use our DAG-based Career Path Advisor and Job Application Tracker. By uploading data or using skillGraph, you agree to these terms.' 
          },
          { 
            title: "2. Collection of Information", 
            content: "We collect information necessary to analyze career paths and track job pipelines:", 
            list: [
              "Professional Profile Data: Names, emails, and account credentials.",
              "Resume & Professional Data: Skills, employment history, and education extracted via AI text analysis.",
              "Application Tracking Data: Job roles, target companies, interview stages, and deadlines added to your dashboard.",
              "Usage Data: Technical device data, telemetry, and interactions with learning nodes."
            ] 
          },
          { 
            title: "3. Use of Your Information", 
            content: "Your data strictly powers our career intelligence engine to:", 
            list: [
              "Extract and map individual skill profiles using artificial intelligence models.",
              "Execute similarity matching between your professional profile and target job descriptions.",
              "Compute custom Directed Acyclic Graphs (DAGs) for sequential learning roadmaps.",
              "Manage, schedule, and send notifications for individual job application funnels.",
              "Serve customized educational resource suggestions aligned with your identified skill gaps."
            ] 
          },
          { 
            title: "4. Disclosure of Your Information", 
            content: "We protect user assets and do not sell, rent, or trade your professional or resume data. Sharing events are isolated to:", 
            list: [
              "Compliance operations fulfilling legal mandates or judicial decrees.",
              "Secure third-party API processors handling cloud infrastructure or AI inference models.",
              "Platform security operations mitigating active infrastructure vulnerabilities."
            ] 
          },
          { 
            title: "5. Security of Your Information", 
            content: "We deploy standard encryption protocols to protect resume uploads and database contents. Please note that data transmission networks are never immune to absolute vulnerability risks." 
          },
          { 
            title: "6. Data Retention & Control", 
            content: "Users maintain complete ownership over their data footprints. You can instantly clear your parsed skill profiles, delete uploaded resumes, or wipe out historical application tracker tables through your account controls." 
          },
        ].map((section, i) => (
          <div key={i} className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">{section.title}</h2>
            <p className="text-[#888] leading-relaxed">{section.content}</p>
            {section.list && (
              <ul className="text-[#888] leading-relaxed space-y-3 mt-4 list-disc pl-6">
                {section.list.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}

        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">7. Contact Us</h2>
        <p className="text-[#888] leading-relaxed">For inquiries regarding your personal skill profiles or platform data deletion requests, contact us at:</p>
        <div className="mt-8 inline-block rounded-xl border border-[#e8e3dc] bg-[#faf7f2] px-6 py-4">
          <p className="text-[#1a1a1a] text-sm leading-relaxed">
            skillGraph Support<br />
            <span className="text-[#aaa]">support@skillgraph.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
