// Skeleton primitives — all inline styles, no Tailwind color classes

export function Skeleton({ width = '100%', height = 14, style = {} }) {
  return (
    <div
      className="sg-skeleton"
      style={{ width, height, borderRadius: 5, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, padding: '10px 10px 10px 14px' }}>
      <Skeleton width="65%" height={13} />
      <Skeleton width="50%" height={11} style={{ marginTop: 6 }} />
      <Skeleton width="35%" height={10} style={{ marginTop: 10 }} />
    </div>
  );
}

export function ColumnSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, padding: 16 }}>
      <Skeleton width="55%" height={11} />
      <Skeleton width="35%" height={28} style={{ marginTop: 10 }} />
    </div>
  );
}
