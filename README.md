<p align="center">
  <img src="public/Taskforge-New-Logo.svg" alt="TaskForge logo" width="110"/>
</p>

<h1 align="center">TaskForge Frontend</h1>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F26" alt="React"/></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"/></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-latest-000000?logo=bun&logoColor=white" alt="Bun"/></a>
  <a href="https://github.com/css-modules/css-modules"><img src="https://img.shields.io/badge/CSS%20Modules-styled-1572B6?logo=css3&logoColor=white" alt="CSS Modules"/></a>
</p>

A modern, full-featured frontend for TaskForge built with Next.js 16 and React 19. This application provides the user-facing web interface for task and organization management, featuring real-time state management, form validation, and a sleek dark-themed UI with glassmorphism design patterns.

## Features

- **Authentication System**: Secure login/registration with JWT token management
- **Organization Management**: Create, manage, and invite team members to organizations
- **Dashboard**: Central hub for viewing and managing tasks and team information
- **Project Mission Control**: per-project dashboard with a progress header, Gantt-style
  timeline, weekly velocity chart, priority distribution donut and a live activity feed
- **Kanban Board**: real-time drag-and-drop board with multi-assignee avatar clusters,
  colored labels, due dates and per-card progress pills
- **Project Import/Export**: portable JSON project templates with a preview-before-import flow
- **Real-time UI Updates**: Powered by React Query for efficient server state management
- **Custom Design System**: Glassmorphism dark theme with pure CSS and CSS Modules
- **Form Validation**: Robust form handling with React Hook Form and Zod
- **Responsive Design**: Mobile-friendly interface that works across all devices
- **API Integration**: Seamless connection to Django backend API

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Runtime**: [Bun](https://bun.sh)
- **Language**: JavaScript (ES2024)
- **Styling**: Pure CSS with CSS Modules + Custom Design System
- **State Management**: 
  - `zustand` - Client/auth state
  - `@tanstack/react-query` - Server state & API caching
- **Forms & Validation**:
  - `react-hook-form` - Form state management
  - `@hookform/resolvers` - Form validation integration
  - `zod` - Schema validation
- **Theme**: `next-themes` - Light/dark theme support
- **Charts**: `recharts` - Dashboard analytics (velocity & distribution)
- **Dev Tools**: ESLint 9, Playwright smoke script (`scripts/smoke-board.cjs`)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (or Node.js 20+)
- A running instance of the TaskForge Django backend

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd taskforge-frontend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.jsx               # Root layout
│   ├── page.jsx                 # Home page
│   ├── globals.css              # Global styles & CSS variables
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/             # Dashboard route group
│       ├── page.jsx             # Dashboard home
│       └── orgs/[slug]/         # Organization detail page
│
├── components/                   # Reusable React components
│   ├── auth/                    # Authentication forms
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── QueryProvider.jsx
│   ├── orgs/                    # Organization components
│   │   ├── OrgCard.jsx
│   │   ├── MemberTable.jsx
│   │   └── InviteModal.jsx
│   └── ui/                      # Reusable UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── Avatar.jsx
│
├── lib/                         # Utilities and helpers
│   ├── api/                     # API client functions
│   │   ├── client.js           # Axios instance with auth
│   │   ├── auth.js             # Auth API endpoints
│   │   └── orgs.js             # Organization API endpoints
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js          # Auth hook
│   │   └── useOrgs.js          # Organizations hook
│   ├── store/                   # Zustand stores
│   │   └── authStore.js        # Authentication state
│   └── types/                   # Type definitions
│
└── public/                       # Static assets
```

## Architecture & Design Decisions

### State Management Architecture

We maintain a strict separation between **auth state** and **server state**:

- **Zustand (`authStore.js`)**: Manages client-side authentication state
  - User profile information
  - JWT tokens
  - Authentication status
  - Persisted to `localStorage` via middleware

- **TanStack Query**: Manages all server state
  - Organization data
  - Task information
  - Automatic caching & invalidation
  - Real-time synchronization

### Authentication Flow

1. User logs in via the login form
2. Backend returns JWT token
3. Token is stored in Zustand store with persistence
4. Token automatically included in all API requests via `client.js`
5. Route protection handled by middleware checking `taskforge_authenticated` cookie

### Token Storage Strategy

**Local Storage** (not `httpOnly` cookies) is used for:
- **Pros**: Simpler local development, easier debugging, portfolio-friendly
- **Cons**: Vulnerable to XSS attacks in production

In production, consider migrating to `httpOnly` cookies with CSRF protection.

### Styling Approach

We use **pure CSS with CSS Modules** instead of Tailwind CSS for:
- **Total aesthetic control** over the glassmorphism dark theme
- **CSS Custom Properties** (`globals.css`) for centralized design tokens
- **Scoped styling** via `*.module.css` files preventing class conflicts
- **Smaller bundle size** compared to utility-first frameworks

## Development

### Available Commands

```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run ESLint
bun run lint
```

### Development Workflow

1. Create a new branch for your feature
2. Make changes to components/pages
3. Test locally at `http://localhost:3000`
4. Ensure linting passes: `bun run lint`
5. Commit and push changes

### Adding New Pages

1. Create a new folder in `src/app/(dashboard)` or `src/app/(auth)`
2. Add a `page.jsx` file:
   ```jsx
   export default function PageName() {
     return (
       <div>
         {/* Your content */}
       </div>
     );
   }
   ```

### Adding New Components

1. Create a component in `src/components/[category]/ComponentName.jsx`
2. Create a corresponding style file `ComponentName.module.css`
3. Export from the component directory if needed

### API Integration

All API calls should use the client from `src/lib/api/client.js`:

```javascript
import client from '@/lib/api/client';

export async function getOrganizations() {
  const { data } = await client.get('/api/orgs/');
  return data;
}
```

The client automatically:
- Attaches JWT authentication headers
- Handles base URL configuration
- Includes request/response interceptors

## Building & Deployment

### Build for Production

```bash
bun run build
```

This creates an optimized production build in the `.next` directory.

### Docker Deployment

A `Dockerfile` is included for containerized deployment:

```bash
docker build -t taskforge-frontend .
docker run -p 3000:3000 taskforge-frontend
```

### Environment Variables for Production

Update `.env.local` with production values:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

## API Documentation

The frontend communicates with a Django REST API. Key endpoints:

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Organizations
- `GET /api/orgs/` - List user's organizations
- `POST /api/orgs/` - Create new organization
- `GET /api/orgs/{slug}/` - Get organization details
- `PUT /api/orgs/{slug}/` - Update organization
- `DELETE /api/orgs/{slug}/` - Delete organization
- `POST /api/orgs/{slug}/invite/` - Invite member to organization

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

For complete API documentation, see the [TaskForge Backend](https://github.com/taskforge/backend) repository.

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or specify a different port
bun run dev -- -p 3001
```

### API Connection Issues

1. Ensure Django backend is running on `http://localhost:8000`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS settings in Django backend
4. Check browser console for network errors

### Clear Cached Data

```bash
# Clear Next.js cache
rm -rf .next

# Clear Zustand store (browser dev tools)
# Open DevTools → Application → Local Storage → Remove taskforge entries
```

## Performance Optimization

- **Code Splitting**: Next.js automatically code-splits routes
- **Image Optimization**: Use `next/image` for images
- **CSS-in-JS**: CSS Modules prevent unused styles from being shipped
- **Query Caching**: React Query caches API responses automatically

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the TaskForge SaaS application. See the main repository for license details.

## Support

For issues, questions, or suggestions:
1. Check existing [GitHub Issues](https://github.com/taskforge/frontend/issues)
2. Create a new issue with detailed information
3. Include screenshots or error logs when applicable

## Related Projects

- [TaskForge Backend](https://github.com/Abdullah-Masood-05/taskforge-backend.git) - Django REST API
