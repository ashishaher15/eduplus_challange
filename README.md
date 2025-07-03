🏗️ Tender Management Platform – Developer Guide
A complete system for managing tenders with role-based access. End-users can rate companies, contractors can manage their listings, and admins oversee everything through a secure backend.

🚀 Live Links
Backend: https://your-backend-url.com

Frontend: https://your-frontend-url.com

GitHub: sunilsonumonu12/TenderPlatform

📚 Table of Contents
Overview

Tech Stack

🔐 Authentication Flow

👤 User Features

🏢 Contractor Features

🛠️ Admin Features

🗄️ Database Structure

🔗 API Endpoints

🔒 Security Highlights

🖼️ Storage Integration

⚙️ Getting Started

🔍 Overview
A rating and proposal submission platform tailored for contractors and tender management. Features include authentication, store management, and rating analytics.

🧱 Tech Stack
Frontend

⚛️ React + Vite

🎨 Tailwind CSS

📱 Responsive UI

Backend

🟢 Node.js + Express

🐘 PostgreSQL

🌐 REST API

🪣 Supabase (for file storage)

🔐 Authentication System
Role-based login: user, contractor, admin

Protected API routes based on roles

Profile image upload via Supabase

JWT authentication (customizable)

👤 User Features
🔍 Browse companies with filter/search

⭐ Rate companies (1–5 stars) with optional proposal

📝 View/edit profile & upload profile image

📊 Dashboard to track submissions

🏢 Contractor Features
🏪 Create and manage their own companies

📈 See all ratings/proposals for their companies

👥 View users who rated them

✏️ Update store details anytime

🛠️ Admin Features
👥 View, create, and manage users

🏪 View and assign stores to contractors

📊 View system-wide stats: user/store/rating count

🔍 Moderate rating activity

🗄️ Database Structure
users
id, name, email, address, password, role, profile_image_url, created_at

companies
id, name, email, address, owner_user_id (FK), created_at

applications/ratings
id, company_id (FK), user_id (FK), rating, comment, proposal, created_at

🔗 API Endpoints
Auth
POST /api/auth/register

POST /api/auth/login

PUT /api/auth/password

POST /api/auth/profile-image

GET /api/auth/profile/:userId

User
GET /api/user/stores

POST /api/user/stores/:storeId/rate

Admin
GET /api/admin/users

GET /api/admin/users/:id

POST /api/admin/users

GET /api/admin/stores

POST /api/admin/stores

GET /api/admin/stores/owner/:ownerId

GET /api/admin/stores/:storeId/ratings/users

🔒 Security Features
✅ Input validation (server-side)

🔐 Role-based route protection

🚫 CORS + Headers for secure API calls

🧪 Plaintext password warning (hashing recommended)

🧹 Event logging (optional)

🖼️ Storage Integration (Supabase)
Profile image upload from Base64

Stored in profile-images bucket

Filenames = userId_timestamp

Public URL saved in DB for frontend use

⚙️ Getting Started
Prerequisites
Node.js v14+

