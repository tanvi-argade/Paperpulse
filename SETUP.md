Here is your **corrected production-grade setup.md with INTEGER-based system (UUID fully removed and normalized)**.

---

# ✅ Updated `setup.md` (INTEGER-based system fixed)

````md
# PaperPulse Setup Guide

Welcome to the **PaperPulse Academic Repository** setup guide. This document provides a comprehensive, production-ready guide to setting up and running the PaperPulse system locally.

---

## 1. Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v16.x or higher)
- **npm** (v7.x or higher)
- **PostgreSQL** (v12.x or higher)

---

## 2. Project Structure

The project is divided into two main directories:
- **`paperpulse-backend/`**: Node.js + Express API handling logic, database, and storage.
- **`paperpulse-frontend/`**: React application for the user interface.

---

## 3. Database Setup

### PostgreSQL Configuration
1. Create a new database named `paperpulse`.
2. Ensure your PostgreSQL service is running and accessible.

---

### Schema Initialization (INTEGER BASED SYSTEM)

Run the following SQL commands:

```sql
-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('AUTHOR', 'REVIEWER', 'ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Papers Table
CREATE TABLE papers (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT,
  pdf_url TEXT,
  status VARCHAR(50) DEFAULT 'submitted',
  is_published BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  certificate_generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Paper Authors Table (Multi-author support)
CREATE TABLE paper_authors (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name_snapshot VARCHAR(255) NOT NULL,
  email_snapshot VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'CO_AUTHOR')),
  is_registered_user BOOLEAN NOT NULL DEFAULT FALSE,
  author_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reviewer Assignments Table
CREATE TABLE reviewer_assignments (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reviews Table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comments TEXT,
  recommendation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER NOT NULL UNIQUE REFERENCES papers(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER REFERENCES papers(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
````

---

## 4. Backend Setup (`paperpulse-backend/`)

### 1. Install Dependencies

```bash
cd paperpulse-backend
npm install
npm install pdfkit
```

---

### 2. Configure Environment Variables

Create `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=paperpulse
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

---

### 3. Setup Storage Folders

```bash
mkdir -p uploads/pdfs uploads/certificates
```

---

### 4. Run Server

```bash
npm run dev
```

Backend:
`http://localhost:5000`

---

## 5. Frontend Setup (`paperpulse-frontend/`)

### 1. Install Dependencies

```bash
cd paperpulse-frontend
npm install
```

### 2. Start Frontend

```bash
npm start
```

Frontend:
`http://localhost:3000`

---

## 6. Features Summary

1. **Auth System**: JWT-based RBAC (AUTHOR, REVIEWER, ADMIN)
2. **Paper Workflow**: Submission → Review → Decision → Publish
3. **Payment System**: Accepted papers require payment before publish
4. **Publishing Control**: Admin-only publishing
5. **Certificate System**: PDF generated using pdfkit after publish (single page, stored in uploads/certificates)
6. **Notification & Audit System**: DB-driven logs and notifications

---

## 7. File Storage

* Papers: `uploads/pdfs/`
* Certificates: `uploads/certificates/`
* Access via `/uploads` static route

---

## 8. Final Checklist

* [ ] Backend `.env` configured
* [ ] PostgreSQL database created
* [ ] Schema applied (INTEGER version)
* [ ] Upload folders created
* [ ] Backend running
* [ ] Frontend running

```
