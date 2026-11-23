# SkillGraph+ — B.Tech Final Year Project Presentation Content

> **Based on:** `BTech_Final_Year_Project_Presentation_Template.pptx` (21 slides) & `SkillGraph_Research_Paper_Draft_Last.docx`
> **Prepared by:** Rohit Sharma, Saurabh Kumar, Saurabh Tripathi, Samarth Srivastava
> **Guide:** Mr. Sreesh Gaur, KIET Group of Institutions
> **Affiliation:** KIET Group of Institutions, Delhi-NCR, Ghaziabad *(Affiliated to AKTU, Lucknow)*

---

## SLIDE 1 — Title Slide

| Field | Content |
|---|---|
| **Title of Project** | SkillGraph+: A Priority-Weighted Dependency Graph Framework for Personalized, Demand-Aware Skill Roadmap Generation |
| **Project Classification** | Research / Application |
| **Student Names** | Rohit Sharma · Saurabh Kumar · Saurabh Tripathi · Samarth Srivastava |
| **Guide** | Mr. Sreesh Gaur, Department of Computer Science |
| **Institute** | KIET Group of Institutions, Delhi-NCR, Ghaziabad *(Affiliated to AKTU, Lucknow)* |
| **Presentation** | Final (Second) |
| **Department** | Department of Computer Science |

---

## SLIDE 2 — Introduction

### Background
- The software development engineering (SDE) field is a rapidly evolving space with numerous, interconnected skill areas.
- For every target role (MERN, Backend, Frontend, Data Analytics), there exist prerequisite and complementary skills whose relative importance is rarely communicated to the learner in a structured way.
- Traditional curriculum resources (YouTube, Udemy, documentation) offer no sequencing — learners default to arbitrary ordering that lacks prerequisite logic.

### Motivation
- Students and early-career developers face a fundamental **information overload problem**: thousands of resources exist but no dependency-aware, personalized learning sequence.
- Existing roadmaps (e.g., roadmap.sh) are **static and generic** — they do not adapt to what the user already knows.
- A plain topological sort respects prerequisite ordering but treats all unlockable skills as equally valuable to learn next, ignoring real-world demand and role essentiality signals.

### Need for the Project
- There is no systematic, auditable, and lightweight tool that:
  1. Personalizes learning paths based on a user's existing skillset
  2. Models skill dependencies as a Directed Acyclic Graph (DAG)
  3. Prioritizes which skill to learn next based on **industry demand**, **learning difficulty**, and **role essentiality**
  4. Tracks learning progress dynamically as skills are completed

### Current Scenario
| Pain Point | Impact |
|---|---|
| No clear starting point | Learners jump between random topics |
| No prerequisite awareness | Skip fundamentals → hit conceptual walls later |
| No personalization | Same roadmap for beginners and intermediates |
| No progress tracking | No sense of completion or career direction |
| No skill gap quantification | Can't communicate readiness to employers |

---

## SLIDE 3 — Problem Statement

### Clearly Defined Problem
A typical algorithm for creating a roadmap in a personalized learning-path system based on a skill dependency graph is a **plain topological sort** that respects the prerequisite order, but considers all currently-unlockable skills to have the same learning value. This means the system cannot distinguish between a high-demand skill and a low-demand skill when both become available at the same step.

### Existing Challenges
1. **No demand-awareness:** Plain topological sort ignores industry demand data — a skill popular in 90% of job postings is treated identically to one used in 5%.
2. **No role-essentiality weighting:** Core vs. optional skills for a target role are given equal priority.
3. **Static roadmaps:** Existing tools (roadmap.sh, LinkedIn Learning) do not adapt to individual skill gaps.
4. **Black-box AI systems:** Complex ML approaches (GCN, Deep RL) sacrifice auditability for accuracy; they require large datasets and expensive infrastructure.
5. **Skill normalization:** User skills from resumes come in many forms ("ReactJS", "React.js", "React JS") — a naive comparison fails to match them to template skills.

### Why It Needs to Be Solved
> Without a demand-aware, dependency-respecting learning sequence, students invest effort in skills that are logically out-of-order or industry-irrelevant, reducing their employability and extending their time-to-job-readiness.

---

## SLIDE 4 — Objectives

### Main Objective
Extend a DAG-based skill-gap roadmap generator (**SkillGraph**) with a priority-weighted scheduling algorithm (**SkillGraph+**) that produces personalized, demand-aware, dependency-respecting learning roadmaps — while remaining **lightweight, auditable, and drop-in compatible**.

### Specific Objectives
1. **Formalize a Priority Score** for each skill node combining Difficulty, Industry Demand, and Role Essentiality into a single Node Weight formula.
2. **Design an Unlock Factor** to bonus skills that unlock many downstream skills in the DAG, incentivizing foundational skills.
3. **Implement Priority-Guided Kahn's Algorithm** as a drop-in comparator replacement within the existing topological sort, with negligible computational overhead.
4. **Evaluate computationally** — benchmark the added latency against plain topological sort across synthetic graph sizes (10–50 nodes).
5. **Evaluate empirically** — conduct a blind learner preference study (N = 20 respondents) comparing plain vs. priority-ordered roadmaps.
6. **Build a full-stack MERN platform** (SkillGraph) integrating the scheduling logic, resume-based skill extraction, progress tracking, and interactive DAG visualization.

