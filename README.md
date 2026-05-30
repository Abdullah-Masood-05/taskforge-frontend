# taskforge-frontend

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=0B1F26)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-latest-000000?logo=bun&logoColor=white)](https://bun.sh)
[![CSS Modules](https://img.shields.io/badge/CSS%20Modules-styled-1572B6?logo=css3&logoColor=white)](https://github.com/css-modules/css-modules)

This is a [Next.js](https://nextjs.org) 15 (App Router) project providing the user-facing web interface for TaskForge.
It uses TypeScript, a pure CSS custom design system, and connects to the TaskForge Django API.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Pure CSS (CSS Modules) + Custom Design System
- **State**: `zustand` (client/auth state), `@tanstack/react-query` (server state)
- **Forms**: `react-hook-form` + `zod`

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   *Ensure `NEXT_PUBLIC_API_URL` points to your running Django backend (default: `http://localhost:8000`).*

3. Run the development server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture & Design Decisions

### Auth State vs Server State
We maintain a strict boundary between "Who is the user?" and "What data is on the screen?".
- **Zustand** owns the auth state (user profile, JWT tokens).
- **TanStack Query** owns all server state (org lists, task data).

### Token Storage (Local Storage vs Cookies)
As a portfolio project, this app stores JWT tokens in `localStorage` (via Zustand persist middleware) instead of `httpOnly` cookies. This makes local development simpler and avoids cross-origin cookie CSRF configuration.
Next.js Edge Middleware checks a lightweight non-sensitive `taskforge_authenticated` cookie to handle route protection (since Edge Middleware cannot access `localStorage`). The actual `Authorization: Bearer <token>` header is automatically attached to API requests by `src/lib/api/client.ts`.

### Styling
We avoid Tailwind CSS in favor of a robust, custom design system built with CSS Custom Properties (`src/app/globals.css`) and scoped CSS Modules (`*.module.css`). This provides total control over the glassmorphism dark theme aesthetics.
