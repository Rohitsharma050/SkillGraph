import { Pencil, Trash2, ExternalLink, Bell } from 'lucide-react';
import { STATUS_CFG, TAG_CFG, fmtDate, isOverdue, isDueSoon } from '../lib/constants';

export default function JobCard({ job, isDragging, onEdit, onDelete, onViewDetails }) {
  const sc = STATUS_CFG[job.status] || {};

  const reminderOver = isOverdue(job.followUpDate);
  const reminderSoon = !reminderOver && isDueSoon(job.followUpDate);

  return (
    <div
      onClick={() => !isDragging && onViewDetails && onViewDetails()}
      style={{
        position: 'relative',
        background: 'var(--c-surface)',
        border: `1px solid ${isDragging ? 'var(--c-border-strong)' : 'var(--c-border)'}`,
        borderRadius: '8px',
        padding: '10px 10px 10px 14px',
        cursor: isDragging ? 'grabbing' : 'pointer',
        boxShadow: isDragging ? '0 4px 16px rgba(0,0,0,0.10)' : 'none',
        transform: isDragging ? 'rotate(1deg)' : 'none',
        transition: 'border-color 0.12s, box-shadow 0.15s, transform 0.12s',
        userSelect: 'none',
      }}
      className="group sg-job-card"
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)';
          e.currentTarget.style.borderColor = 'var(--c-border-strong)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--c-border)';
        }
      }}
    >
      {/* Left status stripe */}
      <div
        style={{
          position: 'absolute', left: 0, top: 10, bottom: 10,
          width: '3px', borderRadius: '0 3px 3px 0',
          background: sc.dot,
        }}
      />

      {/* Top row: company + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-txt)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {job.company}
        </span>

        {/* Hover actions */}
        <div
          className="sg-card-actions"
          style={{ display: 'flex', gap: '1px', opacity: 0, transition: 'opacity 0.12s' }}
          onMouseEnter={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {job.jobLink && (
            <a
              href={job.jobLink.startsWith('http') ? job.jobLink : `https://${job.jobLink}`}
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '3px', color: 'var(--c-txt-3)', borderRadius: '4px', display: 'flex' }}
              title="Open link"
            >
              <ExternalLink size={11} />
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ padding: '3px', color: 'var(--c-txt-3)', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
            title="Edit"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: '3px', color: 'var(--c-txt-3)', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
            title="Delete"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-rejected)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-txt-3)'}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Role */}
      <p style={{ fontSize: '11px', color: 'var(--c-txt-2)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.role}
      </p>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          {job.tags.slice(0, 2).map((tag) => {
            const tc = TAG_CFG[tag] || {};
            return (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  padding: '1px 6px',
                  fontSize: '10px', fontWeight: 500,
                  borderRadius: '4px',
                  background: tc.bg, color: tc.color,
                }}
              >
                {tag}
              </span>
            );
          })}
          {job.tags.length > 2 && (
            <span style={{ fontSize: '10px', color: 'var(--c-txt-3)' }}>+{job.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer: date + reminder */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--c-txt-3)', fontVariantNumeric: 'tabular-nums' }}>
          {fmtDate(job.appliedDate)}
        </span>
        {job.followUpDate && (
          <span
            style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '10px', fontVariantNumeric: 'tabular-nums',
              color: reminderOver ? 'var(--c-rejected)' : reminderSoon ? 'var(--c-interview)' : 'var(--c-txt-3)',
            }}
            title={`Follow-up: ${fmtDate(job.followUpDate)}`}
          >
            <Bell size={9} /> {fmtDate(job.followUpDate)}
          </span>
        )}
      </div>

      {/* Show actions on group hover via global style */}
      <style>{`
        .sg-job-card:hover .sg-card-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
