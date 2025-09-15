import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Створюємо axios instance з базовими налаштуваннями
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Типи даних
export const StudyItemStatus = {
  DONE: 'DONE',
  PROCESSING: 'PROCESSING',
  QUEUED: 'QUEUED',
};

export const StudyItem = {
  id: '',
  topic: '',
  status: StudyItemStatus.TODO,
  createdAt: '',
  updatedAt: '',
};

export const StudyItemsResponse = {
  items: [],
  cursor: null,
};

/**
 * Отримує список навчальних матеріалів з курсор пагінацією
 * @param {string} cursor - Курсор для пагінації (опціонально)
 * @param {number} limit - Кількість елементів на сторінці (за замовчуванням 10)
 * @returns {Promise<StudyItemsResponse>}
 */
export const fetchStudyItems = async (cursor = null, limit = 10) => {
  try {
    const params = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await apiClient.get('/tasks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching study tasks:', error);
    throw new Error('Не вдалося завантажити дані. Перевірте підключення до API.');
  }
};

/**
 * Отримує детальну інформацію про конкретний навчальний матеріал
 * @param {string} id - ID навчального матеріалу
 * @returns {Promise<StudyItem>}
 */
export const fetchStudyItem = async (id) => {
  try {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study item:', error);
    throw new Error('Не вдалося завантажити деталі матеріалу.');
  }
};

/**
 * Створює нову навчальну завдання
 * @param {string} topic - Тема завдання
 * @returns {Promise<StudyItem>}
 */
export const createStudyTask = async (topic) => {
  try {
    const response = await apiClient.post('/tasks', { topic });
    return response.data;
  } catch (error) {
    console.error('Error creating study task:', error);
    throw new Error('Не вдалося створити завдання. Перевірте правильність даних.');
  }
};

/**
 * Видаляє навчальну завдання
 * @param {string} id - ID завдання для видалення
 * @returns {Promise<void>}
 */
export const deleteStudyTask = async (id) => {
  try {
    await apiClient.delete(`/tasks/${id}`);
  } catch (error) {
    console.error('Error deleting study task:', error);
    throw new Error('Не вдалося видалити завдання. Перевірте підключення до API.');
  }
};

export default apiClient;
