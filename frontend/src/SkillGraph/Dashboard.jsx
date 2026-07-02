import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import DashboardNavbar from "../Components/DashboardNavbar";
import RoadmapHistory from "../Components/RoadmapHistory";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "MERN Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "AI/ML Engineer",
];

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  // ── User data from API ───────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ── Form state ───────────────────────────────────────────────────────────
  // Resume: "profile" | "upload"
  const [resumeSource, setResumeSource] = useState("profile");
  const [resumeFile, setResumeFile] = useState(null);

  // Role: "profile" | "new"
  const [roleSource, setRoleSource] = useState("profile");
  const [selectedRole, setSelectedRole] = useState("");

  // Update profile checkbox
  const [updateProfile, setUpdateProfile] = useState(false);

  // Generating state
  const [generating, setGenerating] = useState(false);

  // Error state
  const [generateError, setGenerateError] = useState("");

  // ── Fetch user profile ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUser(data.user);
          // Pre-select sensible defaults
          setResumeSource(data.user.resumeUrl ? "profile" : "upload");
          setRoleSource(data.user.role ? "profile" : "new");
          setSelectedRole(data.user.role || "");
        }
      } catch {
        // silently continue — form still usable
      } finally {
        setLoadingUser(false);
      }
    };
    fetch();
  }, [token]);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const firstName = user?.name?.split(" ")[0] || "";
  const avatar =
    user?.image && user.image.trim() !== "" ? user.image : DEFAULT_AVATAR;

  const hasResumeInProfile = !!(user?.resumeUrl && user.resumeUrl.trim());
  const hasRoleInProfile = !!(user?.role && user.role.trim());

  // The role that will actually be used
  const activeRole =
    roleSource === "profile" ? user?.role || "" : selectedRole;

  // Resume readiness for generation
  const resumeReady =
    resumeSource === "profile" ? hasResumeInProfile : !!resumeFile;

  // ── Roadmap generation handler ────────────────────────────────────────────
  const handleGenerateRoadmap = async () => {
    if (!activeRole || !resumeReady) return;
    setGenerateError("");

    // Build FormData so we can attach either a file or a URL
    const formData = new FormData();
    formData.append("targetRole", activeRole);
    formData.append("updateProfile", updateProfile);

    // Pass user's profile skills so backend can credit existing knowledge
    if (user?.skills?.length > 0) {
      formData.append("extractedSkills", JSON.stringify(user.skills));
    }

    if (resumeSource === "profile" && hasResumeInProfile) {
      // Tell backend to reuse the resume URL already stored in the profile
      formData.append("resumeUrl", user.resumeUrl);
    } else if (resumeSource === "upload" && resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      setGenerating(true);

      const { data } = await axios.post(
        `${backendUrl}/api/roadmaps/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        navigate(`/roadmap/${data.roadmapId}`);
      } else {
        setGenerateError(data.message || "Generation failed. Please try again.");
      }
    } catch (err) {
      console.error("Generate roadmap error:", err);
      setGenerateError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };


  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400">Loading…</p>
          </div>
        </div>
      </>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-[#f7f7f7]">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">

          {/* ── 1. Welcome Header ─────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="avatar"
              className="w-12 h-12 rounded-2xl object-cover border border-black/10 shrink-0"
            />
            <div>
              <h1 className="text-2xl font-bold text-black leading-tight">
                {firstName ? `Welcome back, ${firstName}` : "Welcome back"} 👋
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {hasRoleInProfile
                  ? `Targeting ${user.role}`
                  : "Set your target role to get started"}
              </p>
            </div>
          </div>

          {/* ── 2. What SkillGraph does ────────────────────────────────────── */}
          <div className="bg-white border border-black/10 rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
              How it works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  title: "Analyse Resume",
                  desc: "SkillGraph reads your resume and extracts your current skill set.",
                },
                {
                  step: "02",
                  title: "Compare to Role",
                  desc: "It maps your skills against what your target role requires.",
                },
                {
                  step: "03",
                  title: "Build Roadmap",
                  desc: "A dependency-aware learning path is generated — topic by topic.",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-zinc-300">
                    {item.step}
                  </span>
                  <p className="text-sm font-semibold text-black">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Generate Roadmap Form ───────────────────────────────────── */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-black">
                Generate Roadmap
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                Select your resume and target role, then hit generate.
              </p>
            </div>

            {/* ── Resume section ──────────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-black">
                Resume
              </label>

              {hasResumeInProfile ? (
                /* User already has a resume → show both options */
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 has-[:checked]:border-black has-[:checked]:bg-zinc-50 border-black/10">
                    <input
                      type="radio"
                      name="resumeSource"
                      value="profile"
                      checked={resumeSource === "profile"}
                      onChange={() => {
                        setResumeSource("profile");
                        setResumeFile(null);
                      }}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <p className="text-sm font-medium text-black">
                        Use resume from profile
                      </p>
                      <a
                        href={user.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-zinc-400 hover:text-black underline underline-offset-2 transition"
                      >
                        View uploaded resume →
                      </a>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 has-[:checked]:border-black has-[:checked]:bg-zinc-50 border-black/10">
                    <input
                      type="radio"
                      name="resumeSource"
                      value="upload"
                      checked={resumeSource === "upload"}
                      onChange={() => setResumeSource("upload")}
                      className="mt-0.5 accent-black"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">
                        Upload a different resume
                      </p>
                      {resumeSource === "upload" && (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files[0])}
                          className="mt-2 block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white file:text-xs file:font-medium hover:file:bg-zinc-800 file:cursor-pointer"
                        />
                      )}
                      {resumeSource === "upload" && resumeFile && (
                        <p className="text-xs text-zinc-400 mt-1.5">
                          {resumeFile.name}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                /* No resume in profile → just show upload */
                <div className="space-y-2">
                  <div className="p-4 rounded-xl border border-dashed border-black/20 bg-zinc-50">
                    <p className="text-xs text-zinc-500 mb-2">
                      No resume found in profile. Upload one to continue.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        setResumeFile(e.target.files[0]);
                        setResumeSource("upload");
                      }}
                      className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white file:text-xs file:font-medium hover:file:bg-zinc-800 file:cursor-pointer"
                    />
                    {resumeFile && (
                      <p className="text-xs text-zinc-400 mt-1.5">
                        {resumeFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-black/5" />

            {/* ── Role section ────────────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-black">
                Target Role
              </label>

              {hasRoleInProfile ? (
                /* User has a role → show both options */
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 has-[:checked]:border-black has-[:checked]:bg-zinc-50 border-black/10">
                    <input
                      type="radio"
                      name="roleSource"
                      value="profile"
                      checked={roleSource === "profile"}
                      onChange={() => {
                        setRoleSource("profile");
                        setSelectedRole(user?.role || "");
                      }}
                      className="accent-black"
                    />
                    <div>
                      <p className="text-sm font-medium text-black">
                        Use role from profile
                      </p>
                      <p className="text-xs text-zinc-400">{user.role}</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 has-[:checked]:border-black has-[:checked]:bg-zinc-50 border-black/10">
                    <input
                      type="radio"
                      name="roleSource"
                      value="new"
                      checked={roleSource === "new"}
                      onChange={() => setRoleSource("new")}
                      className="mt-0.5 accent-black"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">
                        Select a different role
                      </p>
                      {roleSource === "new" && (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="mt-2 w-full border border-black/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-black bg-white transition"
                        >
                          <option value="">— choose a role —</option>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                /* No role → just dropdown */
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-black bg-white transition"
                >
                  <option value="">— select target role —</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-black/5" />

            {/* ── Update profile checkbox ──────────────────────────────────── */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={updateProfile}
                onChange={(e) => setUpdateProfile(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-black rounded"
              />
              <div>
                <p className="text-sm font-medium text-black group-hover:text-zinc-700 transition">
                  Update my profile with this resume and role
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The selected resume URL and target role will be saved to your profile.
                </p>
              </div>
            </label>

            {/* ── Validation hint ──────────────────────────────────────────── */}
            {(!activeRole || !resumeReady) && (
              <p className="text-xs text-zinc-400">
                {!resumeReady && !activeRole
                  ? "Add a resume and select a target role to continue."
                  : !resumeReady
                  ? "Add a resume to continue."
                  : "Select a target role to continue."}
              </p>
            )}

            {/* ── Generate button ──────────────────────────────────────────── */}
            <button
              onClick={handleGenerateRoadmap}
              disabled={!activeRole || !resumeReady || generating}
              className="w-full py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating…
                </span>
              ) : (
                "Generate Roadmap"
              )}
            </button>

            {/* ── Inline error ─────────────────────────────────────────────── */}
            {generateError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {generateError}
              </p>
            )}
          </div>


          {/* ── 4. Roadmap History ─────────────────────────────────────── */}
          <RoadmapHistory limit={3} showHeader={true} />

        </div>
      </main>
    </>
  );
};

export default Dashboard;