### Expected Outcomes
- A transparent, verifiable scheduling extension that improves demand alignment by measurable Δ in avg. demand score of first-scheduled skills.
- A documented usability finding on whether learners perceive demand-ordered roadmaps as more sensible than prerequisite-only orderings.
- A production-ready full-stack web application deployable for real student use at KIET.

---

## SLIDE 5 — Literature Review

### Review of 4–6 Recent Papers

| # | Authors | Year | Method / System | Key Contribution | Limitation |
|---|---|---|---|---|---|
| [1] | Kahn, A.B. | 1962 | Topological Sort (BFS-based) | Foundational algorithm for ordering DAGs; prerequisite-safe curriculum sequencing | No priority among unlockable skills |
| [2] | Nabizadeh et al. | 2020 | Survey of PLPs | Comprehensive review of personalized learning path (PLP) methods | Not directly applicable to skill-gap roadmaps |
| [3] | Zhang, Liu & Wang | 2023 | KG + Graph Convolutional Network | Combines knowledge graphs with GCN to model concept mastery | Low auditability; high infrastructure cost |
| [4] | Cheng et al. | 2025 | GraphRAG (LLM-based) | Uses LLMs to dynamically infer graph structures for learning paths | Very high compute cost; low auditability |
| [5] | Haldar et al. | 2025 | KG + Deep Reinforcement Learning | Dynamically adjusts sequences based on learner interaction feedback | High infrastructure cost; requires large interaction datasets |
| [8] | Machado et al. | 2021 | Metaheuristics (Systematic Review) | Reviews metaheuristic curriculum sequencing; covers evolutionary & collaborative filtering methods | Complex methods; low transparency |

### Comparison of Methods

| Method | Prerequisite-Aware | Personalization Basis | Auditability | Infrastructure Cost |
|---|---|---|---|---|
| Kahn [1] | Yes | None (Array Order) | High | Very Low |
| Zhang et al. [3] | Yes | Knowledge Mastery | Low | High |
| Cheng et al. [4] | Yes | Multi-Relational | Low | Very High |
| Haldar et al. [5] | Yes | Interaction Feedback | Low | High |
| Machado et al. [8] | Yes | Learner Profile | Low | Low |
| **SkillGraph+ (Ours)** | **Yes** | **Role & Market Demand** | **High** | **Very Low** |

### Research Gap Identified
> Existing systems either (a) respect prerequisites but ignore demand (plain Kahn), or (b) model demand but sacrifice auditability and require costly infrastructure (deep RL / GCN). **No lightweight, auditable, prerequisite-respecting, demand-aware scheduler exists for skill-gap roadmap generation in small institutional deployments.**

---

## SLIDE 6 — Proposed Methodology

### Flowchart / Algorithm Overview

```
User Input (Resume PDF / Manual Skills)
        ↓
   Skill Gap Analysis
   Gap(r, K) = Req(r) \ K    ← missing skills only
        ↓
   Build Skill DAG
   G = (S, E) where edges = prerequisite relationships
        ↓
   Compute Node Weight (per skill s):
   NodeWeight(s) = 1/3 × Difficulty(s) + 1/3 × Demand(s) + 1/3 × Essentiality(s, r)
        ↓
   Compute Unlock Factor:
   UnlockFactor(s) = 1 + outDegree(s)
        ↓
   Compute Priority Score:
   PriorityScore(s) = NodeWeight(s) × UnlockFactor(s)
        ↓
   Priority-Guided Kahn's Algorithm
   (sort zero-in-degree candidates by PriorityScore DESC)
        ↓
   Output: Ordered Learning Roadmap
        ↓
   Progress Tracking → Adaptive Regeneration
```

### Formulas

**Node Weight:**
```
NodeWeight(s) = ⅓ × Difficulty(s) + ⅓ × Demand(s) + ⅓ × Essentiality(s, r)
```

**Unlock Factor:**
```
UnlockFactor(s) = 1 + outDegree(s)
```
*(Floor of 1 ensures terminal skills are not suppressed to zero)*

**Priority Score:**
```
PriorityScore(s) = NodeWeight(s) × UnlockFactor(s)
```

### Data Sources
| Factor | Source | Normalization |
|---|---|---|
| **Difficulty** | Student survey, N = 50 (1–5 scale) | Min-max → [0, 1] |
| **Demand** | Stack Overflow Developer Survey 2025 (Professional Developers only) | Min-max within role template skill set |
| **Role Essentiality** | Expert-curated tier: core (1.0), recommended (0.5), optional (0.2) | Fixed tier values |

### Technologies Used
- **Backend:** Node.js · Express.js v5 · Mongoose ODM
- **Frontend:** React 19 · Vite · Tailwind CSS v4 · Framer Motion
- **Database:** MongoDB Atlas
- **Auth:** JWT (7-day expiry) · Google OAuth 2.0
- **File Handling:** Multer (memoryStorage) → Cloudinary CDN
- **Algorithm:** Priority-Guided Kahn's Algorithm (custom comparator)

---

