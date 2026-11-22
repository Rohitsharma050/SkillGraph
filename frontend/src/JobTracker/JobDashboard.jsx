import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart3, Plus, ArrowLeft } from 'lucide-react';
import { AppContext } from '../Context/AppContext';
import DashboardNavbar from '../Components/DashboardNavbar';
import BoardView from './components/BoardView';
import AnalyticsView from './components/AnalyticsView';
import JobModal from './components/JobModal';
import JobDetailsModal from './components/JobDetailsModal';
import ConfirmModal from './components/ConfirmModal';
import FilterBar from './components/FilterBar';
import { useJobs } from './hooks/useJobs';

const JobDashboard = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  // If not logged in, redirect to login
  useEffect(() => {
    const storedToken = token || localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
    }
  }, [token, navigate]);

  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'analytics'
  const [filters, setFilters] = useState({});

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('Wishlist');
  const [detailsJob, setDetailsJob] = useState(null);
  const [confirmJob, setConfirmJob] = useState(null);

  const {
    jobs,
    loading,
    fetching,
    addJob,
    editJob,
    removeJob,
    moveJob,
  } = useJobs(filters);

  const openAdd = (status = 'Wishlist') => {
    setEditingJob(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setDetailsJob(null);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingJob) {
      await editJob(editingJob._id, data);
    } else {
      await addJob(data);
    }
    setModalOpen(false);
  };

  const openDetails = (job) => {
    setDetailsJob(job);
  };

  const requestDelete = (job) => {
    setConfirmJob(job);
    setDetailsJob(null);
  };

  const handleConfirmDelete = async () => {
    if (confirmJob) {
      await removeJob(confirmJob._id);
    }
    setConfirmJob(null);
  };

  const total = jobs.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg, #f9f9f8)' }}>
      {/* ── Top SkillGraph Navbar ── */}
      <DashboardNavbar />

      {/* Progress bar on background refetches */}
      {fetching && <div className="sg-progress-bar" />}

      {/* ── Sub Toolbar / Navigation Header ── */}
      <div
        style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--c-border)',
          background: 'var(--c-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 72,
          zIndex: 40,
        }}
      >
        {/* Left: Tab Switcher & Stats Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Back to Roadmaps */}
          <button
            onClick={() => navigate('/dashboard')}
            title="Back to SkillGraph Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--c-txt-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-txt)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-txt-2)')}
          >
            <ArrowLeft size={14} />
            Roadmaps
          </button>

          <div
            style={{ width: '1px', height: 18, background: 'var(--c-border)' }}
          />

          {/* Segmented Control */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--c-surface-raised, #f4f4f5)',
              padding: '3px',
              borderRadius: 8,
              border: '1px solid var(--c-border)',
            }}
          >
            <button
              onClick={() => setActiveTab('board')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: activeTab === 'board' ? 600 : 500,
                color: activeTab === 'board' ? 'var(--c-txt)' : 'var(--c-txt-2)',
                background:
                  activeTab === 'board' ? 'var(--c-surface)' : 'transparent',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                boxShadow:
                  activeTab === 'board'
                    ? '0 1px 3px rgba(0,0,0,0.06)'
                    : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={13} />
              Kanban Board
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: activeTab === 'analytics' ? 600 : 500,
                color:
                  activeTab === 'analytics'
                    ? 'var(--c-txt)'
                    : 'var(--c-txt-2)',
                background:
                  activeTab === 'analytics'
                    ? 'var(--c-surface)'
                    : 'transparent',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                boxShadow:
                  activeTab === 'analytics'
                    ? '0 1px 3px rgba(0,0,0,0.06)'
                    : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <BarChart3 size={13} />
              Analytics
            </button>
          </div>

          {!loading && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--c-txt-3)',
                padding: '2px 8px',
                borderRadius: 99,
                background: 'var(--c-accent-bg)',
              }}
            >
              {total} application{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Center / Filter: Only on Board view */}
        {activeTab === 'board' && (
          <div style={{ flex: 1, minWidth: 260, maxWidth: 540 }}>
            <FilterBar onChange={setFilters} />
          </div>
        )}

        {/* Right: Add Job button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => openAdd('Wishlist')}
            className="sg-btn-primary"
            style={{
              padding: '8px 16px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Plus size={14} /> Add application
          </button>
        </div>
      </div>

      {/* ── Tab Views ── */}
      <div className={fetching ? 'sg-fetching-overlay' : 'sg-board-content'}>
        {activeTab === 'board' ? (
          <BoardView
            jobs={jobs}
            loading={loading}
            moveJob={moveJob}
            openAdd={openAdd}
            openEdit={openEdit}
            openDetails={openDetails}
            requestDelete={requestDelete}
          />
        ) : (
          <AnalyticsView jobs={jobs} loading={loading} />
        )}
      </div>

      {/* ── Modals ── */}
      {detailsJob && (
        <JobDetailsModal
          job={detailsJob}
          onClose={() => setDetailsJob(null)}
          onEdit={() => openEdit(detailsJob)}
          onDelete={() => requestDelete(detailsJob)}
        />
      )}

      {modalOpen && (
        <JobModal
          job={editingJob}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {confirmJob && (
        <ConfirmModal
          message={`Are you sure you want to delete "${confirmJob.company} — ${confirmJob.role}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmJob(null)}
        />
      )}
    </div>
  );
};

export default JobDashboard;
