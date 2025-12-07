# Todo List Web Application

Author: Grace Zhou

This is a functioning todo list web application built with Node.js/Express backend and HTML/CSS/JavaScript frontend.

### TLDR: 

Deployed: [https://todo-app-frontend-jgp1.onrender.com/](https://todo-app-frontend-jgp1.onrender.com/)

To run locally use 'npm start' (save and get password feature not relevant here) or 'npm run dev' (recommended) and install dependencies beforehand. 

### Functionality
- **View todo list**: See all your todo items in a simplified interface
- **Add new items**: Easily add new todo items with a single input field
- **Mark items complete**: Click checkboxes to mark items as done/undone
- **Delete items**: Remove todo items from list completely with the delete button

### Customization
- **Background colors**: Switch between 8 colors:
  - Yellow (default)
  - Orange
  - Red
  - Pink
  - Brown
  - Purple
  - Blue
  - Green

- Design Justification: I was inspired by the sticky note feature on my Macbook, which allows for switching background colors.  

### Save & Load System
- **Save functionality**: Click "Save & Get Password" to generate a unique 8-character password (copy this password for future use!). 
    - Important Design Note: Password will only be on the screen for 5 seconds. Copy it ASAP.  
- **Load functionality**: Enter your password to restore your saved todo list AND background color
    - Design Justification 1: I wanted to ensure that users can return to their TODO list, even if they close the tab or refresh the page, but maintain simplicity compared to using a database service or creating a login page for users.
    - Design Justification 2: The user's list should NOT stay on the page after refreshing because we need to allow many users to use the site. One user's list should not appear when another user loads the page. That is why the data disappears when the page is reloaded. Only saving + password can retrieve an existing list. 
    - Design Justification 3: I chose to have the system generate a random password for the user to copy instead of having the user create a password for simplicity purposes. 
    - Extenstion: A possible extension is to allow users to create multiple TODO lists for planning different occaisions or events, and in this scenario, I would probably add a login page.  
- **Persistence**: Data is saved on the server and can be accessed anytime with the generated. 

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Quick Start (locally)
1. **Navigate to the project directory**:
   ```bash
   cd [path]/todo_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```
   
   Or use the convenience script:
   ```bash
   ./start.sh
   ```

4. **Open your browser** and go to: `http://localhost:3001`

## Project Structure

```
todo_app/
├── README.md
├── package.json
├── start.sh # Convenience startup script
├── backend/
│   ├── server.js # Express server with API endpoints
│   └── data/ # Directory for saved todo lists
└── frontend/
    ├── index.html # Main HTML structure
    ├── styles.css # CSS styling with responsive design
    └── script.js # JavaScript functionality
```

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/todos` - Get current todo list and background color
- `POST /api/todos` - Add a new todo item
- `PUT /api/todos/:id` - Update todo item (mark complete/incomplete)
- `DELETE /api/todos/:id` - Delete a todo item
- `PUT /api/background-color` - Update background color
- `POST /api/save` - Save todo list and generate password
- `POST /api/load` - Load saved todo list using password


