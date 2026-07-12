# AssetFlow – Enterprise Asset Management System

AssetFlow is a full-stack MERN application developed for the **Odoo Hackathon**. It helps organizations efficiently manage company assets throughout their complete lifecycle—from asset creation to allocation, return, maintenance, and history tracking.

## 🌐 Live Demo

**Application:** https://oddo-hackathon-mauve.vercel.app/

### Demo Credentials

**Email:** `bob@assetflow.io`

**Password:** `secret123`

---

# Features

## 🔐 Manager Authentication

- Secure JWT-based login
- Single active manager session
- Protected routes
- Automatic logout on invalid session

---

## 📦 Asset Management

Manage all company assets with complete details.

Each asset stores:

- Asset Tag (Auto Generated)
- Asset Name
- Department
- Category
- Serial Number
- Location
- Purchase Date
- Purchase Cost
- Warranty Expiry
- Condition
- Status
- Image
- Documents

---

## 👨‍💼 Employee Management

Manage employees to whom assets can be allocated.

Employee details include:

- Name
- Email
- Designation
- Department

---

## 📋 Asset Allocation

Allocate available assets to employees.

Features:

- Select employee
- Allocation Date
- Expected Return Date
- Auto-filled Allocated By (Logged-in Manager)
- Asset status automatically changes to **Allocated**

---

## 🔄 Asset Return

Managers can process returned assets.

Return form includes:

- Return Date
- Asset Condition
- Remarks

Based on condition:

- Good / Fair → Asset becomes **Available**
- Damaged → Asset moves to **Under Maintenance**

---

## 🛠 Maintenance Management

Automatically created when a damaged asset is returned.

Workflow:

### Pending

Manager creates maintenance request.

↓

### In Progress

Assign technician

Add repair notes

Add repair cost

Maintenance start date recorded.

↓

### Completed

Receive repaired asset

Maintenance completion date recorded

Asset becomes **Available** again.

---

## 📜 Asset Lifecycle Timeline

Every asset maintains a complete history.

Events include:

- Asset Created
- Asset Allocated
- Asset Returned
- Maintenance Started
- Maintenance Completed

Timeline is displayed in reverse chronological order.

---

## 📊 Dashboard

Dashboard provides a quick overview of:

- Total Assets
- Available Assets
- Allocated Assets
- Assets Under Maintenance

---

## 🔍 Search & Filters

Filter assets by:

- Department
- Category
- Status

Search by:

- Asset Name
- Asset Tag

---

## 📈 Statistics

Instant asset statistics displayed on Assets page.

---

# Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Joi Validation

---

# Project Structure

```
Frontend
│
├── React
├── Pages
├── Components
├── Services
└── Context

Backend
│
├── Controllers
├── Services
├── Models
├── Routes
├── Middlewares
├── Validations
└── Config
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
```

## Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Environment Variables

## Backend

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=

CLIENT_URL=http://localhost:5173

JWT_SECRET=

JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

SESSION_TTL_MS=43200000
```

## Frontend

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

# Demo Workflow

1. Login as Manager
2. Add Departments, Categories, Employees (seeded)
3. Create Assets
4. Allocate Assets to Employees
5. Return Assets
6. If Damaged → Maintenance Workflow
7. Complete Maintenance
8. View Asset Lifecycle Timeline

---

# Future Enhancements

- QR Code generation for assets
- Resource Booking Module
- Report Generation
- Email Notifications
- Barcode Scanning
- Analytics Dashboard
- Audit Logs
- Multi-branch Asset Management

---

# Developed For

**Odoo Hackathon 2026**

Enterprise Asset Management System built using the MERN Stack.