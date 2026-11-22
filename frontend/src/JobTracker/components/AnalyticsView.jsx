import { useMemo } from 'react';
import {
  Briefcase,
  PhoneCall,
  Trophy,
  XCircle,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';
import { STATUS_CFG, STATUSES, computeStats, fmtDate } from '../lib/constants';
import { StatSkeleton } from './Skeleton';

export default function AnalyticsView({ jobs, loading }) {
  const stats = useMemo(() => computeStats(jobs), [jobs]);

  // Monthly chart data — last 6 months
  const chartData = useMemo(() => {
    const map = {};
    jobs.forEach((j) => {
      const d = new Date(j.appliedDate || j.createdAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([k, count]) => {
        const [yr, mo] = k.split('-');
        return {
          label: new Date(yr, mo - 1).toLocaleDateString('en-US', { month: 'short' }),
          count,
        };
      });
  }, [jobs]);
  const maxBar = Math.max(...chartData.map((d) => d.count), 1);

  // Upcoming reminders
  const reminders = useMemo(
    () =>
      jobs
        .filter((j) => j.followUpDate && new Date(j.followUpDate) >= new Date())
        .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
        .slice(0, 6),
    [jobs]
  );

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--c-txt)',
            letterSpacing: '-0.02em',
          }}
        >
          Job Search Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--c-txt-2)', marginTop: 4 }}>
          Metrics, progress rates, and upcoming follow-ups
        </p>
      </div>

      {/* ── Stat cards ── */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={<Briefcase size={15} />}
          />
          <StatCard
            label="Interviews"
            value={stats.interviews}
            icon={<PhoneCall size={15} />}
            accent="var(--c-interview)"
          />
          <StatCard
            label="Offers"
            value={stats.offers}
            icon={<Trophy size={15} />}
            accent="var(--c-offer)"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle size={15} />}
            accent="var(--c-rejected)"
          />
        </div>
      )}

      {/* ── Rate cards ── */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <RateCard
            label="Offer rate"
            sub="Offers ÷ total applications"
            value={`${stats.successRate}%`}
            icon={<Target size={15} />}
            color="var(--c-offer)"
          />
          <RateCard
            label="Interview rate"
            sub="Interviews ÷ submitted applications"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp size={15} />}
            color="var(--c-interview)"
          />
        </div>
      )}

      {/* ── Charts row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Monthly Bar chart */}
        <div
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 12,
            padding: 22,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--c-txt-3)',
              marginBottom: 20,
            }}
          >
            Monthly Applications
          </p>
          {chartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                height: 130,
              }}
            >
              {chartData.map((d) => (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--c-txt-2)',
                      fontWeight: 600,
                    }}
                  >
                    {d.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      background: 'var(--c-accent)',
                      height: `${(d.count / maxBar) * 90}%`,
                      minHeight: 4,
                      transition: 'height 0.4s ease-out',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--c-txt-3)' }}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 12,
            padding: 22,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--c-txt-3)',
              marginBottom: 20,
            }}
          >
            Status Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STATUSES.map((s) => {
              const cfg = STATUS_CFG[s];
              const cnt = jobs.filter((j) => j.status === s).length;
              const pct = stats.total ? (cnt / stats.total) * 100 : 0;
              return (
                <div key={s}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-txt)' }}>
                      {s}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--c-txt-3)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {cnt}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 99,
                      background: 'var(--c-accent-bg)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: cfg.dot,
                        borderRadius: 99,
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom row: recent + reminders ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent applications */}
        <div
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--c-border)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--c-txt-3)',
              }}
            >
              Recent Applications
            </p>
          </div>
          {jobs.length === 0 ? (
            <EmptyList label="No applications yet" />
          ) : (
            jobs.slice(0, 8).map((job, i) => {
              const cfg = STATUS_CFG[job.status];
              return (
                <div
                  key={job._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderBottom:
                      i < 7 ? '1px solid var(--c-border-subtle)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--c-surface-raised)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--c-txt)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {job.company}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--c-txt-2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {job.role}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: 4,
                        background: cfg.bg,
                        color: cfg.dot,
                      }}
                    >
                      {job.status}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--c-txt-3)',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtDate(job.appliedDate)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reminders */}
        <div
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Calendar size={13} style={{ color: 'var(--c-txt-3)' }} />
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--c-txt-3)',
              }}
            >
              Upcoming Follow-ups
            </p>
          </div>
          {reminders.length === 0 ? (
            <EmptyList label="No reminders set" />
          ) : (
            reminders.map((job, i) => (
              <div
                key={job._id}
                style={{
                  padding: '11px 20px',
                  borderBottom:
                    i < reminders.length - 1
                      ? '1px solid var(--c-border-subtle)'
                      : 'none',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--c-txt)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {job.company}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--c-txt-3)' }}>
                    {job.role}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--c-txt-3)' }}>·</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--c-interview)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmtDate(job.followUpDate, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 12,
        padding: '16px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          color: 'var(--c-txt-3)',
        }}
      >
        {icon}
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--c-txt-2)' }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: accent || 'var(--c-txt)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RateCard({ label, sub, value, icon, color }) {
  return (
    <div
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color,
            marginBottom: 4,
          }}
        >
          {icon}
          <span
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-txt)' }}
          >
            {label}
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--c-txt-3)' }}>{sub}</p>
      </div>
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyChart() {
  return (
    <div
      style={{
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: 'var(--c-txt-3)',
      }}
    >
      No application data yet
    </div>
  );
}

function EmptyList({ label }) {
  return (
    <div
      style={{
        padding: '36px 20px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--c-txt-3)',
      }}
    >
      {label}
    </div>
  );
}
