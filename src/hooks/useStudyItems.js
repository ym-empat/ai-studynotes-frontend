import { useState, useEffect, useCallback } from 'react';
import { fetchStudyItems, createStudyTask, deleteStudyTask } from '../services/api';

export const useStudyItems = (initialLimit = 10) => {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

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
    if (!cursor || loadingMore || !hasMore) return;
    
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
  }, [cursor, initialLimit, loadingMore, hasMore]);

  // Створення нової завдання
  const createTask = useCallback(async (topic) => {
    try {
      const newTask = await createStudyTask(topic);
      // Додаємо нову завдання на початок списку
      setItems(prevItems => [newTask, ...prevItems]);
      return newTask;
    } catch (error) {
      throw error;
    }
  }, []);

  // Видалення завдання
  const removeTask = useCallback(async (id) => {
    try {
      await deleteStudyTask(id);
      // Видаляємо завдання зі списку
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      throw error;
    }
  }, []);

  // Оновлення даних
  const refresh = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    loadInitialData();
  }, [loadInitialData]);

  // Завантаження початкових даних при монтуванні
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
