import { useState, useEffect, useCallback } from 'react';
import { fetchStudyItems, createStudyTask, deleteStudyTask } from '../services/api';
import { useAuth } from './useAuth';

export const useStudyItems = (initialLimit = 10) => {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const auth = useAuth();

  // Завантаження початкових даних
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchStudyItems(null, initialLimit);
      setItems(response.items || []);
      setCursor(response.cursor);
      setHasMore(!!response.cursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Завантаження додаткових даних (пагінація)
  const loadMore = useCallback(async () => {
    if (!auth.isAuthenticated || !cursor || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setError(null);
    
    try {
      const response = await fetchStudyItems(cursor, initialLimit);
      setItems(prevItems => [...prevItems, ...(response.items || [])]);
      setCursor(response.cursor);
      setHasMore(!!response.cursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [auth.isAuthenticated, cursor, initialLimit, loadingMore, hasMore]);

  // Створення нової завдання
  const createTask = useCallback(async (topic) => {
    if (!auth.isAuthenticated) {
      throw new Error('Користувач не авторизований');
    }
    
    try {
      const newTask = await createStudyTask(topic);
      // Додаємо нову завдання на початок списку
      setItems(prevItems => [newTask, ...prevItems]);
      return newTask;
    } catch (error) {
      throw error;
    }
  }, [auth.isAuthenticated]);

  // Видалення завдання
  const removeTask = useCallback(async (id) => {
    if (!auth.isAuthenticated) {
      throw new Error('Користувач не авторизований');
    }
    
    try {
      await deleteStudyTask(id);
      // Видаляємо завдання зі списку
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      throw error;
    }
  }, [auth.isAuthenticated]);

  // Оновлення даних
  const refresh = useCallback(() => {
    if (!auth.isAuthenticated) {
      setError('Користувач не авторизований');
      return;
    }
    
    setItems([]);
    setCursor(null);
    setHasMore(true);
    loadInitialData();
  }, [auth.isAuthenticated, loadInitialData]);

  // Завантаження початкових даних при монтуванні тільки якщо користувач авторизований
  useEffect(() => {
    console.log('📊 useStudyItems effect:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      hasAccessToken: !!auth.getAccessToken()
    });
    
    if (auth.isAuthenticated && !auth.isLoading) {
      loadInitialData();
    } else if (!auth.isLoading && !auth.isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping API call');
      setItems([]);
      setError('Користувач не авторизований');
    }
  }, [loadInitialData, auth.isAuthenticated, auth.isLoading]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    createTask,
    removeTask,
  };
};
