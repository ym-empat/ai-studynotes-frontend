import React, { useCallback, useEffect } from 'react';
import StudyItemCard from './StudyItemCard';
import LoadingSpinner from './LoadingSpinner';

const StudyItemsList = ({ 
  items, 
  loading, 
  loadingMore, 
  error, 
  hasMore, 
  onLoadMore, 
  onRefresh,
  onDelete
}) => {
  // Обробка скролу для автоматичного завантаження
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasMore && !loadingMore && !loading) {
        onLoadMore();
      }
    }
  }, [hasMore, loadingMore, loading, onLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">Завантаження навчальних матеріалів...</p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Помилка завантаження</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="btn-primary"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Немає матеріалів</h3>
          <p className="text-gray-600 mb-4">Навчальні матеріали ще не додано</p>
          <button
            onClick={onRefresh}
            className="btn-secondary"
          >
            Оновити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Список елементів */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <StudyItemCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>

      {/* Індикатор завантаження додаткових елементів */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-600">Завантаження додаткових матеріалів...</span>
          </div>
        </div>
      )}

      {/* Кнопка "Завантажити ще" для ручного завантаження */}
      {hasMore && !loadingMore && (
        <div className="text-center py-6">
          <button
            onClick={onLoadMore}
            className="btn-primary"
            disabled={loadingMore}
          >
            Завантажити ще
          </button>
        </div>
      )}

      {/* Повідомлення про завершення завантаження */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            Всі навчальні матеріали завантажено
          </p>
        </div>
      )}

      {/* Показ помилки при завантаженні додаткових елементів */}
      {error && items.length > 0 && (
        <div className="text-center py-6">
          <div className="card max-w-md mx-auto">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={onLoadMore}
              className="btn-secondary"
            >
              Спробувати знову
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyItemsList;
