# 🚀 Low-Code Dynamic Form Workflow & Data Collection Platform

A full-stack Low-Code Dynamic Form Builder that enables administrators to create, publish, and manage dynamic forms without writing code. Respondents can access forms through shareable links, complete them with dynamic conditional logic, upload files, and receive unique response references after successful submission.

---

## 📌 Project Overview

This project provides a complete workflow for dynamic form creation and response collection.

Administrators can:

- Create forms visually
- Add multiple field types
- Configure validation rules
- Define conditional logic
- Publish and version forms
- Generate shareable public links
- Collect and manage responses

Respondents can:

- Access forms through a public URL
- Fill dynamic forms
- Upload files
- Experience real-time validation
- Receive a unique Response ID after successful submission

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Role-based Access (Admin/User)

---

## 📝 Dynamic Form Builder

- Create Forms
- Edit Forms
- Delete Fields
- Drag & Drop Field Reordering
- Form Versioning
- Draft & Publish Workflow

Supported Fields:

- Text
- Email
- Number
- Date
- Textarea
- Dropdown
- Radio Buttons
- Checkbox
- File Upload

---

## ⚙️ Conditional Logic

Create dynamic rules like:

> If "Are you employed?" == Yes

↓

Show:

- Company Name
- Experience
- Salary

Otherwise hide those fields.

Supports:

- Show/Hide Fields
- Required/Optional Fields
- Rule Evaluation

---

## ✅ Validation

### Client Side

- Required Fields
- Email Validation
- Number Range
- Text Length
- File Validation

### Server Side

- Required Validation
- Email Validation
- Number Validation
- Date Validation
- Hidden Field Validation
- Conditional Required Validation

---

## 📁 File Upload

- Upload Files
- Upload Progress Indicator
- File URL Storage
- Backend Validation

---

## 🌐 Shareable Public Forms

- Generate Secure Public Link
- Access Without Login
- Dynamic Rendering
- Conditional Logic Support

---

## 📦 Response Collection

Each successful submission stores:

- Form Response
- Field Values
- Uploaded Files
- Submission Timestamp
- Unique Response UID

Example:

```
resp_8f2c8d4efb
```

---

## 🎉 Submission Confirmation

After successful submission users receive:

- Thank You Screen
- Response ID
- Submission Time
- Form Name

---

## 🔄 Idempotency Support

Prevents duplicate submissions caused by:

- Double Clicking Submit
- Browser Retry
- Network Retry

Uses:

```
Idempotency-Key
```

header to safely return the original response.

---

# 🏗️ Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Zod
- CSS

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT Authentication

---

## Database

PostgreSQL

Tables include:

- Users
- Forms
- Form Versions
- Fields
- Conditional Rules
- Responses
- Response Values
- Idempotency Keys

---

# 📂 Project Structure

```
LowCodeFormBuilder
│
├── backend
│   ├── app
│   │   ├── models
│   │   ├── routers
│   │   ├── services
│   │   ├── schemas
│   │   ├── auth
│   │   └── config
│   └── alembic
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   ├── api
│   │   └── context
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

Backend runs at

```
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at

```
http://localhost:3000
```

---

# 📸 Screenshots

Add screenshots here:

- Login
- Dashboard
- Builder
- Conditional Rules
- Public Form
- Submission Page
- Confirmation Page

---

# 📊 Current Progress

## ✅ Milestone 1

- Authentication
- Form Builder
- Field Configuration
- Versioning
- Shareable Links

---

## ✅ Milestone 2

- Conditional Logic
- Dynamic Validation
- File Upload
- Response Collection
- Response UID
- Submission Confirmation
- Idempotency Support

---

# 🔮 Future Enhancements

- Analytics Dashboard
- Response Export (CSV / Excel)
- Email Notifications
- Form Templates
- Themes
- OTP Verification
- Multi-step Forms
- QR Code Sharing
- CAPTCHA Protection

---

# 👩‍💻 Developed By

**Roofiya Tasneem**



# ⭐ If you like this project

Give this repository a ⭐ on GitHub!
