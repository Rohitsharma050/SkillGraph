import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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

        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Terms of Service</h1>
        <p className="text-[#aaa] mt-3">Last Updated: May 2026</p>
        <div className="h-px w-full bg-[#e8e3dc] mt-10 mb-14" />

        {[
          { 
            title: "1. Acceptance of Terms", 
            content: "By accessing or using skillGraph, you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this platform." 
          },
          { 
            title: "2. Description of Service", 
            content: "skillGraph provides an AI-powered Directed Acyclic Graph (DAG) career path advisor and job application tracking platform. Services include automated resume skill extraction, dynamic skill-gap analysis against target job requirements, personalized structural learning roadmaps, and pipeline logging tools. Features may change, shift, or be modified without prior notice." 
          },
          { 
            title: "3. User Data & AI Document Processing", 
            content: "You retain all structural ownership rights to the files, resumes, and data you submit to skillGraph. By uploading documents, you grant us a secure, localized license to process, parse, and analyze your text profile strictly for generating your application dashboards and learning trees." 
          },
          { 
            title: "4. Acceptable Use and Restrictions", 
            content: "To guarantee platform availability and analytical performance, you agree that you will not:", 
            list: [
              "Upload corrupted documents, malware, or text records containing fraudulent credentials.",
              "Deploy automated scrapers, spiders, or scripts to harvest curated educational resource indices.",
              "Reverse engineer the core graph compilation algorithms or skill-matching matching metrics.",
              "Use tracking logs to submit malicious, misleading, or abusive mock application records."
            ] 
          },
          { 
            title: "5. Third-Party Content & Educational Links", 
            content: "Our curated learning nodes compile references, document files, and course links from external platforms and open-source APIs. skillGraph does not own, control, maintain, or verify the operational uptime, completeness, or accuracy of these external learning resources." 
          },
          { 
            title: "6. Disclaimers & Limitation of Liability", 
            content: "skillGraph is provided on an 'as is' and 'as available' basis. Our AI processing outputs and skill matches serve as analytical suggestions. We do not guarantee interview conversions, employment placements, or flawless accuracy in semantic skill mapping. skillGraph is not liable for structural job rejections or application errors.",
          },
          { 
            title: "7. Account Termination", 
            content: "We reserve the operational right to temporarily restrict or completely terminate user dashboard access if a profile is flagged for system abuse, repeated data scraping, or malicious API exploits." 
          },
          { 
            title: "8. Modifications to Terms", 
            content: "We may update these Terms of Service from time to time. Continued navigation or utilization of your skillGraph workspace after changes go live confirms your technical acceptance of the modified ecosystem frameworks." 
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

        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">9. Contact Us</h2>
        <p className="text-[#888] leading-relaxed">If you have inquiries regarding platform operations, API parameters, or usage compliance restrictions, please contact us at:</p>
        <div className="mt-6 inline-block rounded-xl border border-[#e8e3dc] bg-[#faf7f2] px-6 py-4">
          <p className="text-[#1a1a1a] text-sm">
            skillGraph Support<br />
            <span className="text-[#aaa]">legal@skillgraph.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
