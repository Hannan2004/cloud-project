import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    priority: 'medium',
    category: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://task-manager-backend-470119455745.us-central1.run.app/api/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      dueDate: '',
      priority: 'medium',
      category: ''
    });
    setSelectedTask(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedTask ? `https://task-manager-backend-470119455745.us-central1.run.app/api/tasks/${selectedTask._id}` : `https://task-manager-backend-470119455745.us-central1.run.app/api/tasks`;
      const method = selectedTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      fetchTasks();
      resetForm();
      setShowTaskForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      category: task.category || ''
    });
    setShowTaskForm(true);
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`https://task-manager-backend-470119455745.us-central1.run.app/api/tasks/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        fetchTasks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'active') return task.status !== 'completed' && task.status !== 'cancelled';
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in-progress') return task.status === 'in-progress';
    return true;
  });

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <button className="add-btn" onClick={() => {
          resetForm();
          setShowTaskForm(true);
        }}>+ New Task</button>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in-progress')}
        >
          In Progress
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      <div className="tasks-container">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="no-tasks">No tasks to display</div>
        ) : (
          filteredTasks.map(task => (
            <div className="task-card" key={task._id}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className={`task-status ${getStatusClass(task.status)}`}>{task.status}</div>
              </div>
              
              <div className="task-body">
                {task.description && <p className="task-description">{task.description}</p>}
                
                <div className="task-meta">
                  <div className="task-due-date">
                    <span className="label">Due:</span> {formatDate(task.dueDate)}
                  </div>
                  
                  <div className={`task-priority ${getPriorityClass(task.priority)}`}>
                    <span className="label">Priority:</span> {task.priority}
                  </div>
                  
                  {task.category && (
                    <div className="task-category">
                      <span className="label">Category:</span> {task.category}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="task-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditTask(task)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showTaskForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowTaskForm(false)}>&times;</span>
            <h2>{selectedTask ? 'Edit Task' : 'Add New Task'}</h2>
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Work, Personal, etc."
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {selectedTask ? 'Update Task' : 'Create Task'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;