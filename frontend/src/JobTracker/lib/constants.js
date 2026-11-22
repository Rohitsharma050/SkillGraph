// ── Statuses ─────────────────────────────────────────────────
export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

export const STATUS_CFG = {
  Wishlist:  { dot: 'var(--c-wishlist)',  bg: 'var(--c-wishlist-bg)'  },
  Applied:   { dot: 'var(--c-applied)',   bg: 'var(--c-applied-bg)'   },
  Interview: { dot: 'var(--c-interview)', bg: 'var(--c-interview-bg)' },
  Offer:     { dot: 'var(--c-offer)',     bg: 'var(--c-offer-bg)'     },
  Rejected:  { dot: 'var(--c-rejected)',  bg: 'var(--c-rejected-bg)'  },
};

// ── Tags ──────────────────────────────────────────────────────
export const TAGS = ['Remote', 'Internship', 'Dream', 'Referral', 'Contract', 'Hybrid', 'On-site'];

export const TAG_CFG = {
  Remote:     { color: 'var(--c-tag-remote)',     bg: 'var(--c-tag-remote-bg)'     },
  Internship: { color: 'var(--c-tag-internship)', bg: 'var(--c-tag-internship-bg)' },
  Dream:      { color: 'var(--c-tag-dream)',      bg: 'var(--c-tag-dream-bg)'      },
  Referral:   { color: 'var(--c-tag-referral)',   bg: 'var(--c-tag-referral-bg)'   },
  Contract:   { color: 'var(--c-tag-contract)',   bg: 'var(--c-tag-contract-bg)'   },
  Hybrid:     { color: 'var(--c-tag-hybrid)',     bg: 'var(--c-tag-hybrid-bg)'     },
  'On-site':  { color: 'var(--c-tag-on-site)',    bg: 'var(--c-tag-on-site-bg)'    },
};

// ── Date helpers ───────────────────────────────────────────────
export function fmtDate(d, opts = { month: 'short', day: 'numeric' }) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', opts);
}

export function fmtDateInput(d) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export function isOverdue(d) {
  return !!d && new Date(d) < new Date();
}

export function isDueSoon(d, days = 3) {
  if (!d) return false;
  const diff = (new Date(d) - Date.now()) / 86_400_000;
  return diff >= 0 && diff <= days;
}

// ── Stats ──────────────────────────────────────────────────────
export function computeStats(jobs) {
  const t = jobs.length;
  const w = jobs.filter((j) => j.status === 'Wishlist').length;
  const a = jobs.filter((j) => j.status === 'Applied').length;
  const i = jobs.filter((j) => j.status === 'Interview').length;
  const o = jobs.filter((j) => j.status === 'Offer').length;
  const r = jobs.filter((j) => j.status === 'Rejected').length;
  const submitted = a + i + o + r;
  return {
    total: t, wishlist: w, applied: a, interviews: i, offers: o, rejected: r,
    successRate:    t ? Math.round((o / t) * 100) : 0,
    conversionRate: submitted ? Math.round((i / submitted) * 100) : 0,
  };
}
