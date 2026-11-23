import { useEffect } from 'react';
import { X, ExternalLink, Pencil, Trash2, Bell, Calendar, FileText, Tag } from 'lucide-react';
import { STATUS_CFG, TAG_CFG, fmtDate } from '../lib/constants';

export default function JobDetailsModal({ job, onClose, onEdit, onDelete }) {
  const sc = STATUS_CFG[job.status] || {};

  // Close on Escape
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        className="sg-modal"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 14,
          width: '100%', maxWidth: 500,
          margin: '0 16px',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--c-border)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-txt)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.company}
            </p>
            <p style={{ fontSize: 12, color: 'var(--c-txt-2)', marginTop: 3 }}>
              {job.role}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, flexShrink: 0 }}>
            {/* Status badge */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: sc.bg, fontSize: 11, fontWeight: 600, color: sc.dot }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
              {job.status}
            </span>
            <button onClick={onClose} style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-txt-3)', display: 'flex', borderRadius: 6, transition: 'color 0.12s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-txt)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-txt-3)'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--c-border-subtle)' }}>
            {job.appliedDate && (
              <MetaItem icon={<Calendar size={12} />} label="Applied">
                {fmtDate(job.appliedDate, { month: 'long', day: 'numeric', year: 'numeric' })}
              </MetaItem>
            )}
            {job.followUpDate && (
              <MetaItem icon={<Bell size={12} />} label="Follow-up">
                {fmtDate(job.followUpDate, { month: 'long', day: 'numeric', year: 'numeric' })}
              </MetaItem>
            )}
            {job.salary && (
              <MetaItem icon={null} label="Salary">{job.salary}</MetaItem>
            )}
            {job.location && (
              <MetaItem icon={null} label="Location">{job.location}</MetaItem>
            )}
          </div>

          {/* Job link */}
          {job.jobLink && (
            <Section>
              <a
                href={job.jobLink.startsWith('http') ? job.jobLink : `https://${job.jobLink}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-applied)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                <ExternalLink size={12} />
                View job posting
              </a>
            </Section>
          )}

          {/* Notes */}
          {job.notes && (
            <Section label="Notes">
              <p style={{ fontSize: 12, color: 'var(--c-txt-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {job.notes}
              </p>
            </Section>
          )}

          {/* Tags */}
          {job.tags?.length > 0 && (
            <Section label="Tags">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.tags.map((tag) => {
                  const tc = TAG_CFG[tag] || {};
                  return (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', fontSize: 11, fontWeight: 500,
                        borderRadius: 20,
                        background: tc.bg, color: tc.color,
                        border: `1px solid ${tc.color}22`,
                      }}
                    >
                      <Tag size={9} />
                      {tag}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Resume */}
          {job.resume && (
            <Section label="Resume">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--c-txt-2)' }}>
                <FileText size={12} />
                {job.resume}
              </span>
            </Section>
          )}

          {/* Interview dates */}
          {job.interviewDates?.length > 0 && (
            <Section label={`Interview Dates (${job.interviewDates.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {job.interviewDates.filter(Boolean).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--c-interview-bg)', color: 'var(--c-interview)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--c-txt-2)' }}>
                      {fmtDate(d, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--c-border)', background: 'var(--c-surface-raised)', borderRadius: '0 0 14px 14px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="sg-btn-danger"
          >
            <Trash2 size={12} />
            Delete
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="sg-btn-ghost">Close</button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="sg-btn-primary"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--c-border-subtle)' }}>
      {label && (
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-txt-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function MetaItem({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-txt-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </span>
      <span style={{ fontSize: 12, color: 'var(--c-txt)', fontWeight: 500 }}>
        {children}
      </span>
    </div>
  );
}
