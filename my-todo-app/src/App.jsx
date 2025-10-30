import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.scss';

const LOCAL_STORAGE_KEY = 'myTodoApp_todos';

const getStoredTodos = () => {
  try {
    const savedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedTodos || savedTodos === 'null' || savedTodos === 'undefined') {
      return null;
    }
    return JSON.parse(savedTodos);
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const nextId = useRef(1);
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTodos = () => {
      const savedTodos = getStoredTodos();
      
      if (savedTodos && Array.isArray(savedTodos)) {
        setTodos(savedTodos);
        
        if (savedTodos.length > 0) {
          const maxId = Math.max(...savedTodos.map(todo => todo.id));
          nextId.current = maxId + 1;
        }
      }
      setIsLoaded(true);
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = useCallback(() => {
    const trimmedTodo = newTodo.trim();
    
    if (trimmedTodo !== '') {
      const isDuplicate = todos.some(
        todo => todo.text.toLowerCase() === trimmedTodo.toLowerCase()
      );

      if (isDuplicate) {
        alert('Такая задача уже существует!');
        return;
      }

      const todo = {
        id: nextId.current,
        text: trimmedTodo,
        completed: false,
        createdAt: new Date().toISOString() 
      };
      
      setTodos(prevTodos => [...prevTodos, todo]);
      nextId.current += 1;
      setNewTodo('');
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [newTodo, todos]);

  const toggleTodo = useCallback((id) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  const editTodo = useCallback((id, newText) => {
    const trimmedText = newText.trim();
    if (trimmedText === '') return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, text: trimmedText } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите удалить все выполненные задачи?')) {
      setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
    }
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  }, [addTodo]);

  const getFilteredTodos = useCallback(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const filteredTodos = getFilteredTodos();

  if (!isLoaded) {
    return (
      <div className="app-container">
        <h1 className="app-title">Мой Todo List</h1>
        <div className="todo-content">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (totalTodos === 0) {
    return (
      <div className="app-container">
        <h1 className="app-title">Мой Todo List</h1>
        <div className="todo-content">
          <div className="add-todo-section">
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Добавьте вашу первую задачу..."
              className="todo-input"
            />
            <button
              onClick={addTodo}
              className="add-button"
            >
              Добавить
            </button>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Пока нет задач</h3>
            <p>Начните добавлять задачи, чтобы организовать ваш день!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-title">Мой Todo List</h1>
      
      <div className="todo-content">
        <div className="add-todo-section">
          <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Добавьте новую задачу..."
            className="todo-input"
          />
          <button
            onClick={addTodo}
            className="add-button"
            disabled={!newTodo.trim()} 
          >
            Добавить
          </button>
        </div>

        <div className="todo-stats">
          <div className="stat-item">
            <span className="stat-number">{totalTodos}</span>
            <span className="stat-label">Всего</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{activeTodos}</span>
            <span className="stat-label">Активные</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedTodos}</span>
            <span className="stat-label">Выполненные</span>
          </div>
        </div>

        <div className="filter-section">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Активные
          </button>
          <button
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Выполненные
          </button>
        </div>

        {completedTodos > 0 && (
          <div className="clear-section">
            <button
              onClick={clearCompleted}
              className="clear-button"
            >
              Удалить выполненные ({completedTodos})
            </button>
          </div>
        )}

        <div>
          <h2 className="todo-section-title">
            {filter === 'all' && 'Все задачи'}
            {filter === 'active' && 'Активные задачи'}
            {filter === 'completed' && 'Выполненные задачи'}
            {` (${filteredTodos.length})`}
          </h2>
          
          <ul className="todo-list">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))}
          </ul>

          {filteredTodos.length === 0 && (
            <p className="empty-filter-message">
              {filter === 'active' && 'Нет активных задач!'}
              {filter === 'completed' && 'Нет выполненных задач!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const TodoItem = React.memo(({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = useCallback(() => {
    if (editText.trim() !== '') {
      onEdit(todo.id, editText);
      setIsEditing(false);
    }
  }, [editText, onEdit, todo.id]);

  const handleCancel = useCallback(() => {
    setEditText(todo.text);
    setIsEditing(false);
  }, [todo.text]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return (
      <li className="todo-item">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="todo-edit-input"
          autoFocus
        />
        <div className="todo-actions">
          <button
            onClick={handleSave}
            className="action-button save-button"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="action-button cancel-button"
          >
            ✕
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span 
        className="todo-text"
        onDoubleClick={handleDoubleClick}
      >
        {todo.text}
      </span>
      
      <div className="todo-actions">
        <button
          onClick={() => onToggle(todo.id)}
          className="action-button complete-button"
        >
          {todo.completed ? 'Отменить' : 'Выполнено'}
        </button>
        
        <button
          onClick={handleEditClick}
          className="action-button edit-button"
        >
          Редакт.
        </button>
        
        <button
          onClick={() => onDelete(todo.id)}
          className="action-button delete-button"
        >
          Удалить
        </button>
      </div>
    </li>
  );
});