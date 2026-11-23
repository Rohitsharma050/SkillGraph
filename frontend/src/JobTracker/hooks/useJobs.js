import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getJobs, seedJobs, createJob, updateJob, deleteJob,
  updateStatus, updateTags, updateReminder,
} from '../services/jobApi';

export function useJobs(filters = {}) {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError]       = useState(null);

  const isFirstLoad = useRef(true);
  const filtersKey  = JSON.stringify(filters);
  const filtersRef  = useRef(filters);
  filtersRef.current = filters;

  const fetchJobs = useCallback(async () => {
    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    setError(null);

    try {
      const res = await getJobs(filtersRef.current);
      setJobs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
      setFetching(false);
      isFirstLoad.current = false;
    }
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Mutations ─────────────────────────────────────────────

  const addJob = useCallback(async (data) => {
    const res = await createJob(data);
    setJobs((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const editJob = useCallback(async (id, data) => {
    const res = await updateJob(id, data);
    setJobs((prev) => prev.map((j) => (j._id === id ? res.data : j)));
    return res.data;
  }, []);

  const removeJob = useCallback(async (id) => {
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j._id !== id));
  }, []);

  const moveJob = useCallback(async (id, status) => {
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, status } : j)));
    try {
      const res = await updateStatus(id, status);
      setJobs((prev) => prev.map((j) => (j._id === id ? res.data : j)));
      return res.data;
    } catch {
      await fetchJobs();
      throw new Error('Failed to update status');
    }
  }, [fetchJobs]);

  const setTags = useCallback(async (id, tags) => {
    const res = await updateTags(id, tags);
    setJobs((prev) => prev.map((j) => (j._id === id ? res.data : j)));
    return res.data;
  }, []);

  const setReminder = useCallback(async (id, followUpDate) => {
    const res = await updateReminder(id, followUpDate);
    setJobs((prev) => prev.map((j) => (j._id === id ? res.data : j)));
    return res.data;
  }, []);

  const seedDemoJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await seedJobs();
      setJobs(res.data.jobs || []);
      return res.data.jobs;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to seed sample jobs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    fetching,
    error,
    refetch: fetchJobs,
    addJob, editJob, removeJob, moveJob, setTags, setReminder, seedDemoJobs,
  };
}
