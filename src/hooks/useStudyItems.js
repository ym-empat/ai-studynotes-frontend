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
    
    // Перевіряємо, чи встановлені заголовки авторизації
    const authHeader = auth.getIdToken();
    if (!authHeader) {
      console.log('⚠️ loadInitialData: No auth token available, skipping API call');
      setError('Токен авторизації недоступний');
      setLoading(false);
      return;
    }
    
    console.log('📊 loadInitialData: Auth token available, making API call');
    
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
  }, [initialLimit, auth]);

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
      isApiReady: auth.isApiReady,
      hasIdToken: !!auth.getIdToken()
    });
    
    if (auth.isAuthenticated && !auth.isLoading && auth.isApiReady) {
      console.log('📊 useStudyItems: API is ready, making call');
      loadInitialData();
    } else if (!auth.isLoading && !auth.isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping API call');
      setItems([]);
      setError('Користувач не авторизований');
    } else if (auth.isAuthenticated && !auth.isLoading && !auth.isApiReady) {
      console.log('⏳ User authenticated but API not ready yet, waiting...');
    }
  }, [loadInitialData, auth.isAuthenticated, auth.isLoading, auth.isApiReady]);

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
