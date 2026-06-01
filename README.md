# Bytelink

A starter kit for a modern URL shortener built with React, Vite, Tailwind CSS, Express, and MongoDB.

## Overview

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB + Mongoose
- Monorepo managed with npm workspaces

## Why this setup

- Fast local development with Vite and hot module replacement
- Clean UI foundation using Tailwind for styling
- Simple Express API structure ready for extension
- MongoDB connection boilerplate already wired

## Project Structure

- `frontend/` - React application
- `backend/` - Express API server

## Getting Started

1. Install dependencies from the repo root:

```bash
npm install
```

2. Copy the example environment files and update values as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start the backend and frontend in parallel:

```bash
npm run dev:backend
npm run dev:frontend
```

## Conventions

- The backend exposes API endpoints under `/api`
- The frontend uses React Router for page navigation
- Business logic and database models should be added inside `backend/src`
- UI pages should be added inside `frontend/src/pages`
