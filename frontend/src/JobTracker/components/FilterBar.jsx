import { useState, useCallback, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { STATUSES, TAGS, TAG_CFG, STATUS_CFG } from '../lib/constants';
import { useDebounce } from '../hooks/useUtils';

export default function FilterBar({ onChange }) {
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState([]);
  const [tags, setTags]               = useState([]);
  const [sortBy, setSortBy]           = useState('newest');
  const [show, setShow]               = useState(false);

  const dSearch = useDebounce(search, 320);

  const buildParams = useCallback((overrides = {}) => {
    const s = overrides.status  ?? status;
    const t = overrides.tags    ?? tags;
    const q = overrides.search  ?? dSearch;
    const o = overrides.sortBy  ?? sortBy;
    const p = {};
    if (q)              p.search  = q;
    if (s.length)       p.status  = s.join(',');
    if (t.length)       p.tags    = t.join(',');
    if (o !== 'newest') p.sortBy  = o;
    return p;
  }, [status, tags, dSearch, sortBy]);

  useEffect(() => { onChange(buildParams()); }, [dSearch]); // eslint-disable-line

  const toggleStatus = (s) => {
    const next = status.includes(s) ? status.filter((x) => x !== s) : [...status, s];
    setStatus(next);
    onChange(buildParams({ status: next }));
  };
  const toggleTag = (t) => {
    const next = tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t];
    setTags(next);
    onChange(buildParams({ tags: next }));
  };
  const changeSort = (v) => {
    setSortBy(v);
    onChange(buildParams({ sortBy: v }));
  };
  const clearAll = () => {
    setSearch(''); setStatus([]); setTags([]); setSortBy('newest');
    onChange({});
  };

  const activeCount = status.length + tags.length + (search ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-txt-3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role…"
            className="sg-input"
            style={{ paddingLeft: 28, paddingRight: search ? 28 : 10 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-txt-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={11} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShow((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 10px', fontSize: 12, fontWeight: 500,
            borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${show || activeCount > 0 ? 'var(--c-border-strong)' : 'var(--c-border)'}`,
            background: show || activeCount > 0 ? 'var(--c-accent-bg)' : 'var(--c-surface)',
            color: 'var(--c-txt-2)', transition: 'all 0.12s',
          }}
        >
          <SlidersHorizontal size={12} />
          Filters
          {activeCount > 0 && (
            <span style={{ marginLeft: 2, padding: '1px 5px', fontSize: 10, fontWeight: 600, background: 'var(--c-accent)', color: '#fff', borderRadius: 9 }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => changeSort(e.target.value)}
          style={{ padding: '7px 10px', fontSize: 12, color: 'var(--c-txt-2)', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 6, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="company">Company A–Z</option>
          <option value="status">By Status</option>
        </select>

        {activeCount > 0 && (
          <button onClick={clearAll} style={{ fontSize: 12, color: 'var(--c-txt-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Row 2 — expanded filters */}
      {show && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '12px 14px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8 }}>
          {/* Status */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-txt-3)', marginBottom: 8 }}>Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUSES.map((s) => {
                const cfg = STATUS_CFG[s];
                const on  = status.includes(s);
                return (
                  <button key={s} onClick={() => toggleStatus(s)} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, cursor: 'pointer', transition: 'all 0.12s', border: `1px solid ${on ? cfg.dot : 'var(--c-border)'}`, background: on ? cfg.bg : 'transparent', color: on ? cfg.dot : 'var(--c-txt-2)' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-txt-3)', marginBottom: 8 }}>Tags</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TAGS.map((t) => {
                const tc = TAG_CFG[t] || {};
                const on = tags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, cursor: 'pointer', transition: 'all 0.12s', border: `1px solid ${on ? tc.color : 'var(--c-border)'}`, background: on ? tc.bg : 'transparent', color: on ? tc.color : 'var(--c-txt-2)' }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
