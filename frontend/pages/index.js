import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TaskList from '../components/TaskList';
import SearchBar from '../components/SearchBar';
import FilterSort from '../components/FilterSort';
import TaskModal from '../components/TaskModal';

export default function Home({ initialTasks, initialCategories }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [categories, setCategories] = useState(initialCategories);
  const [filteredTasks, setFilteredTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task =>
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.categoryId === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aDate - bDate;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy]);

  const handleTaskToggle = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSave = async (taskData) => {
    setLoading(true);
    try {
      if (selectedTask) {
        const response = await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
        }
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks([...tasks, newTask]);
        }
      }
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
        setIsModalOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Task Management App</title>
        <meta name="description" content="Manage your tasks efficiently" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <div className="flex space-x-4">
                <button
                  onClick={handleNewTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  New Task
                </button>
                <Link
                  href="/categories"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block"
                >
                  Manage Categories
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <FilterSort
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              categories={categories}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onPriorityFilterChange={setPriorityFilter}
              onSortChange={setSortBy}
            />

            <TaskList
              tasks={filteredTasks}
              categories={categories}
              loading={loading}
              onTaskToggle={handleTaskToggle}
              onTaskClick={handleTaskClick}
            />
          </div>
        </main>

        {isModalOpen && (
          <TaskModal
            task={selectedTask}
            categories={categories}
            onSave={handleTaskSave}
            onDelete={handleTaskDelete}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTask(null);
            }}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const [tasksRes, categoriesRes] = await Promise.all([
      fetch('http://localhost:3001/api/tasks'),
      fetch('http://localhost:3001/api/categories')
    ]);

    const tasks = tasksRes.ok ? await tasksRes.json() : [];
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];

    return {
      props: {
        initialTasks: tasks,
        initialCategories: categories
      }
    };
  } catch (error) {
    return {
      props: {
        initialTasks: [],
        initialCategories: []
      }
    };
  }
}