## SLIDE 7 — System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  React 19 + Vite + Tailwind CSS v4 + React Router DOM v7   │
│  Framer Motion (animations) · Lucide React (icons)          │
│  Context API (global auth state)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS / REST (Axios)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               EXPRESS.JS SERVER (Node.js)                    │
│                                                              │
│  Routes:                                                     │
│   POST   /api/user/register                                  │
│   POST   /api/user/login                                     │
│   POST   /api/user/google-login                              │
│   GET    /api/user/profile          [authMiddleware]         │
│   PUT    /api/user/profile          [authMiddleware + Multer]│
│   POST   /api/roadmaps/generate     [authMiddleware + Multer]│
│   GET    /api/roadmaps/             [authMiddleware]         │
│   PATCH  /api/roadmaps/:id/progress [authMiddleware]         │
│   GET    /api/resources?skill=X     [public]                 │
│                                                              │
│  Core Logic:                                                 │
│   buildRoadmapFromTemplate() — DAG traversal + priority sort │
│   generateRoadmap()          — orchestration + DB write      │
│   updateRoadmapProgress()    — incremental recomputation     │
└──────┬────────────────────────────┬───────────────────────── ┘
       │                            │
       ▼                            ▼
┌──────────────┐           ┌──────────────────────┐
│   MongoDB    │           │    Cloudinary CDN     │
│ (Mongoose)   │           │  (PDF + images)       │
│              │           └──────────────────────┘
│ Collections: │           ┌──────────────────────┐
│ • users      │           │  Google OAuth API    │
│ • roadmaps   │           │  (userinfo endpoint) │
│ • resources  │           └──────────────────────┘
└──────────────┘
```

### Key Architectural Decisions
- **Stateless REST API** — JWT-based auth enables horizontal scaling without a shared session store.
- **Template-driven DAG** — Role templates in `roadmapTemplates.js` as pure data structures; algorithm is independent of template content.
- **Memory-buffered file upload** — Multer `memoryStorage()` → Cloudinary `upload_stream`; no disk writes on the server.
- **Embedded roadmap documents** — nodes, edges, and learningSteps are embedded (not referenced) in the `roadmaps` collection, matching the always-fetch-as-unit access pattern.

---

## SLIDE 8 — Software & Hardware Requirements

### Software Requirements

| Category | Technology | Version / Detail |
|---|---|---|
| **Runtime** | Node.js | v26.3.0 |
| **Frontend Framework** | React + Vite | React 19, Vite 6 |
| **Backend Framework** | Express.js | v5 |
| **Database** | MongoDB Atlas | (managed cloud, free tier) |
| **ODM** | Mongoose | v8 |
| **Auth Libraries** | jsonwebtoken, bcrypt, google-auth-library | — |
| **File Handling** | Multer (memoryStorage), Cloudinary SDK | — |
| **CSS Framework** | Tailwind CSS | v4 |
| **Animation** | Framer Motion | — |
| **IDE** | VS Code | — |
| **Version Control** | Git + GitHub | — |
| **Package Manager** | npm | — |

### Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **CPU** | Intel Core i5 (dual-core) | Intel Core i7 / AMD Ryzen 5 (quad-core) |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 256 GB SSD | 512 GB SSD |
| **Internet** | Broadband (for MongoDB Atlas & Cloudinary) | Stable broadband ≥ 10 Mbps |
| **Browser** | Chrome 120+ / Firefox 120+ | Chrome 120+ (latest) |

---

## SLIDE 9 — Modules

### Module Breakdown

| # | Module | Responsibility |
|---|---|---|
| **1** | **Authentication Module** | Local (email + bcrypt + JWT) and Google OAuth 2.0 login/register. `authMiddleware.js` validates Bearer tokens on every protected route. |
| **2** | **User Profile Module** | CRUD operations on user profile: name, target role, skills array, profile picture (Cloudinary), resume URL. |
| **3** | **Skill Input Module** | Manual skill entry via UI form OR PDF resume upload → Cloudinary storage. *(Gemini-based text extraction: planned next iteration.)* |
| **4** | **Roadmap Generation Module** | Core engine: Gap analysis → DAG construction → Priority-Guided Kahn's Algorithm → learningSteps generation → MongoDB persistence. |
| **5** | **Progress Tracking Module** | `PATCH /api/roadmaps/:id/progress` — receives `completedNodes[]`, rebuilds prereqMap from edges, re-derives all node statuses, recalculates `progressPercentage`. |
| **6** | **Visualization Module** | React frontend renders the DAG as an interactive graph with color-coded nodes: Green (completed), Blue (available), Gray (locked). |
| **7** | **Resources Module** | Curated learning resources (videos, blogs, docs, courses) tagged by skill name. Full-text search via MongoDB text index. |
| **8** | **Roadmap History Module** | Lists all non-archived roadmaps newest-first; supports soft-delete via `isArchived` flag. |

---

## SLIDE 10 — Implementation

### Key Implementation Highlights

#### Priority-Guided Kahn's Algorithm (Core Contribution)
```javascript
// Drop-in comparator replacement in the zero-in-degree set
const sortedByPriority = availableNodes.sort((a, b) => {
  const pa = computePriorityScore(a, userSkills, role);
  const pb = computePriorityScore(b, userSkills, role);
  return pb - pa; // descending: highest priority first
});
```

#### Node Weight Formula
```javascript
function nodeWeight(skill, role) {
  const difficulty = norm(skill.difficulty);  // survey-derived, [0,1]
  const demand     = norm(skill.demand);      // Stack Overflow 2025, [0,1]
  const essentiality = getEssentiality(skill.id, role); // 1.0 / 0.5 / 0.2
  return (difficulty + demand + essentiality) / 3;
}

