// ─────────────────────────────────────────────────────────────────────────────
// Utils/resumeParser.js
//
// Orchestrates downloading a PDF from a URL (Cloudinary or any public URL),
// extracting its text with pdf-parse, sending the text to Gemini for skill
// extraction, and normalising the results.
//
// Public API:
//   extractTextFromPdf(pdfUrl)               → Promise<string>
//   extractSkillsFromResume(resumeText)       → Promise<string[]>
//   parseResumeAndExtractSkills(pdfUrl)       → Promise<string[]>  ← main entry point
//
// All functions are safe to call: errors are caught and logged. The main entry
// point always resolves (never rejects) — it returns [] on any failure.
// ─────────────────────────────────────────────────────────────────────────────

import { createRequire } from "module";
import axios from "axios";
import { extractSkillsWithGemini } from "../Services/geminiService.js";
import { normalizeSkills } from "./skillNormalizer.js";

// ── Load pdf-parse via CommonJS require ───────────────────────────────────────
// pdf-parse@1.1.1 is a CJS-only package that does `module.exports = pdfParse`.
// We use createRequire (Node.js built-in) to call require() from inside an ESM
// module. This is the canonical interop pattern for CJS packages in ESM.
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Diagnostic: confirm the import resolved to a callable function at startup.
// If this prints anything other than "function" the package version is wrong.
console.log("[resumeParser] typeof pdfParse:", typeof pdfParse);

/**
 * extractTextFromPdf
 *
 * Downloads a PDF from the given URL and extracts its plain text content.
 *
 * @param {string} pdfUrl — public HTTPS URL of the PDF (e.g. Cloudinary URL)
 * @returns {Promise<string>} — extracted plain text
 * @throws {Error} if download or parsing fails
 */
export async function extractTextFromPdf(pdfUrl) {
    if (!pdfUrl || typeof pdfUrl !== "string") {
        throw new Error("extractTextFromPdf: pdfUrl must be a non-empty string.");
    }

    // ── Download the PDF as a binary buffer ───────────────────────────────────
    const response = await axios.get(pdfUrl, {
        responseType: "arraybuffer",          // raw bytes, not a string
        timeout: 30_000,                       // 30 s — generous for cold CDN connections
        headers: {
            Accept: "application/pdf,application/octet-stream,*/*",
        },
    });

    // axios with responseType:"arraybuffer" returns an ArrayBuffer in browser
    // and a Buffer in Node — wrap in Buffer.from() to guarantee a real Buffer
    // in all environments, since pdf-parse strictly requires a Buffer.
    const buffer = Buffer.from(response.data);

    // Sanity-check: confirm the value passed to pdfParse is a real Buffer
    console.log(`[resumeParser] buffer type: ${buffer.constructor.name}, size: ${buffer.length} bytes`);
    console.log(`[resumeParser] Buffer.isBuffer check: ${Buffer.isBuffer(buffer)}`);

    // ── Parse with pdf-parse ──────────────────────────────────────────────────
    let parsed;
    try {
        parsed = await pdfParse(buffer);
    } catch (err) {
        // Log the full error object so future failures are diagnosable
        console.error("[resumeParser] pdfParse() threw:", err);
        throw new Error(`pdf-parse failed: ${err.message}`);
    }

    const text = parsed.text || "";
    console.log(`[resumeParser] Extracted ${text.length} chars across ${parsed.numpages} page(s)`);

    return text;
}

/**
 * extractSkillsFromResume
 *
 * Given raw resume text, calls Gemini to extract skills and normalises them.
 *
 * @param {string} resumeText — plain text from a PDF
 * @returns {Promise<string[]>} — normalised, deduplicated skill names
 * @throws {Error} if Gemini call fails
 */
export async function extractSkillsFromResume(resumeText) {
    const rawSkills = await extractSkillsWithGemini(resumeText);
    return normalizeSkills(rawSkills);
}

/**
 * parseResumeAndExtractSkills
 *
 * Convenience entry point: downloads the PDF → extracts text → extracts skills.
 * NEVER throws. Returns an empty array on any error and logs the reason.
 *
 * This is the function that RoadmapController should call.
 *
 * @param {string} pdfUrl — public URL of the PDF resume
 * @returns {Promise<string[]>} — skill strings (may be empty on error/no resume)
 */
export async function parseResumeAndExtractSkills(pdfUrl) {
    if (!pdfUrl) return [];

    try {
        const text = await extractTextFromPdf(pdfUrl);

        if (!text || text.trim().length < 50) {
            console.warn("[resumeParser] PDF text too short — possibly a scanned/image PDF.");
            return [];
        }

        const skills = await extractSkillsFromResume(text);
        console.log(`[resumeParser] Extracted ${skills.length} skills from resume.`);
        return skills;

    } catch (error) {
        // Never let resume parsing crash the roadmap generation
        console.error("[resumeParser] Failed to parse resume — falling back to manual skills:", error.message);
        return [];
    }
}
