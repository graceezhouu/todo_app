const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_DIR = path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);

let activeTodos = [];
let currentBackgroundColor = '#ffeaa7'; // Default pastel yellow

//generate a unique password
function generatePassword() {
    return uuidv4().substring(0, 8).toUpperCase();
}

//get saved todo list filename
function getSaveFileName(password) {
    return path.join(DATA_DIR, `${password}.json`);
}

// Routes

//get current todo list
app.get('/api/todos', (req, res) => {
    res.json({
        todos: activeTodos,
        backgroundColor: currentBackgroundColor
    });
});

//add a new todo item
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Todo text is required' });
    }

    const newTodo = {
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    activeTodos.push(newTodo);
    res.status(201).json(newTodo);
});

//update todo item (mark as complete/incomplete)
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    const todoIndex = activeTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    activeTodos[todoIndex].completed = completed;
    res.json(activeTodos[todoIndex]);
});

//delete a todo item
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const todoIndex = activeTodos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const deletedTodo = activeTodos.splice(todoIndex, 1)[0];
    res.json(deletedTodo);
});

//update background color
app.put('/api/background-color', (req, res) => {
    const { color } = req.body;
    if (!color) {
        return res.status(400).json({ error: 'Color is required' });
    }

    currentBackgroundColor = color;
    res.json({ backgroundColor: currentBackgroundColor });
});

//save todo list and generate password
app.post('/api/save', (req, res) => {
    const password = generatePassword();
    const saveData = {
        todos: activeTodos,
        backgroundColor: currentBackgroundColor,
        savedAt: new Date().toISOString()
    };

    const fileName = getSaveFileName(password);
    
    try {
        fs.writeFileSync(fileName, JSON.stringify(saveData, null, 2));
        res.json({ 
            password: password,
            message: 'Todo list saved successfully' 
        });
    } catch (error) {
        console.error('Error saving todo list:', error);
        res.status(500).json({ error: 'Failed to save todo list' });
    }
});

//load todo list using password
app.post('/api/load', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const fileName = getSaveFileName(password.toUpperCase());
    
    try {
        if (!fs.existsSync(fileName)) {
            return res.status(404).json({ error: 'Todo list not found with this password' });
        }

        const saveData = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        activeTodos = saveData.todos || [];
        currentBackgroundColor = saveData.backgroundColor || '#ffeaa7';

        res.json({
            todos: activeTodos,
            backgroundColor: currentBackgroundColor,
            message: 'Todo list loaded successfully'
        });
    } catch (error) {
        console.error('Error loading todo list:', error);
        res.status(500).json({ error: 'Failed to load todo list' });
    }
});

//serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Todo App server running on port ${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});

module.exports = app;