function priorityScore(skill, role) {
  const nw = nodeWeight(skill, role);
  const uf = 1 + outDegree(skill.id); // Unlock Factor
  return nw * uf;
}
```

#### Roadmap Generation Flow
```javascript
// buildRoadmapFromTemplate() — O(V log V + E)
const completedIds = new Set(allUserSkills.map(norm).filter(s => templateSkillSet.has(s)));
const prereqMap = {};
for (const edge of edges) {
  if (edge.relation === "prerequisite") {
    if (!prereqMap[edge.to]) prereqMap[edge.to] = [];
    prereqMap[edge.to].push(edge.from);
  }
}
// Assign node statuses
for (const node of nodes) {
  const prereqs = prereqMap[node.id] || [];
  const allDone = prereqs.every(pid => completedIds.has(pid));
  node.status = completedIds.has(node.id) ? "completed"
              : (prereqs.length === 0 || allDone) ? "available" : "locked";
}
```

#### Authentication Middleware
```javascript
// authMiddleware.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.id; // injected for all downstream controllers
```

### Screenshots *(to be inserted in actual PPTX)*
- [ ] Login / Register page
- [ ] Profile page (skill entry form)
- [ ] Roadmap generation form (role selector)
- [ ] Interactive DAG visualization (color-coded nodes)
- [ ] Progress tracking UI (mark complete / unlock)
- [ ] Resource catalog by skill

---

## SLIDE 11 — Results & Discussion

### Computational Overhead Benchmark

> All benchmarks run on synthetic random DAGs, 200 trials per size, Node.js runtime.

| Graph Size (Nodes) | Plain Sort (ms) | Priority Sort (ms) | Relative Overhead |
|---|---|---|---|
| 10 | 0.0038 | 0.0092 | +143.8% |
| 20 | 0.0066 | 0.0217 | +226.6% |
| 30 | 0.0099 | 0.0382 | +284.3% |
| 50 | 0.0173 | 0.0945 | +445.6% |

> ✅ **All absolute latency additions remain < 0.1 ms** — imperceptible in production (real graphs: 12–60 nodes).

### Demand Quality Comparison (Avg. Demand Score of First 5 Scheduled Skills)

| Profile | Plain Order (first 5) | SkillGraph+ Order (first 5) | Avg. Plain | Avg. Priority | Δ |
|---|---|---|---|---|---|
| P1: HTML/CSS → MERN | JS → Git → React → Node.js → Express.js | JS → Node.js → Express.js → Git → REST APIs | 0.608 | 0.669 | **+0.061** |
| P2: JS only → MERN | HTML → CSS → Git → React → Node.js | Node.js → Express.js → HTML → Git → REST APIs | 0.760 | 0.645 | **−0.115** |
| P3: beginner → Data Analyst | Excel → SQL → Git → REST APIs → Pandas | Excel → SQL → Git → REST APIs → Pandas | 0.829 | 0.829 | **0.000** |

### Learner Preference Study (Blind, N = 18 valid respondents)

| Metric | Result |
|---|---|
| Valid Respondents | 18 (of 20; 2 excluded on P3 attention check) |
| Total Evaluations (P1 + P2) | 36 |
| Preferred SkillGraph+ (Priority) | 13 / 36 **(36.1%)** |
| Preferred Plain Topological Order | 22 / 36 **(61.1%)** |
| No Preference | 1 / 36 (2.8%) |
| Avg. Clarity — Priority Preferred | 4.15 / 5.0 |
| Avg. Clarity — Plain Preferred | 4.41 / 5.0 |
| Statistical Significance | p = 0.143 (not significant at α = 0.05) |

### Per-Profile Preference Breakdown

| Profile | Priority Preferred | Plain Preferred | No Pref. |
|---|---|---|---|
| P1: HTML/CSS → MERN | 8/18 (44.4%) | 10/18 (55.6%) | 0 |
| P2: JS only → MERN | 5/18 (27.8%) | 12/18 (66.7%) | 1/18 (5.6%) |

### Key Finding
> The priority-guided scheduling optimizes the demand metric (P1: +0.061 Δ) but learners **strongly prefer the plain topological order** (61.1% vs. 36.1%). Both groups reasoned about different but self-consistent pedagogical models. The preference gap is **not statistically significant** (p = 0.143) at this sample size — indicative, not conclusive.

---

## SLIDE 12 — Cost Estimation

### Project Cost Breakdown

| Item | Detail | Estimated Cost |
|---|---|---|
| **Software / Licenses** | All open-source (React, Node.js, Express, MongoDB, Tailwind) | ₹ 0 |
| **MongoDB Atlas** | Free tier (M0 cluster, 512 MB storage) | ₹ 0 |
| **Cloudinary** | Free tier (25 GB storage, 25 GB bandwidth/month) | ₹ 0 |
| **Google OAuth** | Free (Google Cloud free tier) | ₹ 0 |
| **Hosting (Development)** | Localhost / VS Code local server | ₹ 0 |
| **Hosting (Production – estimate)** | Render.com / Railway (free tier) or DigitalOcean Droplet ($6/mo) | ₹ 0 – ₹ 504/month |
| **Domain Name** | Optional — .tech or .in domain | ₹ 800–₹ 1,200/year |
| **Hardware** | Developer laptops (personal, not project-specific) | ₹ 0 (existing) |
| **Student Survey (N=50)** | Google Forms — no cost | ₹ 0 |
| **Preference Study (N=20)** | Google Forms — no cost | ₹ 0 |
| **Miscellaneous** | Internet, electricity | ₹ 500 |
| **Total Estimated Cost** | | **₹ 500 – ₹ 2,200** |

> 🟢 **The project is effectively zero-cost during development**, leveraging all free tiers of cloud services.

---

## SLIDE 13 — Project Complexity

### Technical Complexity
- **Algorithm Design:** Extending Kahn's Algorithm with a priority comparator on zero-in-degree nodes; ensuring topological correctness is preserved while introducing demand-awareness.
- **DAG Integrity:** Guaranteeing acyclicity across 7 role templates (11–60 nodes, 12+ edges each); handling multi-dependency convergence (many-to-one prerequisite relationships).
- **Skill Normalization:** Consistent `norm()` function (lowercase + trim) applied at every skill comparison point to prevent mismatch between resume-extracted and template skills.

### Algorithm Complexity
| Operation | Time Complexity |
|---|---|
| Build completedIds Set | O(V) |
| Build prereqMap | O(E) |
| Assign node statuses | O(V × P) ≈ O(V + E) |
| Sort missing skills by priority | O(V log V) |
| Generate learningSteps | O(V) |
| MongoDB write | O(V + E) |
| **Total (Roadmap Generation)** | **O(V log V + E)** |
| Progress update | O(V + E) |

*In practice: V ≤ 60, E ≤ 70 — generation completes in < 1 ms; MongoDB I/O is the dominant cost.*

### Database Complexity
- **Embedded document pattern** — nodes[], edges[], learningSteps[] embedded in each roadmap document; eliminates JOIN-equivalent overhead.
- **Indexes:** `{ userId: 1 }`, `{ targetRole: 1 }`, `{ createdAt: -1 }` on roadmaps; text index on resources.
- **FormData + JSON mixed payload** — binary file + JSON arrays in single multipart request; handled by Multer + `JSON.parse()` on server.

### UI/UX Complexity
- **Interactive DAG Visualization** — dynamic graph rendering with color-coded node status (completed / available / locked); real-time updates on skill completion.
- **Responsive Design** — Tailwind CSS v4 utility-first layout with Framer Motion micro-animations.
- **Dual Auth Flows** — Local JWT + Google OAuth UI, with provider-aware error handling.

### Integration Complexity
- **Dual Authentication Providers** — `authProvider` field gates login method; Google login upserts without conflict.
- **Memory-Buffered Upload Pipeline** — Multer `memoryStorage()` → Cloudinary `upload_stream`; file never touches disk.
- **Adaptive Roadmap Regeneration** — Stateless endpoint recalculates `Gap(r, K)` and re-runs priority scheduler on skill-completion events.

### Deployment Complexity
- **Stateless API** — Horizontal scaling supported; no shared session store required.
- **Environment Variables** — `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `GOOGLE_CLIENT_ID` managed per environment.

