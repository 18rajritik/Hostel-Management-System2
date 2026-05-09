# Hostel Management System

A modern full-stack Hostel Management System for students and hostel administrators. It uses a vanilla HTML/CSS/JavaScript frontend, Node.js + Express.js backend, MongoDB with Mongoose, JWT authentication, role-based access, and modular MVC structure.

## Features

- Student registration and login
- Admin login with protected admin routes
- JWT authentication and bcrypt password hashing
- Student dashboard for profile updates, room applications, complaints, and fee records
- Admin dashboard for students, rooms, applications, complaints, payments, and analytics
- Room CRUD with capacity, occupancy, floor, block, and status
- Complaint workflow with Pending, In Progress, and Resolved statuses
- Hostel fee/payment tracking with due dates and payment status
- Search, filters, pagination, loading spinner, toast notifications, and modal forms
- Responsive dashboard layout with sidebar and mobile-friendly tables

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript, Fetch API, Local Storage
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Security: JWT, bcryptjs, helmet, role-based middleware
- Validation: express-validator

## Folder Structure

```text
.
├── config/              # MongoDB connection
├── controllers/         # MVC controller logic
├── middleware/          # Auth, role checks, validation, error handling
├── models/              # Mongoose schemas
├── public/              # CSS and browser JavaScript
├── routes/              # REST API routes
├── seed/                # Dummy data script
├── utils/               # Shared backend helpers
├── views/frontend/      # HTML pages
├── app.js               # Express app setup
├── server.js            # Server entry point
└── package.json
```

## Required NPM Packages

Runtime dependencies:

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken express-validator cors helmet morgan
```

Development dependency:

```bash
npm install -D nodemon
```

Or install everything from `package.json`:

```bash
npm install
```

## Local Setup

1. Install MongoDB locally, or use a MongoDB Atlas connection string.

2. Copy the example environment file:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

3. Update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hostel_management
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
```

4. Install dependencies:

```bash
npm install
```

5. Seed sample data:

```bash
npm run seed
```

6. Start the app:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

## Demo Logins

After running the seed script:

- Admin: `admin@hostel.com` / `admin123`
- Student: `aarav@student.com` / `student123`

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `PUT /api/users/me`
- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `GET /api/applications`
- `POST /api/applications`
- `PUT /api/applications/:id`
- `GET /api/complaints`
- `POST /api/complaints`
- `PUT /api/complaints/:id`
- `GET /api/payments`
- `POST /api/payments`
- `PUT /api/payments/:id`
- `DELETE /api/payments/:id`
- `GET /api/analytics`

## Beginner Notes

- `protect` middleware checks the JWT token before secure API requests.
- `authorize("admin")` and `authorize("student")` restrict routes by role.
- Passwords are hashed automatically in the `User` model before saving.
- The frontend stores the JWT token in Local Storage and sends it with protected Fetch API requests.
- Admin-only routes are still protected on the server, even if someone tries to call them manually.

## Optional Enhancements You Can Add

- Email notifications for complaints and payment reminders
- Dark mode toggle
- Attendance module
- QR-code room verification
- Payment gateway integration
- Chat support between students and admins
