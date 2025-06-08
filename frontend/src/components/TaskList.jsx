import { useEffect, useState } from 'react';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:5000/api/tasks';

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Create new task
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });
            if (!response.ok) throw new Error('Failed to create task');
            const data = await response.json();
            setTasks([...tasks, data]);
            setNewTask({ title: '', description: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    // Toggle task completion
    const toggleComplete = async (id, completed) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !completed }),
            });
            if (!response.ok) throw new Error('Failed to update task');
            const updatedTask = await response.json();
            setTasks(tasks.map(task => 
                task._id === id ? updatedTask : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete task');
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Task Manager</h1>
            
            {/* Add Task Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={newTask.description}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add Task
                    </button>
                </div>
            </form>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task._id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleComplete(task._id, task.completed)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div>
                                    <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                        {task.title}
                                    </h3>
                                    <p className="text-gray-600">{task.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTask(task._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList; 