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
  IN_PROGRESS: 'IN_PROGRESS',
  TODO: 'TODO',
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

export default apiClient;
