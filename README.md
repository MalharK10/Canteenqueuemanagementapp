# Canteen Queue Management

A full-stack canteen ordering and queue management system for colleges. The frontend lets students browse the menu, build a cart, place orders, and track queue status in real time. The backend handles authentication, menu management, order processing, profile updates, and admin operations.

## Project Structure

This repository is split into two apps:

- `frontend/` - React + Vite UI for students and admins
- `backend/` - Express + TypeScript API with PostgreSQL persistence

## Features

### Frontend

- Student login and signup flows
- Admin login and dashboard
- Menu browsing with category filters
- Cart and order placement
- Live order tracking and queue updates
- Profile setup and profile editing

### Backend

- JWT-based authentication with cookie sessions
- Menu item APIs for public browsing and admin management
- Order APIs for placing orders and tracking queue position
- Admin APIs for menu and order moderation
- PostgreSQL persistence
- Optional AWS S3 image upload support for profile and menu assets

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Radix UI components
- MUI icons and supporting UI libraries

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- JSON Web Tokens
- bcrypt
- AWS SDK for S3 uploads

## Getting Started

### 1. Install dependencies

Install the backend and frontend dependencies separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create a `.env` file in `backend/` with the required values. You can use either `DATABASE_URL` or the individual PostgreSQL fields.

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/canteen
JWT_SECRET=replace-with-a-strong-secret
CLIENT_URL=http://localhost:5173

# Optional S3 settings for image uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

### 3. Run database migrations and seeds

From the `backend/` folder:

```bash
npm run migrate
npm run seed
npm run seed:admin
```

### 4. Configure the frontend

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running Locally

### Backend

```bash
cd backend
npm run dev
```

The backend API listens on port `3000` and exposes routes under `/api`.

### Frontend

```bash
cd frontend
npm run dev
```

The frontend runs with Vite and talks to the backend through `VITE_API_BASE_URL`.

## API Overview

The backend exposes these route groups:

- `/api/auth` - user registration, login, logout, and session lookup
- `/api/menu` - public menu listing and category filtering
- `/api/orders` - user order creation, order history, and queue info
- `/api/profile` - profile details and profile picture updates
- `/api/admin` - admin login, menu management, and order status updates

## What The App Does

Students can sign up, log in, browse the menu, add items to a cart, place an order, and monitor queue status while the kitchen processes the order. Admins can log in separately, manage menu items, and update order statuses from the dashboard.

## Notes

- The frontend expects the backend to be reachable through `VITE_API_BASE_URL`.
- If you enable S3 uploads, make sure the bucket policy allows the generated public URLs to be served.
- The backend requires PostgreSQL to be available before startup.
