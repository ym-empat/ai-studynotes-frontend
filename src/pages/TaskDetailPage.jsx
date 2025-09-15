import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskDetail } from '../hooks/useTaskDetail';
import TaskDetailView from '../components/TaskDetailView';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { task, loading, error } = useTaskDetail(id);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <TaskDetailView
      task={task}
      loading={loading}
      error={error}
      onBack={handleBack}
    />
  );
};

export default TaskDetailPage;