---

## SLIDE 14 — Relevance to Environment & SDGs

### a) Relevance to Environment
SkillGraph+ is a **100% digital, cloud-native solution** with no physical materials or hardware requirements. It reduces the need for:
- Printed curriculum guides and textbooks
- In-person counseling and coaching sessions
- Physical classroom infrastructure for career guidance

### b) Applicable Sustainable Development Goals (SDGs)

| SDG | Relevance |
|---|---|
| **SDG 4: Quality Education** | Provides equitable, personalized, self-paced learning paths that democratize access to structured career education for students across all socioeconomic backgrounds. |
| **SDG 8: Decent Work and Economic Growth** | Bridges the skill gap between students and industry expectations, improving employability and alignment with market demand in the software engineering sector. |
| **SDG 9: Industry, Innovation and Infrastructure** | Demonstrates an innovative application of graph theory (DAG + topological sort) and industry data (Stack Overflow Survey 2025) to address a real-world educational infrastructure gap. |
| **SDG 10: Reduced Inequalities** | By making structured career roadmaps freely accessible, it reduces the inequality between students with access to mentors/coaching and those without. |

### c) Evidence of Addressing SDGs
- **Published/Communicated Research Paper:** *SkillGraph+: A Priority-Weighted Dependency Graph Framework for Personalized, Demand-Aware Skill Roadmap Generation* — submitted/communicated.
- **Student Survey Conducted:** N = 50 student respondents for difficulty data; N = 20 for preference study — demonstrating stakeholder engagement.
- **Open-Source Code Repository:** GitHub (Rohitsharma050/SkillGraph) — publicly accessible for reproducibility.

