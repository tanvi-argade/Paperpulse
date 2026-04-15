# PROJECT SETUP GUIDE

## 1. Prerequisites
- **Node.js**: Latest LTS recommended (no `engines` version is pinned in this repo).
- **npm**: Comes with Node.js (this project uses `package-lock.json`).
- **PostgreSQL**: Required (backend uses `pg` and connects via env vars).
- **Git**: Optional but recommended (for cloning/versioning).

## 2. Project Structure Overview
- **`paperpulse-frontend/`**: React (Create React App) UI. Runs on `http://localhost:3000`.
- **`paperpulse-backend/`**: Express API + PostgreSQL + file uploads. Runs on `http://localhost:5000`.
- **Key backend modules**
  - `src/app.js`: Express app + routes + `/uploads` static hosting
  - `src/server.js`: starts the server
  - `src/config/db.js`: PostgreSQL connection pool
  - `src/routes/`: route groups (`auth`, `papers`, `reviewer`, `admin`)

## 3. Backend Setup
### 3.1 Install backend dependencies
1. Open a terminal.
2. Run:

```bash
cd paperpulse-backend
npm install
```

### 3.2 Create the backend `.env`
1. In `paperpulse-backend/`, create a file named `.env`.
2. Add the following variables (edit values for your machine):

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=paperpulse

JWT_SECRET=YOUR_SECRET
```

### 3.3 Ensure the uploads folder exists
The backend serves uploaded PDFs from `paperpulse-backend/uploads/`.

If the folder does not exist, create it:

```bash
mkdir uploads
```

### 3.4 Run the backend
- **Development (auto-restart):**

```bash
npm run dev
```

- **Production-style (no auto-restart):**

```bash
npm start
```

Backend health check:
- Open `http://localhost:5000/` in a browser → should respond “PaperPulse API Running”.

## 4. Frontend Setup
### 4.1 Install frontend dependencies
In a new terminal:

```bash
cd paperpulse-frontend
npm install
```

### 4.2 Frontend environment config
- No frontend `.env` is required for default local development.
- The frontend API base URL is hardcoded to `http://localhost:5000`.

### 4.3 Run the frontend

```bash
npm start
```

Then open:
- `http://localhost:3000`

## 5. Database Setup (PostgreSQL)
### 5.1 Create the database
Using `psql`:

```bash
psql -U postgres
CREATE DATABASE paperpulse;
```

### 5.2 Create required tables (manual schema)
This project does not include migrations. Create tables manually (example schema aligned to code usage):

```sql
-- Run inside the `paperpulse` database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS papers (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviewer_assignments (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (paper_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comments TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (paper_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 Create an admin user (manual)
Registration defaults users to the `author` role. To access the admin UI, you must create an admin user directly in the database.

Option A (recommended): create a normal user via UI first, then update role in DB:

```sql
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

## 6. File Upload / External Services
- **Uploads**
  - PDFs are saved to `paperpulse-backend/uploads/`.
  - The backend exposes them at `http://localhost:5000/uploads/<filename>`.
- **JWT**
  - Tokens are signed using `JWT_SECRET` from the backend `.env`.
  - Frontend stores token and role in `localStorage`.

## 7. Common Issues & Fixes
- **Port conflicts**
  - Backend uses `5000` and frontend uses `3000`. Change `PORT` in backend `.env` if needed.
  - If you change backend port, you must update the frontend API base URL (currently `http://localhost:5000`).

- **Database connection errors**
  - Verify PostgreSQL is running.
  - Verify `.env` values for `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  - Ensure the database and tables exist.

- **Login works but pages redirect back to login**
  - Token must be stored as `Bearer` auth automatically by the frontend’s Axios interceptor.
  - Clear browser storage and log in again if roles/tokens changed: DevTools → Application → Local Storage → clear.

- **CORS issues**
  - Backend enables CORS globally. If you changed ports/domains, restart backend and ensure frontend points to the correct backend URL.

- **Uploads/PDF links return 404**
  - Ensure `paperpulse-backend/uploads/` exists.
  - Ensure backend is running and serving `/uploads` statically.

## 8. Final Run Checklist
- Backend running at `http://localhost:5000/`
- Frontend running at `http://localhost:3000/`
- PostgreSQL running and `paperpulse` DB + tables created
- Able to register + login
- Admin user exists (role set to `admin` in DB) to access `/admin`

