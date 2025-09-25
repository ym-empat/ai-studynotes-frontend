import { useState, useEffect, useCallback } from 'react';
import { fetchStudyItem } from '../services/api';
import { useAuth } from './useAuth';

export const useTaskDetail = (taskId) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();

  const loadTask = useCallback(async (id) => {
    if (!id) return;
    
    // Перевіряємо, чи готовий API
    if (!auth.isApiReady) {
      console.log('⏳ useTaskDetail: API not ready yet, skipping task load');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('📊 useTaskDetail: Loading task:', id);
    
    try {
      const taskData = await fetchStudyItem(id);
      setTask(taskData);
    } catch (err) {
      setError(err.message);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [auth.isApiReady]);

  useEffect(() => {
    console.log('📊 useTaskDetail effect:', {
      taskId,
      isAuthenticated: auth.isAuthenticated,
      isApiReady: auth.isApiReady
    });
    
    if (taskId && auth.isAuthenticated && auth.isApiReady) {
      loadTask(taskId);
    }
  }, [taskId, loadTask, auth.isAuthenticated, auth.isApiReady]);

  return {
    task,
    loading,
    error,
    refetch: () => loadTask(taskId),
  };
};