### d) Ethics & Safety
| Category | Status |
|---|---|
| **Human Participants** | All survey participants gave informed consent. Responses are anonymous. Ethics exemption granted by KIET Ethics Committee (minimal risk study). |
| **Safety & Environment** | No physical risks; fully digital software project. |
| **Conflict of Interest** | None declared. Stack Overflow dataset is publicly available. |
| **Data Availability** | Survey difficulty data and preference study results documented in the research paper; Stack Overflow 2025 Developer Survey is publicly available at survey.stackoverflow.co/2025. |

---

## SLIDE 15 — Applications

### Primary Application Domain: Education Technology (EdTech)

| Application Area | Specific Use Case |
|---|---|
| **Higher Education** | University CS departments can integrate SkillGraph+ for structured, role-specific curriculum guidance for students in their final years. |
| **Self-Paced Learners** | Bootcamp students and self-taught developers use it to generate personalized roadmaps from their current skillset toward a target role. |
| **Career Transition** | Professionals switching from non-tech fields use it to identify and fill skill gaps for software engineering roles. |
| **Corporate Training** | Organizations onboarding junior engineers can use it to generate structured training paths aligned with company technology stacks. |
| **Placement Preparation** | Students preparing for campus placements can generate role-specific roadmaps (MERN, Data Analyst) aligned with industry demand. |

### Supported Target Roles (7 Templates)
- Full Stack Developer
- Frontend Developer
- Backend Developer
- MERN Stack Developer
- Software Engineer
- Data Analyst
- AI/ML Engineer

### Broader Societal Impact
- **Democratizes** structured career guidance — currently available only to students with access to mentors or expensive coaching.
- **Reduces time-to-employment** by ensuring learners focus on high-demand, role-essential skills first.
- **Bridges the industry-academia gap** by using empirical industry data (Stack Overflow 2025) to drive learning priorities.

---

## SLIDE 16 — Advantages & Limitations

### Advantages

| Advantage | Detail |
|---|---|
| **Personalized** | Roadmap computed from user's actual skills, not a generic template — adapts to what each user already knows. |
| **Demand-Aware** | Priority Score integrates real industry demand data (Stack Overflow 2025) — high-demand skills are scheduled first when prerequisites allow. |
| **Auditable / Transparent** | Every scheduling decision traces back to specific, publicly verifiable input values (difficulty survey, Stack Overflow %, role tiers). No black-box weights. |
| **Lightweight** | Drop-in comparator change to existing Kahn's algorithm — absolute added latency < 0.1 ms at production graph sizes. |
| **Prerequisite-Safe** | DAG guarantees topological correctness — no skill is ever scheduled before its prerequisites. |
| **Adaptive** | Stateless regeneration on every skill-completion event; roadmap updates dynamically as learner progresses. |
| **Zero Infrastructure Cost** | Runs entirely on free-tier cloud services (MongoDB Atlas, Cloudinary, Render) — zero hosting cost during development. |
| **Full-Stack Integration** | End-to-end MERN implementation with interactive DAG visualization, JWT auth, Google OAuth, resume upload, and progress tracking. |

### Limitations

| Limitation | Detail |
|---|---|
| **Weighting Simplification** | Equal ⅓/⅓/⅓ weighting in NodeWeight formula is stated, not calibrated — a sensitivity analysis of weight distributions is future work. |
| **Expert-Judgment Defaults** | Demand scores for Git, REST APIs, Excel, Pandas are fixed expert-judgment values, not directly from the Stack Overflow survey. |
| **Sample Size & Bias** | Difficulty survey (N = 50) and preference study (N = 20) are convenience samples from one institutional network — not generalizable. |
| **Preference Study Not Significant** | p = 0.143 — the 61.1% preference for plain ordering is directional, not statistically confirmed at α = 0.05. |
| **Domain Scope** | Results apply to MERN and Data Analyst templates; generalizability to Frontend/Backend templates is not empirically confirmed. |
| **Resume Parsing (Planned)** | Gemini API-based PDF skill extraction is architected but not yet integrated (TODO marked in codebase). |
| **No Rate Limiting** | Production hardening (express-rate-limit, express-validator) is pending. |
| **Dataset Dependency** | Accuracy of demand-awareness depends on Stack Overflow survey representativeness of the target job market. |

---

## SLIDE 17 — Future Scope

### Near-Term (Next Iteration)
1. **Complete Resume Parsing Pipeline** — Integrate `pdf-parse` + Google Gemini API for automatic skill extraction from uploaded PDFs. Infrastructure (Cloudinary upload, `TODO` hook) already in place.
2. **Resource Linking per Learning Step** — Populate `resources: []` in each `learningStep` with curated resource IDs from the Resources collection.
3. **Rate Limiting & Input Validation** — Add `express-rate-limit` and `express-validator` for production hardening.
4. **Sensitivity Analysis of Weighting Scheme** — Investigate robustness of the ⅓/⅓/⅓ equal-weighting assumption by testing alternative weight distributions.

