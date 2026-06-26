# Task Manager and Productivity Dashboard

Task Manager and Productivity Dashboard is a full-stack Employee Productivity & Task Tracking Dashboard. Employees can register, log in, manage their own tasks, schedule reminders, view notification history, and analyze task history by date range.

## Tech Stack

- Frontend: React, React Router, CSS, Axios, Vite
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB
- Authentication: Email/password with bcrypt hashing and JWT
- Notifications: In-app reminders with optional Nodemailer email reminders

## Folder Structure

```text
Task Manager and Productivity Dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   └── WelcomeCard.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   ├── TaskList.jsx
│   │   │   │   └── TaskCard.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       └── Input.jsx
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── README.md
└── .gitignore
```

## Setup

Install frontend dependencies:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\client"
npm.cmd install
```

Install backend dependencies:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\server"
npm.cmd install
```

Create backend environment file:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\server"
Copy-Item .env.example .env
```

Update `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task_manager_productivity_dashboard
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
EMAIL_REMINDERS_ENABLED=false
```

For quick local testing, you may leave `MONGO_URI` empty. The backend will use local file storage at `server/data/task-manager-data.json` for users, tasks, and notifications. MongoDB support remains enabled when you provide `MONGO_URI`.

Create optional frontend environment file:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\client"
Copy-Item .env.example .env
```

## Run Locally

Start MongoDB locally, set `MONGO_URI` in `server/.env` to a MongoDB Atlas connection string, or leave `MONGO_URI` empty to use local file storage.

Quick start both backend and frontend:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard"
npm.cmd run dev
```

Keep that terminal open while using the app. If the frontend is already running, this command will still start the missing backend and wait.

Terminal 1, backend:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\server"
npm.cmd run dev
```

Terminal 2, React live server. This command also starts the backend if it is not already running:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\client"
npm.cmd run dev
```

This runs Vite at `http://127.0.0.1:5173`. If Vite is blocked by your local Windows permissions, you can use the fallback live-reload server with `npm.cmd run live`.

Open:

```text
http://localhost:5173/login
```

The API runs at:

```text
http://localhost:5000/api
```

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/complete`

History:

- `GET /api/history?range=today`
- `GET /api/history?range=yesterday`
- `GET /api/history?range=last7days`
- `GET /api/history?range=last30days`
- `GET /api/history?from=YYYY-MM-DD&to=YYYY-MM-DD`

Notifications:

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/schedule`

## Email Notifications

Email reminders are sent when a task reminder becomes due, if both conditions are true:

- `EMAIL_REMINDERS_ENABLED=true` is set in `server/.env`
- The user has Email Notifications enabled on the Profile page

Example Gmail setup:

```env
EMAIL_REMINDERS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="WorkPulse <your-email@gmail.com>"
```

For Gmail, create an app password in your Google account security settings. A normal Gmail password will not work.

## Production

Build the client:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\client"
npm.cmd run build
```

Start the backend:

```powershell
cd "C:\Users\Administrator\Desktop\Task Management Dashboard\server"
npm.cmd start
```

When `NODE_ENV=production`, the backend serves the built frontend from `client/dist`.
