// ─────────────────────────────────────────────────────────────────────────────
// Utils/seedResources.js
//
// Run once to populate the Resource collection with sample data.
//
// Usage from Backend/ folder:
//   node Utils/seedResources.js
//
// It is safe to run multiple times — it clears existing seeded resources first.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import resourceModel from "../Models/resourceModel.js";

dotenv.config({ path: "./.env" });

// Override system DNS to match server.js — needed to resolve MongoDB Atlas SRV records
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const RESOURCES = [
    // ── HTML ──────────────────────────────────────────────────────────────────
    {
        skillName: "HTML",
        title: "HTML Full Course – Build a Website Tutorial",
        type: "video",
        url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
        description: "Learn HTML from scratch in this free full-course video by freeCodeCamp. Covers forms, tables, semantic elements and more.",
        difficulty: "beginner",
        tags: ["html", "web", "frontend", "beginner"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "HTML",
        title: "MDN HTML Documentation",
        type: "documentation",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        description: "The official and most comprehensive reference for HTML elements, attributes, and best practices.",
        difficulty: "beginner",
        tags: ["html", "mdn", "reference"],
        isFree: true,
        source: "MDN Web Docs",
    },
    {
        skillName: "HTML",
        title: "Build 3 HTML Projects for Beginners",
        type: "project",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        description: "Build a survey form, tribute page, and technical documentation page to practice HTML skills.",
        difficulty: "beginner",
        tags: ["html", "project", "practice"],
        isFree: true,
        source: "freeCodeCamp",
    },

    // ── CSS ───────────────────────────────────────────────────────────────────
    {
        skillName: "CSS",
        title: "CSS Tutorial – Zero to Hero (Complete Course)",
        type: "video",
        url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        description: "Full CSS course covering selectors, Flexbox, Grid, animations, and responsive design.",
        difficulty: "beginner",
        tags: ["css", "flexbox", "grid", "frontend"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "CSS",
        title: "CSS Tricks – A Complete Guide to Flexbox",
        type: "blog",
        url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        description: "The definitive visual guide to Flexbox — properties for parent and children with examples.",
        difficulty: "beginner",
        tags: ["css", "flexbox", "layout"],
        isFree: true,
        source: "CSS-Tricks",
    },
    {
        skillName: "CSS",
        title: "Responsive Web Design Certification",
        type: "practice",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        description: "15 practice projects to master CSS including Flexbox, Grid, and responsive design principles.",
        difficulty: "beginner",
        tags: ["css", "responsive", "practice"],
        isFree: true,
        source: "freeCodeCamp",
    },

    // ── JavaScript ────────────────────────────────────────────────────────────
    {
        skillName: "JavaScript",
        title: "JavaScript Full Course for Beginners",
        type: "video",
        url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        description: "Complete JavaScript tutorial for beginners — variables, functions, DOM, events, and ES6+.",
        difficulty: "beginner",
        tags: ["javascript", "es6", "dom", "frontend"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "JavaScript",
        title: "javascript.info – The Modern JavaScript Tutorial",
        type: "documentation",
        url: "https://javascript.info/",
        description: "A well-structured, in-depth tutorial covering all of modern JavaScript from basics to advanced topics.",
        difficulty: "intermediate",
        tags: ["javascript", "es6", "promises", "async"],
        isFree: true,
        source: "javascript.info",
    },
    {
        skillName: "JavaScript",
        title: "JavaScript Algorithms and Data Structures",
        type: "practice",
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
        description: "Practice 300+ exercises covering JavaScript fundamentals, ES6, functional programming, and algorithms.",
        difficulty: "intermediate",
        tags: ["javascript", "algorithms", "practice"],
        isFree: true,
        source: "freeCodeCamp",
    },
    {
        skillName: "JavaScript",
        title: "30 Days Of JavaScript",
        type: "project",
        url: "https://github.com/Asabeneh/30-Days-Of-JavaScript",
        description: "A 30-day JavaScript challenge covering everything from basics to advanced topics with daily exercises.",
        difficulty: "intermediate",
        tags: ["javascript", "project", "challenge"],
        isFree: true,
        source: "GitHub",
    },

    // ── React ─────────────────────────────────────────────────────────────────
    {
        skillName: "React",
        title: "React Tutorial for Beginners – Full Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        description: "Comprehensive React course covering components, hooks, props, state, context, and routing.",
        difficulty: "intermediate",
        tags: ["react", "hooks", "jsx", "frontend"],
        isFree: true,
        source: "Programming with Mosh / YouTube",
    },
    {
        skillName: "React",
        title: "Official React Documentation",
        type: "documentation",
        url: "https://react.dev/learn",
        description: "The completely rewritten official React docs with interactive examples and clear explanations of modern React.",
        difficulty: "intermediate",
        tags: ["react", "hooks", "official"],
        isFree: true,
        source: "React.dev",
    },
    {
        skillName: "React",
        title: "Build a React Project – Todo App",
        type: "project",
        url: "https://react.dev/learn/tutorial-tic-tac-toe",
        description: "Official interactive React tutorial — build a Tic-Tac-Toe game while learning state, props, and event handling.",
        difficulty: "beginner",
        tags: ["react", "project", "tutorial"],
        isFree: true,
        source: "React.dev",
    },
    {
        skillName: "React",
        title: "React – The Complete Guide (Udemy)",
        type: "course",
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        description: "Best-selling React course covering hooks, Redux, Next.js, testing, and advanced patterns.",
        difficulty: "intermediate",
        tags: ["react", "redux", "course"],
        isFree: false,
        source: "Udemy",
    },

    // ── Node.js ───────────────────────────────────────────────────────────────
    {
        skillName: "Node.js",
        title: "Node.js Tutorial for Beginners – Full Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
        description: "Learn Node.js from scratch — modules, file system, events, HTTP, npm, and building a simple server.",
        difficulty: "intermediate",
        tags: ["nodejs", "backend", "javascript"],
        isFree: true,
        source: "Programming with Mosh / YouTube",
    },
    {
        skillName: "Node.js",
        title: "Node.js Official Documentation",
        type: "documentation",
        url: "https://nodejs.org/en/docs",
        description: "Official Node.js docs — API reference for all built-in modules including http, fs, path, stream, and more.",
        difficulty: "intermediate",
        tags: ["nodejs", "docs", "api"],
        isFree: true,
        source: "nodejs.org",
    },
    {
        skillName: "Node.js",
        title: "Build a REST API with Node.js & Express",
        type: "project",
        url: "https://www.youtube.com/watch?v=l8WPWK9mS5M",
        description: "Practical project: build a complete CRUD REST API with Node.js, Express, and MongoDB.",
        difficulty: "intermediate",
        tags: ["nodejs", "express", "api", "project"],
        isFree: true,
        source: "YouTube",
    },

    // ── Express.js ────────────────────────────────────────────────────────────
    {
        skillName: "Express",
        title: "Express.js Crash Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=L72fhGm1tfE",
        description: "Quick but thorough introduction to Express — routing, middleware, error handling, and REST APIs.",
        difficulty: "intermediate",
        tags: ["express", "nodejs", "backend"],
        isFree: true,
        source: "Traversy Media / YouTube",
    },
    {
        skillName: "Express",
        title: "Express.js Official Guide",
        type: "documentation",
        url: "https://expressjs.com/en/guide/routing.html",
        description: "Official Express documentation covering routing, middleware, error handling, and API design.",
        difficulty: "intermediate",
        tags: ["express", "routing", "middleware"],
        isFree: true,
        source: "expressjs.com",
    },
    {
        skillName: "Express",
        title: "Build a Full REST API – Express + MongoDB",
        type: "practice",
        url: "https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/",
        description: "Hands-on guide to building a MongoDB-backed REST API with Express and Mongoose.",
        difficulty: "intermediate",
        tags: ["express", "mongodb", "api", "practice"],
        isFree: true,
        source: "MongoDB Developer Hub",
    },

    // ── MongoDB ───────────────────────────────────────────────────────────────
    {
        skillName: "MongoDB",
        title: "MongoDB Crash Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=-56x56UppqQ",
        description: "Fast introduction to MongoDB — CRUD operations, documents, collections, and using Mongoose.",
        difficulty: "beginner",
        tags: ["mongodb", "database", "nosql"],
        isFree: true,
        source: "Traversy Media / YouTube",
    },
    {
        skillName: "MongoDB",
        title: "MongoDB Official Documentation",
        type: "documentation",
        url: "https://www.mongodb.com/docs/manual/",
        description: "Official MongoDB manual covering installation, CRUD, aggregation pipeline, indexing, and replication.",
        difficulty: "intermediate",
        tags: ["mongodb", "docs", "aggregation"],
        isFree: true,
        source: "MongoDB Docs",
    },
    {
        skillName: "MongoDB",
        title: "MongoDB University – Free Courses",
        type: "course",
        url: "https://learn.mongodb.com/",
        description: "Official free MongoDB courses covering Atlas, aggregation, developer fundamentals, and more.",
        difficulty: "beginner",
        tags: ["mongodb", "course", "atlas"],
        isFree: true,
        source: "MongoDB University",
    },

    // ── REST API ──────────────────────────────────────────────────────────────
    {
        skillName: "REST API",
        title: "REST API Design Best Practices – Full Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=7nm1pYuKAhY",
        description: "Learn REST API design principles — endpoints, HTTP methods, status codes, versioning, and authentication.",
        difficulty: "intermediate",
        tags: ["rest", "api", "http", "backend"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "REST API",
        title: "REST API Tutorial – restfulapi.net",
        type: "blog",
        url: "https://restfulapi.net/",
        description: "Comprehensive resource explaining REST architectural style, constraints, naming conventions, and HTTP methods.",
        difficulty: "beginner",
        tags: ["rest", "api", "design"],
        isFree: true,
        source: "restfulapi.net",
    },
    {
        skillName: "REST API",
        title: "Build and Test REST APIs with Postman",
        type: "practice",
        url: "https://learning.postman.com/docs/getting-started/introduction/",
        description: "Learn to design, build, and test REST APIs using Postman — the industry-standard API testing tool.",
        difficulty: "beginner",
        tags: ["rest", "postman", "testing", "practice"],
        isFree: true,
        source: "Postman Learning Center",
    },

    // ── Git ───────────────────────────────────────────────────────────────────
    {
        skillName: "Git",
        title: "Git & GitHub Crash Course for Beginners",
        type: "video",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        description: "Learn Git and GitHub from scratch — init, add, commit, push, pull, branching, and merging.",
        difficulty: "beginner",
        tags: ["git", "github", "version-control"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "Git",
        title: "Pro Git Book (Free Online)",
        type: "documentation",
        url: "https://git-scm.com/book/en/v2",
        description: "The complete official Git book — covers basics through advanced Git internals, branching model, and server setup.",
        difficulty: "intermediate",
        tags: ["git", "book", "reference"],
        isFree: true,
        source: "git-scm.com",
    },
    {
        skillName: "Git",
        title: "Learn Git Branching – Interactive",
        type: "practice",
        url: "https://learngitbranching.js.org/",
        description: "The most visual and interactive way to learn Git branching — sandbox exercises in the browser.",
        difficulty: "beginner",
        tags: ["git", "branching", "interactive", "practice"],
        isFree: true,
        source: "learngitbranching.js.org",
    },

    // ── DSA ───────────────────────────────────────────────────────────────────
    {
        skillName: "DSA",
        title: "Data Structures and Algorithms – Full Course",
        type: "video",
        url: "https://www.youtube.com/watch?v=8hly31xKli0",
        description: "Comprehensive 5-hour DSA course covering arrays, linked lists, trees, graphs, sorting, and searching.",
        difficulty: "intermediate",
        tags: ["dsa", "algorithms", "data-structures"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "DSA",
        title: "NeetCode – DSA for Coding Interviews",
        type: "blog",
        url: "https://neetcode.io/roadmap",
        description: "The most popular DSA roadmap for coding interviews — organized by pattern with video explanations.",
        difficulty: "intermediate",
        tags: ["dsa", "leetcode", "interviews", "roadmap"],
        isFree: true,
        source: "NeetCode.io",
    },
    {
        skillName: "DSA",
        title: "LeetCode – Practice DSA Problems",
        type: "practice",
        url: "https://leetcode.com/problemset/",
        description: "2000+ coding problems to practice arrays, trees, graphs, DP, and more — used by FAANG candidates.",
        difficulty: "intermediate",
        tags: ["dsa", "leetcode", "practice", "competitive"],
        isFree: true,
        source: "LeetCode",
    },
    {
        skillName: "DSA",
        title: "JavaScript Algorithms – GitHub Repo",
        type: "project",
        url: "https://github.com/trekhleb/javascript-algorithms",
        description: "A curated collection of JavaScript implementations of algorithms and data structures with explanations.",
        difficulty: "advanced",
        tags: ["dsa", "javascript", "algorithms", "project"],
        isFree: true,
        source: "GitHub",
    },

    // ── SQL ───────────────────────────────────────────────────────────────────
    {
        skillName: "SQL",
        title: "SQL Tutorial – Full Database Course for Beginners",
        type: "video",
        url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        description: "4-hour SQL course covering SELECT, JOINs, GROUP BY, subqueries, and database design.",
        difficulty: "beginner",
        tags: ["sql", "database", "mysql", "backend"],
        isFree: true,
        source: "freeCodeCamp / YouTube",
    },
    {
        skillName: "SQL",
        title: "SQLZoo – Interactive SQL Tutorial",
        type: "practice",
        url: "https://sqlzoo.net/wiki/SQL_Tutorial",
        description: "Interactive SQL exercises in the browser — progress from basic SELECT queries to complex JOINs and subqueries.",
        difficulty: "beginner",
        tags: ["sql", "practice", "interactive"],
        isFree: true,
        source: "SQLZoo",
    },
    {
        skillName: "SQL",
        title: "PostgreSQL Documentation",
        type: "documentation",
        url: "https://www.postgresql.org/docs/current/",
        description: "Comprehensive official PostgreSQL docs — queries, indexes, transactions, and advanced features.",
        difficulty: "intermediate",
        tags: ["sql", "postgresql", "database", "docs"],
        isFree: true,
        source: "PostgreSQL.org",
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Remove previously seeded resources to avoid duplicates on re-run
        await resourceModel.deleteMany({});
        console.log("Cleared existing resources");

        const inserted = await resourceModel.insertMany(RESOURCES);
        console.log(`Seeded ${inserted.length} resources successfully`);

        await mongoose.disconnect();
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err.message);
        process.exit(1);
    }
};

seed();
