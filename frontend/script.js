class TodoApp {
    constructor() {
        this.todos = [];
        this.currentBackgroundColor = '#ffeaa7';
        this.API_BASE = "https://todo-app-nv7k.onrender.com";
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodos();
    }

    bindEvents() {
        document.getElementById('addButton').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

 
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeBackgroundColor(e.target.dataset.color));
        });


        document.getElementById('saveButton').addEventListener('click', () => this.saveTodos());
        document.getElementById('loadButton').addEventListener('click', () => this.loadSavedTodos());
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadSavedTodos();
            }
        });
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        // Prepend API_BASE if URL is relative
        const fullUrl = url.startsWith('/') ? this.API_BASE + url : url;
        
        try {
            const response = await fetch(fullUrl, mergedOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `result-message ${type} show`;
        
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }

    async loadTodos() {
        try {
            this.showLoading();
            const data = await this.makeRequest('/api/todos');
            this.todos = data.todos || [];
            this.currentBackgroundColor = data.backgroundColor || '#ffeaa7';
            this.updateUI();
        } catch (error) {
            console.error('Failed to load todos:', error);
            this.updateUI(); // Still update UI with empty state
        } finally {
            this.hideLoading();
        }
    }

    async addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) {
            input.focus();
            return;
        }

        try {
            const newTodo = await this.makeRequest('/api/todos', {
                method: 'POST',
                body: JSON.stringify({ text })
            });

            this.todos.push(newTodo);
            input.value = '';
            this.updateTodoList();
            input.focus();
        } catch (error) {
            alert('Failed to add todo: ' + error.message);
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            await this.makeRequest(`/api/todos/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ completed: !todo.completed })
            });

            // Update only the completed property, keep all other properties (like text)
            const index = this.todos.findIndex(t => t.id === id);
            this.todos[index].completed = !this.todos[index].completed;
            this.updateTodoList();
        } catch (error) {
            alert('Failed to update todo: ' + error.message);
        }
    }

    async deleteTodo(id) {
        try {
            await this.makeRequest(`/api/todos/${id}`, {
                method: 'DELETE'
            });

            this.todos = this.todos.filter(t => t.id !== id);
            this.updateTodoList();
        } catch (error) {
            alert('Failed to delete todo: ' + error.message);
        }
    }

    async changeBackgroundColor(color) {
        try {
            await this.makeRequest('/api/background-color', {
                method: 'PUT',
                body: JSON.stringify({ color })
            });

            this.currentBackgroundColor = color;
            this.updateBackgroundColor();
            this.updateActiveColorButton();
        } catch (error) {
            alert('Failed to change background color: ' + error.message);
        }
    }

    async saveTodos() {
        try {
            this.showLoading();
            const result = await this.makeRequest('/api/save', {
                method: 'POST',
                body: JSON.stringify({
                    todos: this.todos,
                    backgroundColor: this.currentBackgroundColor
                })
            });

            this.showMessage('saveResult', `Saved! Your password is: ${result.password}`, 'success');
        } catch (error) {
            this.showMessage('saveResult', 'Failed to save: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadSavedTodos() {
        const passwordInput = document.getElementById('passwordInput');
        const password = passwordInput.value.trim();

        if (!password) {
            passwordInput.focus();
            this.showMessage('loadResult', 'Please enter a password', 'error');
            return;
        }

        try {
            this.showLoading();
            const data = await this.makeRequest('/api/load', {
                method: 'POST',
                body: JSON.stringify({ password })
            });

            this.todos = data.todos || [];
            this.currentBackgroundColor = data.backgroundColor || '#ffeaa7';
            this.updateUI();
            passwordInput.value = '';
            this.showMessage('loadResult', data.message, 'success');
        } catch (error) {
            this.showMessage('loadResult', error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateUI() {
        this.updateTodoList();
        this.updateBackgroundColor();
        this.updateActiveColorButton();
    }

    updateTodoList() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');

        todoList.innerHTML = '';

        if (this.todos.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo('${todo.id}')"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button 
                    class="delete-btn" 
                    onclick="app.deleteTodo('${todo.id}')"
                    title="Delete todo"
                >
                    Delete
                </button>
            `;

            todoList.appendChild(li);
        });
    }

    updateBackgroundColor() {
        document.body.style.backgroundColor = this.currentBackgroundColor;
    }

    updateActiveColorButton() {
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === this.currentBackgroundColor) {
                btn.classList.add('active');
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        window.app.loadTodos();
    }
});

window.addEventListener('resize', () => {
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
});
