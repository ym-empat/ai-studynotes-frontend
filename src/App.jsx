import React, { useState } from 'react';
import { useStudyItems } from './hooks/useStudyItems';
import StudyItemsList from './components/StudyItemsList';
import CreateTaskModal from './components/CreateTaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null, taskTopic: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    createTask,
    removeTask,
  } = useStudyItems(10);

  const handleCreateTask = async (topic) => {
    await createTask(topic);
  };

  const handleDeleteClick = (taskId) => {
    const task = items.find(item => item.id === taskId);
    if (task) {
      setDeleteModal({
        isOpen: true,
        taskId,
        taskTopic: task.topic
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.taskId) return;
    
    setDeleteLoading(true);
    try {
      await removeTask(deleteModal.taskId);
      setDeleteModal({ isOpen: false, taskId: null, taskTopic: '' });
    } catch (error) {
      console.error('Error deleting task:', error);
      // Тут можна додати toast notification або інший спосіб показу помилки
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, taskId: null, taskTopic: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  AI Study Notes
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Створити завдання
              </button>
              <button
                onClick={refresh}
                className="btn-secondary"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Оновити
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Навчальні матеріали
          </h2>
          <p className="text-gray-600">
            Переглядайте та керуйте своїми навчальними матеріалами
          </p>
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всього матеріалів</p>
                  <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Завершено</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {items.filter(item => item.status === 'DONE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">В процесі</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {items.filter(item => item.status === 'PROCESSING').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Items List */}
        <StudyItemsList
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRefresh={refresh}
          onDelete={handleDeleteClick}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>AI Study Notes - Система управління навчальними матеріалами</p>
          </div>
        </div>
      </footer>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        taskTopic={deleteModal.taskTopic}
        loading={deleteLoading}
      />
    </div>
  );
}

export default App;