### Medium-Term
5. **Dynamic Demand from Job Board APIs** — Replace fixed expert-judgment demand scores with live signals from official job-board APIs (LinkedIn, Indeed) or licensed labor-market data providers.
6. **AI-Generated Explanations (Gemini)** — Use Gemini to generate personalized, conversational roadmap explanations instead of template-based strings.
7. **Custom Role Input** — Allow users to specify any arbitrary target role; Gemini dynamically generates an appropriate skill DAG.
8. **Roadmap Sharing** — Public roadmap URLs with read-only view for portfolio use.
9. **Peer Comparison** — Anonymized skill gap analytics: "X% of MERN developers at your level also learned Docker next."

### Long-Term
10. **Mobile App** — React Native port using the same REST API backend.
11. **GitHub Integration** — Analyze commit history and programming languages to auto-detect existing skills.
12. **SkillExtract Study** — Dedicated evaluation of LLM-based resume parsing accuracy (precision and recall vs. manually labelled ground-truth resumes).
13. **Job Board Integration** — Dynamically derive required skill sets from real job postings via scraping or API.
14. **Learning Path Optimization via A/B Testing** — Use historical completion data to identify orderings with the highest completion rates.
15. **Skill Endorsement** — Allow peers or mentors to validate completed skills, adding social proof to the progress tracking.

---

## SLIDE 18 — Project Outcomes

### Research Paper
| Field | Detail |
|---|---|
| **Title** | SkillGraph+: A Priority-Weighted Dependency Graph Framework for Personalized, Demand-Aware Skill Roadmap Generation |
| **Authors** | Rohit Sharma, Saurabh Kumar, Saurabh Tripathi, Samarth Srivastava, Sreesh Gaur |
| **Status** | Communicated / Under Review |
| **DOI** | *(To be assigned upon publication)* |

### Code Repository
| Field | Detail |
|---|---|
| **Platform** | GitHub |
| **Repository** | Rohitsharma050/SkillGraph |
| **Stack** | MERN (MongoDB · Express.js · React · Node.js) |
| **Status** | Active development |

### Patent
| Field | Detail |
|---|---|
| **Status** | *(Not filed — potential future work)* |

### Dataset / Survey Instruments
| Field | Detail |
|---|---|
| **Difficulty Survey** | N = 50 student respondents; 12-skill rating (1–5 scale) |
| **Preference Study** | N = 20 respondents (18 valid); blind A/B comparison |
| **External Dataset** | Stack Overflow Developer Survey 2025 (Professional Developers segment) |

---

## SLIDE 19 — Conclusion

### Objectives Achieved
1. ✅ Formalized a **Priority Score** (NodeWeight × UnlockFactor) integrating Difficulty, Demand, and Role Essentiality.
2. ✅ Implemented **Priority-Guided Kahn's Algorithm** as a drop-in comparator replacement — computationally verified at < 0.1 ms absolute overhead.
3. ✅ Built a **full-stack MERN platform** (SkillGraph) with JWT auth, Google OAuth, Cloudinary file handling, interactive DAG visualization, and progress tracking.
4. ✅ Conducted a **computational benchmark** (200 trials × 4 graph sizes) demonstrating negligible absolute overhead.
5. ✅ Conducted a **blind learner preference study** (N = 18 valid) revealing a directional (not statistically significant) preference for plain topological order.

### Key Contributions
- A **transparent, auditable, demand-aware scheduling extension** to a plain DAG-based skill roadmap generator.
- A **methodical data-sourcing framework** explicitly distinguishing measured data (student survey, Stack Overflow) from expert-judgment defaults.
- A **useful negative empirical result**: demand-weighted scheduling aligns better with industry metrics but is less intuitively preferred by learners without pedagogical explanation — a finding that informs future roadmap tool design.
- A **production-ready full-stack application** deployable for real student use at KIET and beyond.

### Final Remarks
> *SkillGraph+ demonstrates that graph theory, combined with transparent industry data, can power a lightweight yet effective skill roadmap generator. The core finding — that metric optimization and learner perception can diverge — is itself a valuable contribution to EdTech design, suggesting that demand-weighted orderings should be accompanied by explanations to be pedagogically meaningful.*

---

## SLIDE 20 — References (IEEE Format)

1. A. B. Kahn, "Topological sorting of large networks," *Communications of the ACM*, vol. 5, no. 11, pp. 558–562, 1962. DOI: 10.1145/368996.369025.

2. A. H. Nabizadeh et al., "Learning path personalization and recommendation methods: A survey of the state-of-the-art," *Expert Systems with Applications*, vol. 159, p. 113596, 2020. DOI: 10.1016/j.eswa.2020.113596.

3. X. Zhang, S. Liu, and H. Wang, "Personalized Learning Path Recommendation for E-Learning Based on Knowledge Graph and Graph Convolutional Network," *International Journal of Software Engineering and Knowledge Engineering*, vol. 33, no. 1, pp. 109–131, 2023. DOI: 10.1142/S0218194022500681.

4. X. Cheng et al., "Education-Oriented Graph Retrieval-Augmented Generation for Learning Path Recommendation," *arXiv preprint*, arXiv:2506.22303, 2025. DOI: 10.48550/arXiv.2506.22303.

5. S. Haldar et al., "Personalized Learning Path Recommendation using Graph Reinforcement Learning," *Procedia Computer Science*, vol. 258, pp. 3480–3489, 2025. DOI: 10.1016/j.procs.2025.04.604.

