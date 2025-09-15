import { useState, useEffect, useCallback } from 'react';
import { fetchStudyItem } from '../services/api';

export const useTaskDetail = (taskId) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTask = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const taskData = await fetchStudyItem(id);
      setTask(taskData);
    } catch (err) {
      setError(err.message);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taskId) {
      loadTask(taskId);
    }
  }, [taskId, loadTask]);

  return {
    task,
    loading,
    error,
    refetch: () => loadTask(taskId),
  };
};
