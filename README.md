# 🏪 Store Rating System - Developer Guide

> A comprehensive store rating platform with role-based access control, allowing users to browse and rate stores, store owners to manage listings, and administrators to oversee the entire system.

---

## 🚀 Live Demo & Repository
- **Backend**: [https://demo-o729.onrender.com](https://demo-o729.onrender.com)  
- **Frontend**: [https://demo-1-rjfr.onrender.com](https://demo-1-rjfr.onrender.com)  
- **GitHub**: [sunilsonumonu12/Demo](https://github.com/sunilsonumonu12/Demo)  

---

## 📖 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
   - [🔐 Authentication System](#authentication-system)
   - [👤 User Features](#user-features)
   - [🏬 Store Owner Features](#store-owner-features)
   - [🛠️ Admin Features](#admin-features)
4. [🗄️ Database Structure](#database-structure)
5. [🔗 API Endpoints](#api-endpoints)
6. [🔒 Security Features](#security-features)
7. [🎨 UI Components](#ui-components)
8. [⚙️ Getting Started](#getting-started)
9. [📈 Areas for Improvement](#areas-for-improvement)
10. [🙏 Acknowledgements](#acknowledgements)

---

## Overview
This Store Rating System is designed to let end-users browse and rate stores, store owners manage their listings, and administrators oversee the platform. It features role-based access control, a responsive frontend, and a RESTful backend.

---

## Tech Stack
- **Frontend**:  
  - ⚛️ React + Vite  
  - 🎨 Tailwind CSS  
  - 📱 Responsive design (mobile, tablet, desktop)
- **Backend**:  
  - 🟢 Node.js + Express  
  - 🐬 MySQL database  
  - 🌐 RESTful API architecture

---

## Key Features

### 🔐 Authentication System
- **User Registration & Login**  
  - ✅ Comprehensive validation (client + server)  
  - 🎭 Role-based login: `Admin`, `Store Owner`, `User`  
  - 🔄 Persistent auth using `localStorage`  
  - 🚧 Protected routes based on user roles  
- **Password Management**  
  - 🔄 Update current password via API

---

### 👤 User Features
- 🔍 Browse all stores with search/filter by name & address  
- ⭐ Submit or update ratings (1–5 stars) + optional comments  
- 📝 View and edit own profile & update password  
- 📊 Dashboard shows user info & past ratings  
- 📱 Fully responsive experience

---

### 🏬 Store Owner Features
- 🏷️ View & manage own store details  
- 📈 See detailed rating stats for their store  
- 👥 View list of users who rated their store  
- ✏️ Update store info (name, address, etc.)  
- 🔔 (Optionally) Notifications when new ratings arrive

---

### 🛠️ Admin Features
- 📊 Dashboard with system-wide statistics:  
  - 👥 Total users count  
  - 🏪 Total stores count  
  - ⭐ Total ratings count
- 👤 **User Management**:  
  - 📋 List all users  
  - ➕ Create new user accounts  
  - 🔍 View user details
- 🏬 **Store Management**:  
  - 📋 List all stores  
  - ➕ Create new store entries  
  - 🔗 Assign stores to store owners  
- 🔄 (Optionally) Bulk operations: deactivate/reactivate users or stores

---

## 🗄️ Database Structure

**Tables:**

1. **`users`**  
   - `id` (PK)  
   - `name`  
   - `email` (unique)  
   - `address`  
   - `password`  
   - `role` (`Admin` / `Store Owner` / `User`)  
   - `created_at` (timestamp)

2. **`stores`**  
   - `id` (PK)  
   - `name`  
   - `email` (contact for store)  
   - `address`  
   - `owner_user_id` (FK → `users.id`)  
   - `created_at` (timestamp)

3. **`ratings`**  
   - `id` (PK)  
   - `store_id` (FK → `stores.id`)  
   - `user_id` (FK → `users.id`)  
   - `rating` (INT, 1–5)  
   - `comment` (TEXT, optional)  
   - `created_at` (timestamp)

---

## 🔗 API Endpoints

### Authentication
- **POST** `/api/auth/register`  
  - Register a new user  
  - Body: `{ name, email, address, password, role? }`
- **POST** `/api/auth/login`  
  - Login existing user  
  - Body: `{ email, password }`
- **PUT** `/api/auth/password`  
  - Update password for logged-in user  
  - Body: `{ oldPassword, newPassword }`

### Admin
- **GET** `/api/admin/users`  
  - Get list of all users
- **GET** `/api/admin/users/:id`  
  - Get single user details
- **POST** `/api/admin/users`  
  - Create a new user (Admin can set role)
  - Body: `{ name, email, address, password, role }`
- **GET** `/api/admin/stores`  
  - Get list of all stores
- **POST** `/api/admin/stores`  
  - Create a new store  
  - Body: `{ name, email, address, owner_user_id }`
- **GET** `/api/admin/stores/owner/:ownerId`  
  - Get store(s) by owner ID
- **GET** `/api/admin/stores/:storeId/ratings/users`  
  - Get list of users who rated a particular store

### User
- **GET** `/api/user/stores`  
  - Get all stores, including whether current user has rated them (and the rating)
- **POST** `/api/user/stores/:storeId/rate`  
  - Submit or update rating for a store  
  - Body: `{ rating, comment? }`

> 🔐 All protected routes require a valid JWT (or chosen token) in headers.  
> 🚫 Access control: endpoints under `/api/admin/...` restricted to Admin role, `/api/user/...` accessible to Users and Owners as appropriate.

---

## 🔒 Security Features
- ✅ Client-side & server-side form validation  
- 🔐 Passwords: **(Note: currently plaintext—see Areas for Improvement)**  
- 🚧 Protected routes with role-based checks in middleware  
- 🔄 Token-based authentication stored in `localStorage` (or HTTP-only cookies if upgraded)
- 🛡️ Input sanitization to prevent SQL injection / XSS
- 📝 Logging of auth events (login failures, password changes)

---

## 🎨 UI Components
- **Modern, responsive design** using Tailwind CSS  
- **Gradient backgrounds** for headers/cards for visual appeal  
- **Interactive elements**:  
  - Hover effects on buttons/cards  
  - Smooth animations (e.g., fade-in lists, loading spinners)  
- **Forms** with inline validation feedback (e.g., red border + icon on error)  
- **Loading states & error handling**:  
  - Spinners or skeleton loaders when fetching data  
  - User-friendly error messages (e.g., “Unable to load stores. Please try again.”)  
- **Mobile-first layouts**: collapsible navbars, bottom tabs if needed  
- **Dashboard cards** summarizing stats (using simple charts or badges)

---

## ⚙️ Getting Started

### Prerequisites
- 🔧 Node.js (v14+ recommended) and npm/yarn  
- 🐬 MySQL database (or compatible, e.g., MariaDB)

### Setup Steps
1. **Clone the repository**  
   ```bash
   git clone https://github.com/sunilsonumonu12/Demo.git
   cd Demo
