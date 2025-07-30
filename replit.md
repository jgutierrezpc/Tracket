# Activity Tracker Application

## Overview

This is a full-stack activity tracking application built with a modern tech stack. The application allows users to track sports activities (padel, tennis, pickleball) with detailed information including duration, club details, ratings, and notes. It features a React frontend with shadcn/ui components and an Express backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **API Design**: RESTful endpoints with JSON responses

### Database Schema
- **Users Table**: Basic user authentication (id, username, password)
- **Activities Table**: Sports activity tracking with fields for:
  - Basic info (date, sport, duration, activity type)
  - Club details (name, location, map link)
  - Session data (rating, racket, partner, opponents, notes)
  - Timestamps (created_at)

## Key Components

### Frontend Components
- **Dashboard**: Main application view with activity overview
- **Activity Management**: Forms for creating and editing activities
- **Data Visualization**: Heatmap for activity frequency, statistics overview
- **Sport Filtering**: Tabbed interface for filtering by sport type
- **Responsive Design**: Mobile-first approach with dark/light theme support

### Backend Components
- **Storage Layer**: Abstract interface with in-memory implementation for development
- **Route Handlers**: CRUD operations for activities and users
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware
- **Development Tools**: Hot reload with Vite integration

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Business Logic**: Storage layer abstracts database operations
4. **Database**: PostgreSQL stores persistent data via Drizzle ORM
5. **Response**: JSON data flows back through the same path
6. **Client State**: TanStack Query manages caching and synchronization

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Data Fetching**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Hookform resolvers
- **Date Utilities**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Error Handling**: Runtime error modal for development
- **TypeScript**: Strict type checking across the entire stack

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Drizzle migrations stored in `migrations/` directory

### Environment Configuration
- **Development**: Uses tsx for direct TypeScript execution
- **Production**: Compiled JavaScript with external packages
- **Database**: Requires `DATABASE_URL` environment variable

### Project Structure
- **Monorepo**: Client and server code in same repository
- **Shared Types**: Common TypeScript types in `shared/` directory
- **Asset Management**: Static assets served from Express in production
- **Path Aliases**: TypeScript path mapping for clean imports

The application follows modern full-stack development practices with type safety, component reusability, and efficient data management. The architecture supports both development and production environments with appropriate tooling for each context.