import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../Context/AppContext";
import DashboardNavbar from "../Components/DashboardNavbar";

// ── Predefined options ──────────────────────────────────────────────────────
const roleOptions = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "MERN Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Designer",
];

const skillOptions = [
  "C++", "C", "Java", "Python", "JavaScript", "TypeScript",
  "React", "Next.js", "Vue.js", "Angular",
  "Node.js", "Express", "FastAPI", "Django",
  "MongoDB", "SQL", "PostgreSQL", "Firebase",
  "DSA", "OOPS", "DBMS", "OS", "Computer Networks",
  "Git", "Docker", "Kubernetes", "REST API", "GraphQL",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Tailwind CSS", "Bootstrap", "Figma",
];

// ── Default avatar ──────────────────────────────────────────────────────────
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// ── Helper: pick the right avatar ──────────────────────────────────────────
const resolveAvatar = (image) => {
  if (image && image.trim() !== "") return image;
  return DEFAULT_AVATAR;
};

// ───────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const { token, backendUrl } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  // ── User state ────────────────────────────────────────────────────────────
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
    resumeUrl: "",
    skills: [],
    authProvider: "local",
  });

  // ── Edit state (local while editing) ─────────────────────────────────────
  const [editData, setEditData] = useState({ ...userData });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // ── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserData(data.user);
        setEditData(data.user);
      } else {
        setError(data.message || "Failed to load profile.");
      }
    } catch (err) {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle skill ──────────────────────────────────────────────────────────
  const toggleSkill = (skill) => {
    setEditData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // ── Image file change ─────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Resume file change ────────────────────────────────────────────────────
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
  };

  // ── Enter edit mode ───────────────────────────────────────────────────────
  const handleEdit = () => {
    setEditData({ ...userData });
    setImageFile(null);
    setImagePreview("");
    setResumeFile(null);
    setSkillSearch("");
    setIsEdit(true);
  };

  // ── Cancel edit ───────────────────────────────────────────────────────────
  const handleCancel = () => {
    setIsEdit(false);
    setImageFile(null);
    setImagePreview("");
    setResumeFile(null);
    setSkillSearch("");
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("role", editData.role);
      formData.append("skills", JSON.stringify(editData.skills));

      if (imageFile) formData.append("image", imageFile);
      if (resumeFile) formData.append("resume", resumeFile);

      const { data } = await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setUserData(data.user);
        setIsEdit(false);
        setImageFile(null);
        setImagePreview("");
        setResumeFile(null);
      } else {
        setError(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setError("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Displayed avatar (edit: show preview or saved; view: saved) ───────────
  const displayedAvatar = isEdit
    ? imagePreview || resolveAvatar(userData.image)
    : resolveAvatar(userData.image);

  // ── Skills filtered by search (only in edit mode) ─────────────────────────
  const filteredSkillOptions = skillOptions.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Loading profile…</p>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardNavbar />

      <div className="min-h-screen bg-[#f7f7f7] px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-black/10 overflow-hidden shadow-sm">

          {/* ── Header Banner ─────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-black via-zinc-900 to-zinc-600 px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* Avatar */}
              <div className="relative group w-32 h-32 shrink-0">
                <img
                  src={displayedAvatar}
                  alt="profile"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white bg-white"
                />
                {isEdit && (
                  <label
                    htmlFor="image-upload"
                    className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-xs font-medium text-center px-2">
                      Change Photo
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Name / Email / Role */}
              <div className="text-white flex-1">
                {isEdit ? (
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full max-w-xs bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-2 text-2xl font-bold outline-none focus:border-white transition"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {userData.name || "—"}
                  </h1>
                )}

                <p className="text-zinc-300 mt-2 text-sm">{userData.email}</p>

                {isEdit ? (
                  <select
                    value={editData.role}
                    onChange={(e) =>
                      setEditData({ ...editData, role: e.target.value })
                    }
                    className="mt-4 px-4 py-2 rounded-full bg-white text-black text-sm font-medium outline-none cursor-pointer"
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="inline-block mt-4 px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium">
                    {userData.role || "No role set"}
                  </p>
                )}
              </div>

              {/* Edit / Cancel button */}
              <div className="md:ml-auto flex gap-3">
                {isEdit ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-4 text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}
          </div>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div className="p-6 md:p-10 grid md:grid-cols-2 gap-6">

            {/* ── Basic Details ────────────────────────────────────────────── */}
            <div className="border border-black/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-5">Basic Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500">Name</p>
                  {isEdit ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-black/10 outline-none focus:border-black transition"
                    />
                  ) : (
                    <p className="font-medium mt-1">{userData.name || "—"}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="font-medium mt-1">{userData.email}</p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Role</p>
                  {isEdit ? (
                    <select
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-black/10 outline-none bg-white focus:border-black transition"
                    >
                      <option value="">Select Role</option>
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium mt-1">
                      {userData.role || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Login Provider</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium capitalize">
                    {userData.authProvider}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Resume ───────────────────────────────────────────────────── */}
            <div className="border border-black/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-5">Resume</h2>

              <div className="border border-dashed border-black/20 rounded-2xl p-6">
                {userData.resumeUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">Resume uploaded</p>
                      <a
                        href={userData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-black transition underline"
                      >
                        View / Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm">No resume uploaded</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Upload your resume to showcase your experience.
                    </p>
                  </>
                )}

                {isEdit && (
                  <div className="mt-5">
                    <label className="text-sm font-medium text-zinc-700">
                      {userData.resumeUrl ? "Replace Resume" : "Upload Resume"}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="mt-2 block w-full text-sm text-zinc-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-black file:text-white file:text-sm file:font-medium hover:file:bg-zinc-800 file:cursor-pointer transition"
                      onChange={handleResumeChange}
                    />
                    {resumeFile && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Selected: {resumeFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Skills ───────────────────────────────────────────────────── */}
            <div className="md:col-span-2 border border-black/10 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold">Skills</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isEdit
                      ? "Toggle skills to add or remove them from your profile."
                      : "Skills saved in your profile."}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-sm font-medium">
                  {isEdit ? editData.skills.length : userData.skills.length} selected
                </span>
              </div>

              {/* View mode: show DB skills as badges */}
              {!isEdit && (
                <>
                  {userData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-sm">
                      No skills added yet. Click <strong>Edit Profile</strong> to add skills.
                    </p>
                  )}
                </>
              )}

              {/* Edit mode: search + full grid */}
              {isEdit && (
                <>
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills…"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-black mb-5 transition text-sm"
                  />

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSkillOptions.map((skill) => {
                      const selected = editData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
                            selected
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-black/10 hover:border-black/40"
                          }`}
                        >
                          <span>{skill}</span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              selected
                                ? "bg-white text-black"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {selected ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Save button inside skills section too */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-xl border border-black/10 text-black font-medium hover:bg-zinc-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;