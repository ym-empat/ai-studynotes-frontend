import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, taskTopic, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Видалити завдання
                </h3>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Ви впевнені, що хочете видалити завдання <strong>"{taskTopic}"</strong>?
            </p>
            <p className="text-xs text-gray-500">
              Цю дію неможливо скасувати.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Видалення...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Видалити
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
