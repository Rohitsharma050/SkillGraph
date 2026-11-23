import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Clock, FileText, Paperclip } from 'lucide-react';
import { STATUSES, TAGS, TAG_CFG, STATUS_CFG, fmtDateInput, fmtDate } from '../lib/constants';

export default function JobModal({ job, defaultStatus, onSave, onClose }) {
  const [tab, setSaveTab]   = useState('basic');
  const [saving, setSaving] = useState(false);
  const overlayRef          = useRef(null);

  const [f, setF] = useState({
    company: '', role: '', status: defaultStatus || 'Wishlist',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '', jobLink: '', interviewDates: [],
    tags: [], resume: '', followUpDate: '', salary: '', location: '',
  });

  useEffect(() => {
    if (job) {
      setF({
        company: job.company || '', role: job.role || '',
        status: job.status || 'Wishlist',
        appliedDate: fmtDateInput(job.appliedDate),
        notes: job.notes || '', jobLink: job.jobLink || '',
        interviewDates: (job.interviewDates || []).map(fmtDateInput),
        tags: job.tags || [], resume: job.resume || '',
        followUpDate: fmtDateInput(job.followUpDate),
        salary: job.salary || '', location: job.location || '',
      });
    }
  }, [job]);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const handleResumeFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) setF((p) => ({ ...p, resume: file.name }));
  }, []);
  const toggleTag = (t) => setF((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.company.trim() || !f.role.trim()) {
      setSaveTab('basic');
      return;
    }
    setSaving(true);
    try { await onSave({ ...f, interviewDates: f.interviewDates.filter(Boolean) }); }
    finally { setSaving(false); }
  };

  const sc = STATUS_CFG[f.status] || {};
  const isEdit = !!job;

  const TABS = [
    { id: 'basic',    label: 'Basic'    },
    { id: 'details',  label: 'Details'  },
    { id: 'tracking', label: 'Tracking' },
    ...(isEdit && job.activityLog?.length ? [{ id: 'activity', label: 'Activity' }] : []),
  ];

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.22)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="sg-modal"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 12,
          width: '100%', maxWidth: 500, margin: '0 16px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-txt)' }}>
              {isEdit ? 'Edit application' : 'New application'}
            </span>
          </div>
          <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-txt-3)', display: 'flex', borderRadius: 6 }}>
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--c-border)', padding: '0 20px' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setSaveTab(t.id)} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--c-txt)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer', color: tab === t.id ? 'var(--c-txt)' : 'var(--c-txt-2)', transition: 'color 0.12s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── BASIC ── */}
            {tab === 'basic' && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Company *">
                  <input className="sg-input" value={f.company} onChange={set('company')} placeholder="Google" required />
                </Field>
                <Field label="Role *">
                  <input className="sg-input" value={f.role} onChange={set('role')} placeholder="Frontend Engineer" required />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Status">
                  <select className="sg-input" value={f.status} onChange={set('status')} style={{ cursor: 'pointer', color: sc.dot }}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s} style={{ color: STATUS_CFG[s]?.dot }}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Applied date">
                  <input className="sg-input" type="date" value={f.appliedDate} onChange={set('appliedDate')} />
                </Field>
              </div>
              <Field label="Notes">
                <textarea className="sg-input" value={f.notes} onChange={set('notes')} rows={4} placeholder="Notes about this application…" style={{ resize: 'none' }} />
              </Field>
            </>}

            {/* ── DETAILS ── */}
            {tab === 'details' && <>
              <Field label="Job link">
                <input className="sg-input" value={f.jobLink} onChange={set('jobLink')} placeholder="https://…" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Salary range">
                  <input className="sg-input" value={f.salary} onChange={set('salary')} placeholder="$120k–$160k" />
                </Field>
                <Field label="Location">
                  <input className="sg-input" value={f.location} onChange={set('location')} placeholder="Remote, NYC…" />
                </Field>
              </div>
              <Field label="Resume / CV">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Hidden real file input */}
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
                    border: '1px dashed var(--c-border-strong)',
                    background: 'var(--c-surface-raised)',
                    fontSize: 12, color: 'var(--c-txt-2)',
                    transition: 'border-color 0.12s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--c-txt-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--c-border-strong)'}
                  >
                    <Paperclip size={13} />
                    {f.resume ? 'Change file' : 'Choose file (.pdf / .doc / .docx)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleResumeFile}
                    />
                  </label>
                  {f.resume && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--c-txt-2)' }}>
                      <FileText size={11} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                        {f.resume}
                      </span>
                      <button
                        type="button"
                        onClick={() => setF((p) => ({ ...p, resume: '' }))}
                        style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-txt-3)', display: 'flex', borderRadius: 3 }}
                        title="Clear"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </Field>
            </>}

            {/* ── TRACKING ── */}
            {tab === 'tracking' && <>
              <Field label="Tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {TAGS.map((tag) => {
                    const tc = TAG_CFG[tag] || {};
                    const on = f.tags.includes(tag);
                    return (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, cursor: 'pointer', transition: 'all 0.12s', border: `1px solid ${on ? tc.color : 'var(--c-border)'}`, background: on ? tc.bg : 'transparent', color: on ? tc.color : 'var(--c-txt-2)' }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Follow-up date">
                <input className="sg-input" type="date" value={f.followUpDate} onChange={set('followUpDate')} />
              </Field>
              <Field label="Interview dates">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {f.interviewDates.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6 }}>
                      <input className="sg-input" type="date" value={d} onChange={(e) => setF((p) => ({ ...p, interviewDates: p.interviewDates.map((x, j) => j === i ? e.target.value : x) }))} style={{ flex: 1 }} />
                      <button type="button" onClick={() => setF((p) => ({ ...p, interviewDates: p.interviewDates.filter((_, j) => j !== i) }))} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-txt-3)', display: 'flex' }}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setF((p) => ({ ...p, interviewDates: [...p.interviewDates, ''] }))} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--c-txt-2)', background: 'none', border: 'none', cursor: 'pointer', width: 'fit-content' }}>
                    <Plus size={12} /> Add date
                  </button>
                </div>
              </Field>
            </>}

            {/* ── ACTIVITY ── */}
            {tab === 'activity' && isEdit && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[...(job.activityLog || [])].reverse().map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    <div style={{ marginTop: 6, width: 6, height: 6, borderRadius: '50%', background: 'var(--c-border-strong)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-txt)' }}>{log.action}</span>
                        <span style={{ fontSize: 10, color: 'var(--c-txt-3)', whiteSpace: 'nowrap' }}>
                          {fmtDate(log.date || log.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.detail && <p style={{ fontSize: 11, color: 'var(--c-txt-2)', marginTop: 2 }}>{log.detail}</p>}
                    </div>
                  </div>
                ))}
                {(!job.activityLog?.length) && (
                  <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: 'var(--c-txt-3)', fontSize: 12 }}>
                    <Clock size={13} /> No activity yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--c-border)', background: 'var(--c-surface-raised)' }}>
            <button type="button" onClick={onClose} className="sg-btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="sg-btn-primary">
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-txt-2)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
