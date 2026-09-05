// ─────────────────────────────────────────────────────────────────────────────
// Utils/skillNormalizer.js
//
// Maps colloquial / abbreviated skill names to their canonical equivalents
// so that "ReactJS", "React.js", and "React" are all treated as the same skill.
//
// Public API:
//   normalizeSkill(skill)    → String  — normalize a single skill string
//   normalizeSkills(skills)  → String[] — normalize + deduplicate an array
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Each entry is [regex, canonicalName].
 * The regex is tested case-insensitively against the trimmed input.
 * Entries are checked in order — first match wins.
 */
const NORMALIZATIONS = [
    // JavaScript variants
    [/^js$/i,                       "JavaScript"],
    [/^javascript$/i,               "JavaScript"],
    [/^es6(\+)?$/i,                 "JavaScript"],
    [/^ecmascript$/i,               "JavaScript"],
    [/^vanilla[\s-]?js$/i,          "JavaScript"],

    // TypeScript
    [/^ts$/i,                       "TypeScript"],
    [/^typescript$/i,               "TypeScript"],

    // React
    [/^react\.?js$/i,               "React"],
    [/^react$/i,                    "React"],
    [/^reactjs$/i,                  "React"],
    [/^react[\s-]?native$/i,        "React Native"],

    // Node.js
    [/^node\.?js$/i,                "Node.js"],
    [/^nodejs$/i,                   "Node.js"],
    [/^node$/i,                     "Node.js"],

    // MongoDB
    [/^mongo$/i,                    "MongoDB"],
    [/^mongo[\s-]?db$/i,            "MongoDB"],
    [/^mongodb$/i,                  "MongoDB"],

    // Express
    [/^express\.?js$/i,             "Express.js"],
    [/^expressjs$/i,                "Express.js"],
    [/^express$/i,                  "Express.js"],

    // Next.js
    [/^next\.?js$/i,                "Next.js"],
    [/^nextjs$/i,                   "Next.js"],

    // Vue
    [/^vue\.?js$/i,                 "Vue.js"],
    [/^vuejs$/i,                    "Vue.js"],
    [/^vue$/i,                      "Vue.js"],

    // Angular
    [/^angular\.?js$/i,             "Angular"],
    [/^angularjs$/i,                "Angular"],
    [/^angular$/i,                  "Angular"],

    // Python
    [/^py$/i,                       "Python"],
    [/^python3?$/i,                 "Python"],

    // CSS variants
    [/^css3?$/i,                    "CSS"],
    [/^html5?$/i,                   "HTML"],
    [/^html[\s&]+css$/i,            "HTML/CSS"],

    // Tailwind
    [/^tailwind[\s-]?css$/i,        "Tailwind CSS"],
    [/^tailwindcss$/i,              "Tailwind CSS"],
    [/^tailwind$/i,                 "Tailwind CSS"],

    // GraphQL
    [/^graphql$/i,                  "GraphQL"],
    [/^gql$/i,                      "GraphQL"],

    // REST API
    [/^rest[\s-]?api$/i,            "REST API"],
    [/^restful[\s-]?api$/i,         "REST API"],
    [/^rest$/i,                     "REST API"],

    // PostgreSQL
    [/^postgres(ql)?$/i,            "PostgreSQL"],
    [/^pg$/i,                       "PostgreSQL"],

    // MySQL
    [/^mysql$/i,                    "MySQL"],

    // Redis
    [/^redis$/i,                    "Redis"],

    // Docker
    [/^docker$/i,                   "Docker"],
    [/^dockerfile$/i,               "Docker"],

    // Kubernetes
    [/^k8s$/i,                      "Kubernetes"],
    [/^kubernetes$/i,               "Kubernetes"],

    // AWS
    [/^aws$/i,                      "AWS"],
    [/^amazon[\s-]?web[\s-]?services$/i, "AWS"],

    // Git
    [/^git[\s-]?hub$/i,             "GitHub"],
    [/^git$/i,                      "Git"],

    // Java
    [/^java$/i,                     "Java"],
    [/^java[\s-]?ee$/i,             "Java EE"],

    // C / C++
    [/^c\+\+$/i,                    "C++"],
    [/^cpp$/i,                      "C++"],
    [/^c#$/i,                       "C#"],
    [/^csharp$/i,                   "C#"],

    // Spring Boot
    [/^spring[\s-]?boot$/i,         "Spring Boot"],
    [/^spring$/i,                   "Spring"],

    // Machine Learning / AI
    [/^ml$/i,                       "Machine Learning"],
    [/^machine[\s-]?learning$/i,    "Machine Learning"],
    [/^deep[\s-]?learning$/i,       "Deep Learning"],
    [/^dl$/i,                       "Deep Learning"],
    [/^nlp$/i,                      "NLP"],
    [/^natural[\s-]?language[\s-]?processing$/i, "NLP"],

    // Data Science
    [/^ds$/i,                       "Data Science"],
    [/^data[\s-]?science$/i,        "Data Science"],

    // DevOps / CI-CD
    [/^ci[\s/-]?cd$/i,              "CI/CD"],
    [/^devops$/i,                   "DevOps"],

    // Figma
    [/^figma$/i,                    "Figma"],

    // Linux
    [/^linux$/i,                    "Linux"],
    [/^bash$/i,                     "Bash"],
    [/^shell[\s-]?script(ing)?$/i,  "Bash"],
];

/**
 * normalizeSkill
 * Returns the canonical form of a single skill string.
 * Falls back to a title-cased version of the trimmed input if no mapping found.
 *
 * @param {string} skill
 * @returns {string}
 */
export function normalizeSkill(skill) {
    if (!skill || typeof skill !== "string") return "";
    const trimmed = skill.trim();
    if (!trimmed) return "";

    for (const [regex, canonical] of NORMALIZATIONS) {
        if (regex.test(trimmed)) return canonical;
    }

    // No mapping found — return trimmed as-is (preserve original casing)
    return trimmed;
}

/**
 * normalizeSkills
 * Normalizes an array of skill strings and removes duplicates (case-insensitive).
 *
 * @param {string[]} skills
 * @returns {string[]}
 */
export function normalizeSkills(skills) {
    if (!Array.isArray(skills)) return [];

    const seen = new Set();
    const result = [];

    for (const s of skills) {
        const normalized = normalizeSkill(s);
        if (!normalized) continue;
        const key = normalized.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            result.push(normalized);
        }
    }

    return result;
}