6. A. Madhumitha, N. Ramya, M. Prasad, and S. Charan, "AI Personalized Learning Path Generator," *International Journal of Creative and Open Research in Engineering and Management*, vol. 2, no. 4, 2026. DOI: 10.55041/ijcope.v2i4.022.

7. Y. Pang et al., "Prerequisite-related MOOC recommendation on learning path locating," *Computational Social Networks*, vol. 6, no. 1, p. 7, 2019. DOI: 10.1186/s40649-019-0067-0.

8. M. O. C. Machado et al., "Metaheuristic-based adaptive curriculum sequencing approaches: a systematic review and mapping of the literature," *Artificial Intelligence Review*, vol. 54, no. 1, pp. 711–754, 2021. DOI: 10.1007/s10462-020-09864-z.

9. Stack Overflow, "2025 Stack Overflow Developer Survey — Technology," 2025. [Online]. Available: https://survey.stackoverflow.co/2025

10. A. Radermacher and G. Walia, "Gaps between industry expectations and the abilities of graduates," in *Proc. of the 44th ACM Technical Symposium on Computer Science Education (SIGCSE '13)*, 2013, pp. 71–76. DOI: 10.1145/2445196.2445225.

11. J. Shen, "Set-to-Sequence Ranking-Based Concept-Aware Learning Path Recommendation," *arXiv preprint*, arXiv:2306.04234, 2023. DOI: 10.48550/arXiv.2306.04234.

12. H. Phan et al., "Understanding the Skills Gap between Higher Education Institutions and the Software Engineering Industry," *arXiv preprint*, arXiv:2604.26655, 2026. DOI: 10.48550/arXiv.2604.26655.

13. L.-Y. Zhou and Y.-Y. Wang, "Simulation of personalized English learning path recommendation system based on knowledge graph and deep reinforcement learning," *Scientific Reports*, vol. 15, no. 1, p. 34554, 2025. DOI: 10.1038/s41598-025-17918-x.

14. V. Vanitha, P. Krishnan, and R. Elakkiya, "Collaborative optimization algorithm for learning path construction in E-learning," *Computers & Electrical Engineering*, vol. 77, pp. 325–338, 2019. DOI: 10.1016/j.compeleceng.2019.06.016.

15. D. Nguyen and T. Nguyen, "Knowledge Graph Mining-Based Personalized Learning Path Recommendation for English Learning," in *Knowledge Discovery, Knowledge Engineering and Knowledge Management*, Springer, 2026, pp. 64–81. DOI: 10.1007/978-3-032-06878-1_4.

---

## SLIDE 21 — Thank You

> **Thank You for Your Attention!**
> *Questions & Answers*

**Team SkillGraph+**

| Name | Roll No. | Email |
|---|---|---|
| Rohit Sharma | 237CS1025 | rohit.237cs1025@kiet.edu |
| Saurabh Kumar | 2327CS1171 | saurabh.2327cs1171@kiet.edu |
| Saurabh Tripathi | 2327CS1153 | saurabh.2327cs1153@kiet.edu |
| Samarth Srivastava | 2327CS1009 | samarth.2327cs1009@kiet.edu |

**Guide:** Mr. Sreesh Gaur | sreesh.gaur@kiet.edu

**Department of Computer Science**
KIET Group of Institutions, Delhi-NCR, Ghaziabad
*(Affiliated to Dr. A.P.J. Abdul Kalam Technical University, Lucknow)*

---

## Quick Reference: Template → Content Mapping

| Slide # | Template Slot | Content Source |
|---|---|---|
| 1 | Title Slide | Research paper header + template fields |
| 2 | Introduction | Interview Overview §1–3 + Research Paper §I |
| 3 | Problem Statement | Research Paper §I, §III-A + Interview Overview §2 |
| 4 | Objectives | Research Paper §I (contributions) + Interview Overview §4 |
| 5 | Literature Review | Research Paper §II + Table I (comparison) |
| 6 | Proposed Methodology | Research Paper §III (B–D) + Interview Overview §13 |
| 7 | System Architecture | Interview Overview §5 + Research Paper §IV |
| 8 | Software & Hardware | Interview Overview §6 (tech tables) |
| 9 | Modules | Interview Overview §4 (workflow) + Research Paper §IV |
| 10 | Implementation | Interview Overview §13 (code snippets) + Research Paper §IV |
| 11 | Results & Discussion | Research Paper §V (all tables + preference study) |
| 12 | Cost Estimation | Derived from free-tier service usage + project scope |
| 13 | Project Complexity | Interview Overview §14 (complexity table) + §16 (challenges) |
| 14 | SDGs | Research Paper §III-E (ethics) + SDG mapping |
| 15 | Applications | Interview Overview §1 + Research Paper §I |
| 16 | Advantages & Limitations | Research Paper §VI + Interview Overview §17 |
| 17 | Future Scope | Interview Overview §18 + Research Paper §VII |
| 18 | Project Outcomes | Research Paper header (authors, affiliation) |
| 19 | Conclusion | Research Paper §VII + Interview Overview §19 |
| 20 | References | Research Paper References (15 papers, IEEE format) |
| 21 | Thank You | Team contact info |
