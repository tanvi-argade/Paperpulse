
<h1 align="center">🎓 PaperPulse</h1>
<p align="center"><strong>Workflow-Driven Paper Publishing System</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Docs-PDF%20Generation-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Design-Workflow%20Engine-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Project-Advanced%20Backend%20System-blue?style=for-the-badge" />
</p>

---

## ⚙️ System Overview

PaperPulse is a **workflow-driven academic publishing system** that manages the complete lifecycle of research papers using strict state transitions, role-based access control, and controller-level orchestration.

Unlike basic CRUD systems, it enforces a deterministic workflow:

> **Submission → Review → Decision → Payment → Publication → Certification**

---

## 🏗️ Architecture

### 🔷 High-Level System Architecture

![System Architecture](imgs/image.png)

This shows the interaction between frontend, API layer, business logic, and persistence.

---

### 🔷 Backend Execution Flow

![Backend Flow](imgs/image-2.png)

Request lifecycle from routing → controller → model → database execution.

---

## 🔄 Workflow Engine (Core System)

![Workflow Engine](imgs/image-1.png)

### 📌 Enforcement Rules

* All transitions validated in controller layer
* Role-based restrictions enforced per state
* No workflow logic inside database
* Audit logs generated on every transition

---

## 👥 Role System

| Role           | Responsibilities                                             |
| -------------- | ------------------------------------------------------------ |
| 👨‍🎓 Author   | Submit papers, track status, pay fees, download certificates |
| 🧑‍🔬 Reviewer | Review assigned papers, submit recommendations               |
| 🧑‍💼 Admin    | Assign reviewers, make decisions, publish papers             |

---

## ✨ Features

* Strict workflow/state machine enforcement
* Role-Based Access Control (RBAC)
* Multi-author paper submission
* Reviewer assignment + tracking
* Admin decision system
* Payment gating before publication
* PDF certificate generation
* Full audit logging

---

## 🔍 What This System Actually Implements

### 📄 End-to-End Paper Lifecycle

- Paper submission with PDF upload and co-author validation  
- Automatic transition from `submitted → under_review` on reviewer assignment  
- Reviewer-based evaluation with accept/reject recommendations  
- Admin-controlled final decision system  
- Payment-gated publishing mechanism  
- Certificate generation triggered after publication  

---

### 🔄 Workflow Enforcement (State Machine)

- Controlled transitions:
  `submitted → under_review → accepted/rejected → published`

- Enforced constraints:
  - Cannot assign reviewers after decision  
  - Cannot submit decision without reviews  
  - Cannot publish without successful payment  
  - Reviewers restricted to one review per paper  

---

### 🔐 Access Control & Ownership Enforcement

- JWT-based authentication (7-day expiry)  
- Role-based access: author, reviewer, admin  
- Strict ownership validation:
  - Authors → only their papers  
  - Reviewers → only assigned papers  
  - Certificate access restricted to valid participants  

---

## 🧠 System Design Highlights

* Controller-driven orchestration
* Finite State Machine (FSM) enforcement
* Transaction-safe operations
* PostgreSQL for relational integrity
* Audit-first design for traceability
* Modular monolith architecture

---

## 🧩 Module Breakdown

### Backend Modules

* Auth → JWT authentication + RBAC
* Paper → Submission + lifecycle
* Review → Reviewer workflow
* Decision → Admin control
* Payment → Publication gate
* Certificate → PDF generation
* Audit → System tracking

---

## 🔌 API Flow Design

![API Flow](imgs/image-3.png)

### Example API

```http
POST /api/papers/submit
```

**Request**

```json
{
  "title": "AI in Agriculture",
  "abstract": "Study on crop prediction models",
  "authors": ["Tanvi Argade"]
}
```

**Response**

```json
{
  "paperId": "123",
  "status": "SUBMITTED"
}
```

---

## 🗄️ Database Design

### Core Tables

* users
* papers
* paper_authors
* reviews
* reviewer_assignments
* payments
* notifications
* audit_logs

### Principle

> PostgreSQL is used strictly as a persistence layer, not a workflow engine.

---

## 🔐 Security Model

* JWT authentication
* Role-based route protection
* Ownership validation
* Reviewer isolation
* Secure certificate access

---

## 📜 Certificate System

* Triggered after publication
* Generated using PDFKit
* Stored locally
* Protected download endpoint

---

## 📊 Audit System

Tracks:

* submissions
* reviews
* decisions
* payments
* publication

Purpose:

* traceability
* debugging
* admin visibility

---

## ⚖️ Engineering Trade-offs

| Decision      | Choice           | Reason             |
| ------------- | ---------------- | ------------------ |
| Architecture  | Modular Monolith | Strong consistency |
| Workflow      | Controller Layer | Explicit control   |
| Database Role | Persistence only | Avoid hidden logic |
| Storage       | Local files      | Simplicity         |

---

## 🚀 Tech Stack

* Backend: Node.js, Express.js
* Frontend: React.js
* Database: PostgreSQL
* Auth: JWT + bcrypt
* File Handling: PDFKit

---

## 🛠️ Setup & Installation

```bash
git clone https://github.com/tanviargade/paperpulse.git
cd paperpulse
npm install
```

### Environment Variables

Create `.env` file:

```env
PORT=5000
DB_URL=postgresql://username:password@localhost:5432/paperpulse
JWT_SECRET=your_secret_key
```

### Run Backend

```bash
npm run dev
```

---

## 📁 Project Structure

```
backend/
  controllers/
  models/
  routes/
  middleware/

frontend/
  src/
    components/
    pages/

imgs/
  (all architecture diagrams)
```

---

## 📸 UI Preview

![UI 1](imgs/image-4.png)
![UI 2](imgs/image-5.png)
![UI 3](imgs/image-6.png)

---

## 🧠 Final Summary

PaperPulse demonstrates:

* Workflow-driven backend design
* State-machine enforced lifecycle
* Role-based execution control
* Transaction-safe operations
* Audit-driven system architecture

---
