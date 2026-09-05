// ─────────────────────────────────────────────────────────────────────────────
// scratch/testResumeParser.js
//
// Standalone test script to debug the resume parsing pipeline.
// Run with: node scratch/testResumeParser.js <resume-url-or-local-path>
//
// Examples:
//   node scratch/testResumeParser.js https://res.cloudinary.com/.../resume.pdf
//   node scratch/testResumeParser.js ./myresume.pdf
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import axios from "axios";
import fs from "fs";

// pdf-parse@1.1.1 is CJS-only — use createRequire for reliable interop
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
console.log("[test] typeof pdfParse:", typeof pdfParse);


// Load .env from Backend root
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

import { extractSkillsWithGemini } from "../Services/geminiService.js";
import { normalizeSkills } from "../Utils/skillNormalizer.js";

const arg = process.argv[2];

if (!arg) {
    console.error("Usage: node scratch/testResumeParser.js <url-or-local-path>");
    process.exit(1);
}

// ── Step helpers ──────────────────────────────────────────────────────────────
const separator = (label) => console.log(`\n${"─".repeat(60)}\n${label}\n${"─".repeat(60)}`);

async function main() {
    separator("STEP 1 — Load PDF");

    let buffer;

    if (arg.startsWith("http://") || arg.startsWith("https://")) {
        console.log(`Downloading from URL: ${arg}`);
        const response = await axios.get(arg, { responseType: "arraybuffer", timeout: 30_000 });
        buffer = Buffer.from(response.data);
        console.log(`✓ Downloaded ${buffer.length} bytes`);
    } else {
        const absPath = path.resolve(arg);
        console.log(`Reading local file: ${absPath}`);
        buffer = fs.readFileSync(absPath);
        console.log(`✓ Read ${buffer.length} bytes`);
    }

    separator("STEP 2 — Extract Text (pdf-parse)");
    let text;
    try {
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
        console.log(`✓ Extracted ${text.length} characters across ${parsed.numpages} page(s)`);
        console.log("\n── First 800 chars of extracted text ──");
        console.log(text.slice(0, 800));
        console.log("...");
    } catch (err) {
        console.error("✗ pdf-parse failed:", err.message);
        console.error("  → This may be a scanned/image-based PDF that has no embedded text.");
        process.exit(1);
    }

    if (!text || text.trim().length < 50) {
        console.warn("⚠ Extracted text is too short (< 50 chars).");
        console.warn("  → The PDF may be image-based (scanned resume). pdf-parse cannot read images.");
        process.exit(1);
    }

    separator("STEP 3 — Gemini Skill Extraction");
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
        console.error("✗ GEMINI_API_KEY is not set (or still has placeholder value).");
        console.error("  → Set it in Backend/.env and retry.");
        console.log("\n── Falling back: showing raw text words for manual review ──");
        const words = [...new Set(text.split(/\s+/).filter(w => w.length > 2))];
        console.log(words.slice(0, 80).join(", "));
        process.exit(1);
    }

    let rawSkills;
    try {
        rawSkills = await extractSkillsWithGemini(text);
        console.log(`✓ Gemini returned ${rawSkills.length} raw skills:`);
        console.log(rawSkills);
    } catch (err) {
        console.error("✗ Gemini extraction failed:", err.message);
        process.exit(1);
    }

    separator("STEP 4 — Normalize Skills");
    const normalized = normalizeSkills(rawSkills);
    console.log(`✓ After normalization + dedup: ${normalized.length} skills:`);
    console.log(normalized);

    separator("SUMMARY");
    console.log(`PDF text length : ${text.length} chars`);
    console.log(`Raw from Gemini : ${rawSkills.length} skills`);
    console.log(`After normalize : ${normalized.length} skills`);
    console.log("\nFinal skill list:");
    normalized.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}

main().catch((err) => {
    console.error("\nUnexpected error:", err.message);
    process.exit(1);
});
