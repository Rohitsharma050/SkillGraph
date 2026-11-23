import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { STATUSES, STATUS_CFG } from '../lib/constants';
import JobCard from './JobCard';
import { ColumnSkeleton } from './Skeleton';

export default function BoardView({
  jobs,
  loading,
  moveJob,
  openAdd,
  openEdit,
  openDetails,
  requestDelete,
  onSeed,
}) {
  const onDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    await moveJob(draggableId, destination.droppableId);
  };

  const colJobs = (s) => jobs.filter((j) => j.status === s);

  return (
    <div>
      {jobs.length === 0 && !loading && onSeed && (
        <div
          style={{
            margin: '16px 20px 0',
            padding: '12px 18px',
            background: 'var(--c-surface)',
            border: '1px dashed var(--c-border)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>💼</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-txt)', margin: 0 }}>
                Your job pipeline is currently empty
              </p>
              <p style={{ fontSize: 12, color: 'var(--c-txt-2)', margin: '2px 0 0' }}>
                Add your dream roles manually, or load 8 pre-configured sample applications (Google, Stripe, Linear...) to explore the board and analytics.
              </p>
            </div>
          </div>
          <button
            onClick={onSeed}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Load Sample Applications
          </button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 12,
            padding: '16px 20px',
            height: 'calc(100vh - 140px)',
            alignItems: 'stretch',
            boxSizing: 'border-box',
          }}
        >
        {STATUSES.map((status) => {
          const cfg = STATUS_CFG[status];
          const col = colJobs(status);
          return (
            <div
              key={status}
              style={{
                flexShrink: 0,
                width: 'calc((100vw - 120px) / 5)',
                minWidth: 230,
                maxWidth: 320,
                background: 'var(--c-surface-raised, #fafaf9)',
                border: '1px solid var(--c-border)',
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  background: 'var(--c-surface)',
                  borderRadius: '12px 12px 0 0',
                  padding: '12px 14px 10px',
                  borderBottom: `2px solid ${cfg.dot}30`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: cfg.dot,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--c-txt)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {status}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '1px 7px',
                        borderRadius: 99,
                        background: cfg.bg,
                        color: cfg.dot,
                      }}
                    >
                      {col.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openAdd(status)}
                    title={`Add to ${status}`}
                    style={{
                      padding: 4,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--c-txt-3)',
                      display: 'flex',
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-txt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-txt-3)')}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Cards droppable area */}
              <Droppable droppableId={status}>
                {(prov, snap) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.droppableProps}
                    style={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      minHeight: 100,
                      transition: 'background 0.15s, padding 0.15s',
                      borderRadius: '0 0 12px 12px',
                      padding: snap.isDraggingOver ? '10px 10px 14px' : '8px 10px 14px',
                      background: snap.isDraggingOver ? cfg.bg : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <ColumnSkeleton />
                    ) : (
                      col.map((job, idx) => (
                        <Draggable key={job._id} draggableId={job._id} index={idx}>
                          {(p, s) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                            >
                              <JobCard
                                job={job}
                                isDragging={s.isDragging}
                                onEdit={() => openEdit(job)}
                                onDelete={() => requestDelete(job)}
                                onViewDetails={() => openDetails(job)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}

                    {!loading && col.length === 0 && !snap.isDraggingOver && (
                      <EmptyCol status={status} onAdd={() => openAdd(status)} />
                    )}

                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
    </div>
  );
}

function EmptyCol({ status, onAdd }) {
  return (
    <div
      style={{
        padding: '36px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <p style={{ fontSize: 12, color: 'var(--c-txt-3)' }}>
        No {status.toLowerCase()} jobs
      </p>
      <button
        onClick={onAdd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--c-txt-2)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-txt)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-txt-2)')}
      >
        <Plus size={12} /> Add one
      </button>
    </div>
  );
}
