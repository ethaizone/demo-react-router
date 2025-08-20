# React Router Demo Project

This is a demo project showcasing React Router's capabilities in a full-stack application. It demonstrates how to create frontend routes, handle AJAX requests that connect directly to a database, and implement Server-Sent Events (SSE) for real-time streaming.

## Features

- 🚀 Full-stack application with unified codebase
- ⚡️ End-to-end type safety
- 🔄 Direct database access from routes
- 📶 Real-time streaming with Server-Sent Events (SSE)
- 🔒 TypeScript by default
- 🎯 Modern React with React Router v7
- 📖 [React Router docs](https://reactrouter.com/)

## Project Structure

- `app/routes.ts` - Central routing configuration
- `app/root.tsx` - Root component and main layout setup
- `app/layout.tsx` - Shared UI layout components
- `app/routes/` - Individual route components
  - `users/` - Example route with database integration
  - `stream.tsx` - Demo of Server-Sent Events (SSE)
- `app/models/` - Server-side data logic (files end with `.server.ts`)
- `app/db/` - Database configuration and schema
  - `schema.ts` - Database schema definition
  - Drizzle ORM instance

## Demo Routes

- **Users API**: `GET /users` - Example of database integration
- **Streaming Demo**: `/stream` - Real-time updates with Server-Sent Events

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## End-to-End Testing

This repo includes Playwright for E2E tests that exercise real route logic (loaders/actions, DB, SSR).

- Install Playwright and browsers:

```bash
npm install
npx playwright install
```

- Run tests (builds app and serves on port 3000):

```bash
npm run test:e2e
```

- Open the Playwright UI:

```bash
npm run test:e2e:ui
```

Notes:
- Tests run the built server via `npm run start:ci` and isolate the database using `DATABASE_URL=./pgdata-e2e`.
- Example specs live in `e2e/` and cover the home page and basic Users CRUD.
