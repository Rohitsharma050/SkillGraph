// ─────────────────────────────────────────────────────────────────────────────
// Services/geminiService.js
//
// Reusable wrapper around the Google Generative AI SDK (Gemini).
// Reads GEMINI_API_KEY from environment variables.
//
// Public API:
//   extractSkillsWithGemini(resumeText) → Promise<string[]>
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Lazily initialised Gemini client.
 * We initialise on first call so the server can boot even without the key
 * (requests will fail gracefully at call-time, not at startup).
 */
let genAI = null;

function getClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

/**
 * ATS extraction prompt — instructs Gemini to return ONLY a JSON object.
 * Using a strict format avoids any markdown fences or prose in the response.
 */
const buildPrompt = (resumeText) => `You are an ATS (Applicant Tracking System) skill extraction engine.

Your task is to extract ONLY technical skills from the provided resume text.

Rules:
- Include programming languages, frameworks, libraries, tools, databases, platforms, and cloud services.
- Do NOT include soft skills (e.g. "communication", "teamwork").
- Do NOT include job titles, company names, or years of experience.
- Return each skill exactly as it appears in the resume (do not abbreviate or expand).
- Return a flat JSON object — no markdown, no code fences, no explanation.

Format (strict):
{"skills": ["skill1", "skill2", "skill3"]}

Resume:
${resumeText}`;

// ── Model fallback list ───────────────────────────────────────────────────────
// gemini-1.5-flash was deprecated from the v1beta endpoint.
// Try models in order; first successful response wins.
// Model names sourced from the 404 error responses themselves:
//   gemini-2.0-flash      → "use models/gemini-3.6-flash"
//   gemini-2.0-flash-lite → "use models/gemini-3.5-flash-lite"
const MODEL_FALLBACK_LIST = [
    "gemini-3.6-flash",      // recommended replacement for gemini-2.0-flash
    "gemini-2.5-flash",      // stable mid-tier model
    "gemini-3.5-flash-lite", // lightweight fallback
];

/**
 * extractSkillsWithGemini
 *
 * Sends the resume text to Gemini and parses the returned JSON.
 * Tries each model in MODEL_FALLBACK_LIST until one succeeds.
 * Throws only if ALL models fail, so the caller can fall back gracefully.
 *
 * @param {string} resumeText — plain text extracted from a PDF resume
 * @returns {Promise<string[]>} — array of raw skill strings from Gemini
 */
export async function extractSkillsWithGemini(resumeText) {
    if (!resumeText || resumeText.trim().length < 50) {
        return [];
    }

    const client = getClient();
    const prompt = buildPrompt(resumeText.slice(0, 12000)); // cap at ~12k chars

    let lastError = null;

    for (const modelName of MODEL_FALLBACK_LIST) {
        try {
            console.log(`[geminiService] Trying model: ${modelName}`);
            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();

            // Strip any accidental markdown code fences Gemini may add
            const jsonText = responseText
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();

            let parsed;
            try {
                parsed = JSON.parse(jsonText);
            } catch {
                throw new Error(`Gemini returned non-JSON response: ${responseText.slice(0, 200)}`);
            }

            if (!Array.isArray(parsed.skills)) {
                throw new Error("Gemini response missing 'skills' array.");
            }

            console.log(`[geminiService] ✓ Success with model: ${modelName}, got ${parsed.skills.length} skills`);

            // Filter out empty / non-string entries
            return parsed.skills.filter((s) => typeof s === "string" && s.trim().length > 0);

        } catch (err) {
            console.warn(`[geminiService] Model "${modelName}" failed: ${err.message}`);
            lastError = err;
            // Continue to next model in the list
        }
    }

    // All models exhausted — propagate the last error
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}
