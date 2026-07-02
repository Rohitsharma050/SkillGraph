// ─────────────────────────────────────────────────────────────────────────────
// Utils/roadmapTemplates.js
//
// Deterministic, role-based roadmap templates.
// Each template defines:
//   • skills  — ordered array of skill objects used to build nodes
//   • edges   — prerequisite relationships between skill ids
//   • buildExplanation(existingSkills, missingSkills) — human-readable string
//
// skill object shape:
//   { id, label, level, type, description, estimatedTime, reason }
//
// "level" controls the learning layer (1 = foundation … 5 = advanced)
// "type"  is always "required" here; the controller will override to
//         "existing" / "missing" based on the user's extracted skills.
// ─────────────────────────────────────────────────────────────────────────────

const templates = {

    // ── 1. Full Stack Developer ─────────────────────────────────────────────
    "Full Stack Developer": {
        skills: [
            { id: "html",       label: "HTML",           level: 1, description: "Structure web pages with semantic HTML5 elements.",          estimatedTime: "1 week",   reason: "The foundation of every web page." },
            { id: "css",        label: "CSS",            level: 1, description: "Style and layout with modern CSS3, Flexbox, and Grid.",      estimatedTime: "1-2 weeks", reason: "Required to make UIs presentable." },
            { id: "js",         label: "JavaScript",     level: 2, description: "Core programming language of the web — ES6+.",              estimatedTime: "3-4 weeks", reason: "Drives all frontend interactivity and logic." },
            { id: "git",        label: "Git",            level: 1, description: "Version control for tracking changes and collaboration.",    estimatedTime: "1 week",   reason: "Industry-standard for all developers." },
            { id: "react",      label: "React",          level: 3, description: "Build reusable UI components and manage state.",            estimatedTime: "3-4 weeks", reason: "Most popular frontend library for Full Stack work." },
            { id: "nodejs",     label: "Node.js",        level: 3, description: "Run JavaScript on the server side.",                        estimatedTime: "2-3 weeks", reason: "Enables JavaScript-based backend development." },
            { id: "express",    label: "Express.js",     level: 3, description: "Minimal web framework for building REST APIs.",             estimatedTime: "2 weeks",   reason: "Standard backend framework for Node.js." },
            { id: "mongodb",    label: "MongoDB",        level: 4, description: "NoSQL database — store documents in flexible JSON format.",  estimatedTime: "2 weeks",   reason: "Widely used with Node.js/Express backends." },
            { id: "restapi",    label: "REST APIs",      level: 4, description: "Design and consume RESTful API endpoints.",                 estimatedTime: "1-2 weeks", reason: "Core skill for connecting frontend and backend." },
            { id: "auth",       label: "Auth & JWT",     level: 4, description: "Implement secure user authentication using JWTs.",          estimatedTime: "1-2 weeks", reason: "Every full-stack app needs authentication." },
            { id: "deploy",     label: "Deployment",     level: 5, description: "Deploy apps to Vercel, Railway, Render, or AWS.",           estimatedTime: "1 week",   reason: "Ship your apps to production." },
        ],
        edges: [
            { from: "html",    to: "css",      relation: "prerequisite" },
            { from: "css",     to: "js",       relation: "prerequisite" },
            { from: "js",      to: "react",    relation: "prerequisite" },
            { from: "js",      to: "nodejs",   relation: "prerequisite" },
            { from: "nodejs",  to: "express",  relation: "prerequisite" },
            { from: "express", to: "mongodb",  relation: "prerequisite" },
            { from: "express", to: "restapi",  relation: "prerequisite" },
            { from: "restapi", to: "auth",     relation: "prerequisite" },
            { from: "react",   to: "restapi",  relation: "uses" },
            { from: "auth",    to: "deploy",   relation: "prerequisite" },
            { from: "git",     to: "deploy",   relation: "prerequisite" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `This roadmap was built for the role of **${targetRole}**. ` +
            (existing.length > 0
                ? `You already have experience with ${existing.join(", ")}, which gives you a head start. `
                : "No matching skills were detected from your profile yet. ") +
            (missing.length > 0
                ? `You will need to learn: ${missing.join(", ")}. ` +
                  "Skills are ordered by prerequisite — complete foundational layers before advanced ones. "
                : "Impressive — you already cover all core skills for this role! ") +
            "Follow the node levels (1 → 5) from left to right for an optimal learning sequence.",
    },

    // ── 2. Frontend Developer ────────────────────────────────────────────────
    "Frontend Developer": {
        skills: [
            { id: "html",       label: "HTML",              level: 1, description: "Semantic HTML5 for accessible, structured pages.",        estimatedTime: "1 week",   reason: "Backbone of every webpage." },
            { id: "css",        label: "CSS",               level: 1, description: "CSS3, Flexbox, Grid, animations.",                        estimatedTime: "1-2 weeks", reason: "Core styling skill for frontend." },
            { id: "js",         label: "JavaScript",        level: 2, description: "ES6+, DOM manipulation, async/await.",                    estimatedTime: "3-4 weeks", reason: "Every frontend developer must master JS." },
            { id: "git",        label: "Git",               level: 1, description: "Version control for code tracking and team work.",        estimatedTime: "1 week",   reason: "Essential collaboration tool." },
            { id: "react",      label: "React",             level: 3, description: "Component-based UI library — hooks, context, routing.",   estimatedTime: "3-4 weeks", reason: "Top frontend framework for developer roles." },
            { id: "typescript", label: "TypeScript",        level: 3, description: "Static typing for JavaScript to reduce runtime errors.",  estimatedTime: "2 weeks",   reason: "Increasingly required in frontend job roles." },
            { id: "tailwind",   label: "Tailwind CSS",      level: 3, description: "Utility-first CSS framework for rapid UI development.",   estimatedTime: "1 week",   reason: "Modern styling standard in React projects." },
            { id: "restapi",    label: "REST API / Fetch",  level: 4, description: "Consume APIs using fetch, axios, and async patterns.",    estimatedTime: "1 week",   reason: "Frontend apps always talk to a backend API." },
            { id: "testing",    label: "Testing (Jest)",    level: 4, description: "Unit and integration tests for React components.",        estimatedTime: "2 weeks",   reason: "Ensures code quality and prevents regressions." },
            { id: "perf",       label: "Performance",       level: 5, description: "Lazy loading, code splitting, Core Web Vitals.",          estimatedTime: "1-2 weeks", reason: "Differentiates mid-level from senior frontend engineers." },
        ],
        edges: [
            { from: "html",       to: "css",        relation: "prerequisite" },
            { from: "css",        to: "js",         relation: "prerequisite" },
            { from: "js",         to: "react",      relation: "prerequisite" },
            { from: "js",         to: "typescript", relation: "prerequisite" },
            { from: "css",        to: "tailwind",   relation: "alternative" },
            { from: "react",      to: "restapi",    relation: "uses" },
            { from: "react",      to: "testing",    relation: "prerequisite" },
            { from: "testing",    to: "perf",       relation: "prerequisite" },
            { from: "git",        to: "react",      relation: "supports" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `This roadmap targets the **${targetRole}** role. ` +
            (existing.length > 0
                ? `You already know: ${existing.join(", ")}. `
                : "No matching skills found in your profile yet. ") +
            (missing.length > 0
                ? `Skills to learn: ${missing.join(", ")}. Start with HTML/CSS, then JavaScript, then React and its ecosystem.`
                : "You already cover the full frontend stack — focus on perf and testing to stand out."),
    },

    // ── 3. Backend Developer ─────────────────────────────────────────────────
    "Backend Developer": {
        skills: [
            { id: "js",         label: "JavaScript",     level: 1, description: "Core programming fundamentals and ES6+ features.",          estimatedTime: "3-4 weeks", reason: "Primary language for Node.js backend." },
            { id: "git",        label: "Git",            level: 1, description: "Version control and branching strategies.",                 estimatedTime: "1 week",   reason: "Industry standard for all developers." },
            { id: "nodejs",     label: "Node.js",        level: 2, description: "Server-side JavaScript runtime — event loop, streams.",     estimatedTime: "2-3 weeks", reason: "Powers the backend JavaScript environment." },
            { id: "express",    label: "Express.js",     level: 2, description: "REST API framework — routing, middleware, error handling.", estimatedTime: "2 weeks",   reason: "Most widely used Node.js web framework." },
            { id: "mongodb",    label: "MongoDB",        level: 3, description: "NoSQL document database, Mongoose ODM.",                    estimatedTime: "2 weeks",   reason: "Common pairing with Express for data storage." },
            { id: "sql",        label: "SQL / PostgreSQL", level: 3, description: "Relational database queries, joins, transactions.",      estimatedTime: "2-3 weeks", reason: "Required for structured data and enterprise work." },
            { id: "auth",       label: "Auth & JWT",     level: 3, description: "Session, token-based auth, OAuth2 basics.",                 estimatedTime: "1-2 weeks", reason: "Security is a backend responsibility." },
            { id: "restapi",    label: "REST API Design", level: 4, description: "RESTful conventions, versioning, status codes.",           estimatedTime: "1 week",   reason: "Well-designed APIs make your backend reusable." },
            { id: "docker",     label: "Docker",         level: 4, description: "Containerise apps for consistent environments.",            estimatedTime: "2 weeks",   reason: "Industry standard for deployment and DevOps." },
            { id: "deploy",     label: "Deployment",     level: 5, description: "Deploy to Render, Railway, AWS EC2, or DigitalOcean.",     estimatedTime: "1 week",   reason: "Get your backend live and serving real users." },
        ],
        edges: [
            { from: "js",      to: "nodejs",  relation: "prerequisite" },
            { from: "nodejs",  to: "express", relation: "prerequisite" },
            { from: "express", to: "mongodb", relation: "uses" },
            { from: "express", to: "sql",     relation: "alternative" },
            { from: "express", to: "auth",    relation: "prerequisite" },
            { from: "auth",    to: "restapi", relation: "prerequisite" },
            { from: "restapi", to: "docker",  relation: "prerequisite" },
            { from: "docker",  to: "deploy",  relation: "prerequisite" },
            { from: "git",     to: "deploy",  relation: "prerequisite" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `This is a ${targetRole} roadmap. ` +
            (existing.length > 0
                ? `Your current skills (${existing.join(", ")}) are already mapped as completed nodes. `
                : "Start from the foundation — JavaScript and Git are your entry points. ") +
            (missing.length > 0
                ? `Focus next on: ${missing.join(", ")}. ` +
                  "Follow the prerequisite chain from left to right for best results."
                : "You've covered the backend stack well — focus on system design and scaling next."),
    },

    // ── 4. MERN Stack Developer ──────────────────────────────────────────────
    "MERN Stack Developer": {
        skills: [
            { id: "html",     label: "HTML",           level: 1, description: "Semantic HTML5 for web structure.",                            estimatedTime: "1 week",   reason: "Starting point for all web development." },
            { id: "css",      label: "CSS",            level: 1, description: "Styling with Flexbox, Grid, and responsive design.",          estimatedTime: "1-2 weeks", reason: "Needed to style your React components." },
            { id: "js",       label: "JavaScript",     level: 2, description: "ES6+, closures, promises, async/await.",                      estimatedTime: "3-4 weeks", reason: "Used on both frontend (React) and backend (Node)." },
            { id: "git",      label: "Git",            level: 1, description: "Version control and GitHub workflow.",                        estimatedTime: "1 week",   reason: "Collaborate and manage project history." },
            { id: "react",    label: "React",          level: 3, description: "Component model, hooks (useState/useEffect), React Router.",  estimatedTime: "3-4 weeks", reason: "The M in MERN's frontend layer (M = MongoDB is DB)." },
            { id: "nodejs",   label: "Node.js",        level: 3, description: "Backend JS runtime, event loop, npm ecosystem.",              estimatedTime: "2-3 weeks", reason: "Powers the N in MERN." },
            { id: "express",  label: "Express.js",     level: 3, description: "REST API routing, middleware chains, error handling.",        estimatedTime: "2 weeks",   reason: "Powers the E in MERN." },
            { id: "mongodb",  label: "MongoDB",        level: 4, description: "Document database — Mongoose, schemas, CRUD operations.",     estimatedTime: "2 weeks",   reason: "Powers the M (database) in MERN." },
            { id: "restapi",  label: "REST API",       level: 4, description: "Connect React frontend to Express backend via JSON APIs.",    estimatedTime: "1-2 weeks", reason: "Glues the frontend and backend together." },
            { id: "auth",     label: "Auth & JWT",     level: 4, description: "Secure login with JWT tokens, bcrypt, and protected routes.", estimatedTime: "1-2 weeks", reason: "Every real MERN app needs authentication." },
            { id: "deploy",   label: "Deployment",     level: 5, description: "Deploy frontend to Vercel, backend to Render/Railway.",       estimatedTime: "1 week",   reason: "Ship your MERN app to the world." },
        ],
        edges: [
            { from: "html",    to: "css",     relation: "prerequisite" },
            { from: "css",     to: "js",      relation: "prerequisite" },
            { from: "js",      to: "react",   relation: "prerequisite" },
            { from: "js",      to: "nodejs",  relation: "prerequisite" },
            { from: "nodejs",  to: "express", relation: "prerequisite" },
            { from: "express", to: "mongodb", relation: "prerequisite" },
            { from: "express", to: "restapi", relation: "prerequisite" },
            { from: "react",   to: "restapi", relation: "uses" },
            { from: "restapi", to: "auth",    relation: "prerequisite" },
            { from: "auth",    to: "deploy",  relation: "prerequisite" },
            { from: "git",     to: "deploy",  relation: "prerequisite" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `This roadmap covers the complete ${targetRole} stack: MongoDB, Express, React, and Node.js. ` +
            (existing.length > 0
                ? `You already know ${existing.join(", ")}, so those nodes are marked completed. `
                : "Begin with HTML and CSS, then JavaScript before touching React or Node. ") +
            (missing.length > 0
                ? `Your learning path: ${missing.join(" → ")}. ` +
                  "Each skill unlocks the next — follow the edges on the graph."
                : "You have all MERN skills covered. Consider adding TypeScript or testing next."),
    },

    // ── 5. Software Engineer ────────────────────────────────────────────────
    "Software Engineer": {
        skills: [
            { id: "dsa",        label: "Data Structures & Algorithms", level: 1, description: "Arrays, linked lists, trees, sorting, searching.", estimatedTime: "6-8 weeks", reason: "Core requirement for engineering interviews and system design." },
            { id: "oop",        label: "OOP Concepts",        level: 1, description: "Classes, inheritance, polymorphism, encapsulation.",         estimatedTime: "2 weeks",   reason: "Foundation of most production codebases." },
            { id: "git",        label: "Git",                 level: 1, description: "Version control, branching, pull requests.",                 estimatedTime: "1 week",   reason: "Used daily in every engineering team." },
            { id: "js",         label: "JavaScript",          level: 2, description: "ES6+, closures, event loop, async patterns.",                estimatedTime: "3-4 weeks", reason: "Highly versatile — works on frontend and backend." },
            { id: "nodejs",     label: "Node.js",             level: 2, description: "Backend runtime for building scalable services.",            estimatedTime: "2-3 weeks", reason: "Popular for building APIs and microservices." },
            { id: "sql",        label: "SQL",                 level: 2, description: "Relational database querying and design.",                   estimatedTime: "2 weeks",   reason: "Most companies rely on relational databases." },
            { id: "systemdesign", label: "System Design",    level: 4, description: "Scalability, load balancing, caching, microservices.",       estimatedTime: "4-6 weeks", reason: "Required for senior and staff engineering roles." },
            { id: "testing",    label: "Testing",             level: 3, description: "Unit, integration, E2E tests — TDD principles.",             estimatedTime: "2 weeks",   reason: "Quality engineering requires test coverage." },
            { id: "docker",     label: "Docker",              level: 4, description: "Containerisation for reproducible builds.",                  estimatedTime: "2 weeks",   reason: "Modern deployment standard across the industry." },
            { id: "cicd",       label: "CI/CD",               level: 5, description: "GitHub Actions, pipelines, automated deployments.",          estimatedTime: "2 weeks",   reason: "Automate quality gates and releases." },
        ],
        edges: [
            { from: "dsa",       to: "systemdesign", relation: "prerequisite" },
            { from: "oop",       to: "js",           relation: "prerequisite" },
            { from: "js",        to: "nodejs",       relation: "prerequisite" },
            { from: "nodejs",    to: "testing",      relation: "prerequisite" },
            { from: "sql",       to: "systemdesign", relation: "prerequisite" },
            { from: "testing",   to: "docker",       relation: "prerequisite" },
            { from: "docker",    to: "cicd",         relation: "prerequisite" },
            { from: "git",       to: "cicd",         relation: "prerequisite" },
            { from: "systemdesign", to: "cicd",      relation: "supports" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `The ${targetRole} role demands both breadth and depth. ` +
            (existing.length > 0
                ? `Your existing skills (${existing.join(", ")}) are a solid start. `
                : "Begin with DSA and OOP — they underpin everything else. ") +
            (missing.length > 0
                ? `Priority gaps to close: ${missing.join(", ")}. ` +
                  "Master DSA and system design — these are the key differentiators in engineering interviews."
                : "You have strong coverage. Go deeper into system design and CI/CD to stand out."),
    },

    // ── 6. Data Analyst ─────────────────────────────────────────────────────
    "Data Analyst": {
        skills: [
            { id: "excel",    label: "Excel / Sheets",    level: 1, description: "Pivot tables, VLOOKUP, data cleaning in spreadsheets.",     estimatedTime: "1-2 weeks", reason: "Most data analysis starts here." },
            { id: "sql",      label: "SQL",               level: 1, description: "SELECT, GROUP BY, JOINs, window functions.",               estimatedTime: "2-3 weeks", reason: "The #1 skill for data analyst roles." },
            { id: "python",   label: "Python",            level: 2, description: "Python basics — variables, loops, functions, file I/O.",    estimatedTime: "3-4 weeks", reason: "Primary scripting language for data work." },
            { id: "pandas",   label: "Pandas",            level: 3, description: "DataFrames, groupby, merge, time series.",                 estimatedTime: "2-3 weeks", reason: "Core library for data manipulation in Python." },
            { id: "numpy",    label: "NumPy",             level: 3, description: "Array operations, linear algebra, statistical functions.",  estimatedTime: "1-2 weeks", reason: "Underpins all numerical Python work." },
            { id: "viz",      label: "Data Visualization", level: 3, description: "Matplotlib, Seaborn, Plotly for charts and dashboards.", estimatedTime: "2 weeks",   reason: "Communicate findings visually to stakeholders." },
            { id: "bi",       label: "BI Tools (Power BI / Tableau)", level: 4, description: "Build dashboards and reports for business users.", estimatedTime: "2-3 weeks", reason: "Required in most analyst job descriptions." },
            { id: "stats",    label: "Statistics",        level: 2, description: "Descriptive stats, probability, hypothesis testing.",       estimatedTime: "3-4 weeks", reason: "Analytical reasoning requires statistical thinking." },
            { id: "ml_basics", label: "ML Basics",        level: 5, description: "Linear regression, classification, model evaluation.",     estimatedTime: "3-4 weeks", reason: "Many analyst roles now expect basic ML knowledge." },
        ],
        edges: [
            { from: "excel",   to: "sql",      relation: "prerequisite" },
            { from: "sql",     to: "python",   relation: "prerequisite" },
            { from: "python",  to: "pandas",   relation: "prerequisite" },
            { from: "python",  to: "numpy",    relation: "prerequisite" },
            { from: "pandas",  to: "viz",      relation: "prerequisite" },
            { from: "numpy",   to: "stats",    relation: "prerequisite" },
            { from: "viz",     to: "bi",       relation: "prerequisite" },
            { from: "stats",   to: "ml_basics", relation: "prerequisite" },
            { from: "bi",      to: "ml_basics", relation: "supports" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `This ${targetRole} roadmap focuses on turning raw data into clear insights. ` +
            (existing.length > 0
                ? `You already have: ${existing.join(", ")} — great foundation. `
                : "Start with Excel and SQL — they are the fastest way to start adding value as an analyst. ") +
            (missing.length > 0
                ? `Key areas to build: ${missing.join(", ")}. ` +
                  "SQL → Python → Pandas/Viz → Statistics is the recommended learning order."
                : "You've covered the analyst stack. Dive deeper into statistics and ML to advance your career."),
    },

    // ── 7. AI/ML Engineer ───────────────────────────────────────────────────
    "AI/ML Engineer": {
        skills: [
            { id: "python",   label: "Python",            level: 1, description: "Python fundamentals — OOP, file I/O, libraries.",           estimatedTime: "3-4 weeks", reason: "The primary language for AI/ML development." },
            { id: "math",     label: "Math (Linear Algebra + Calculus)", level: 1, description: "Vectors, matrices, derivatives — the math behind ML.", estimatedTime: "4-6 weeks", reason: "Deep understanding of models requires this foundation." },
            { id: "stats",    label: "Statistics & Probability", level: 1, description: "Distributions, Bayes theorem, hypothesis testing.", estimatedTime: "3-4 weeks", reason: "Needed for model evaluation and feature selection." },
            { id: "numpy",    label: "NumPy",             level: 2, description: "Array math, broadcasting, vectorisation.",                  estimatedTime: "1-2 weeks", reason: "The numerical backbone of the Python ML ecosystem." },
            { id: "pandas",   label: "Pandas",            level: 2, description: "Data cleaning, wrangling, feature engineering.",           estimatedTime: "2 weeks",   reason: "Most ML projects start with messy tabular data." },
            { id: "sklearn",  label: "Scikit-learn",      level: 3, description: "Classical ML — regression, classification, clustering.",    estimatedTime: "3 weeks",   reason: "The go-to library for classical machine learning." },
            { id: "viz",      label: "Data Visualization", level: 2, description: "Matplotlib, Seaborn — understand data patterns.",         estimatedTime: "1 week",   reason: "EDA and result reporting rely heavily on charts." },
            { id: "dl",       label: "Deep Learning",     level: 4, description: "Neural networks, backprop, activation functions.",          estimatedTime: "4-6 weeks", reason: "Core of modern AI applications." },
            { id: "pytorch",  label: "PyTorch / TensorFlow", level: 4, description: "Build and train neural networks with modern frameworks.", estimatedTime: "4 weeks",  reason: "Industry-standard for building and deploying models." },
            { id: "nlp",      label: "NLP / LLMs",        level: 5, description: "Transformers, tokenisation, fine-tuning language models.", estimatedTime: "4-6 weeks", reason: "Highest demand AI engineering specialisation in 2024-2025." },
            { id: "mlops",    label: "MLOps",             level: 5, description: "Model serving, monitoring, CI/CD for ML pipelines.",        estimatedTime: "4 weeks",   reason: "Required to take models from notebooks to production." },
        ],
        edges: [
            { from: "python",  to: "numpy",   relation: "prerequisite" },
            { from: "python",  to: "pandas",  relation: "prerequisite" },
            { from: "math",    to: "numpy",   relation: "prerequisite" },
            { from: "stats",   to: "sklearn", relation: "prerequisite" },
            { from: "numpy",   to: "sklearn", relation: "prerequisite" },
            { from: "pandas",  to: "sklearn", relation: "prerequisite" },
            { from: "pandas",  to: "viz",     relation: "uses" },
            { from: "sklearn", to: "dl",      relation: "prerequisite" },
            { from: "dl",      to: "pytorch", relation: "prerequisite" },
            { from: "pytorch", to: "nlp",     relation: "prerequisite" },
            { from: "pytorch", to: "mlops",   relation: "prerequisite" },
        ],
        buildExplanation: (existing, missing, targetRole) =>
            `The ${targetRole} role is one of the most mathematically demanding paths in tech. ` +
            (existing.length > 0
                ? `You already have: ${existing.join(", ")} — strong start. `
                : "Start with Python, then math and stats — these are non-negotiable foundations. ") +
            (missing.length > 0
                ? `Build these next: ${missing.join(", ")}. ` +
                  "The recommended order is: Python → NumPy/Pandas → Scikit-learn → Deep Learning → PyTorch → NLP/MLOps."
                : "You have excellent AI/ML coverage. Specialise in NLP, computer vision, or MLOps to stand out."),
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// getTemplate(targetRole)
// Returns the template for a given role, or null if not found.
// ─────────────────────────────────────────────────────────────────────────────
export const getTemplate = (targetRole) => {
    // Try exact match first
    if (templates[targetRole]) return templates[targetRole];

    // Fuzzy match (case-insensitive)
    const key = Object.keys(templates).find(
        (k) => k.toLowerCase() === targetRole.toLowerCase()
    );
    return key ? templates[key] : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// getSupportedRoles()
// Returns list of role names this module supports.
// ─────────────────────────────────────────────────────────────────────────────
export const getSupportedRoles = () => Object.keys(templates);
