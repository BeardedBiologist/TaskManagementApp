# Task Management System

A collaborative project management tool with real-time updates, drag-and-drop functionality, and team workspaces.

## Tech Stack

- **Frontend**: Vue.js 3, Pinia, Vite
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB with Mongoose

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally:
```bash
mongod
```

Or use MongoDB Atlas and update the `MONGODB_URI`.

### 4. Run the Application

```bash
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3000

## Features

- 🔐 **Authentication**: JWT-based auth with secure password hashing
- 🏢 **Workspaces**: Create team workspaces and invite members
- 📁 **Projects**: Organize work into projects with custom Kanban columns
- 📋 **Kanban Board**: Drag-and-drop task management
- ⚡ **Real-time**: Live updates via WebSockets (tasks, comments)
- 💬 **Comments**: Discuss tasks with your team
- ☑️ **Checklists**: Break tasks into subtasks
- 🏷️ **Labels**: Categorize tasks with colors
- 👥 **Assignees**: Assign tasks to team members
- 📅 **Due Dates**: Track deadlines

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project with tasks
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/move` - Move task (drag & drop)
- `POST /api/tasks/:id/comments` - Add comment
- `DELETE /api/tasks/:id` - Delete task

## Project Structure

```
├── server/              # Backend
│   ├── src/models/      # Database models
│   ├── src/routes/      # API routes
│   ├── src/middleware/  # Auth & error handling
│   └── src/index.js     # Entry point
│
├── client/              # Frontend
│   ├── src/views/       # Pages
│   ├── src/components/  # Reusable components
│   ├── src/stores/      # Pinia stores
│   └── src/router/      # Vue Router
│
└── package.json         # Root package.json
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy, change it in `server/.env`:
```env
PORT=4000
```

### MongoDB Connection Error

Make sure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 mongo
```

## License

MIT
