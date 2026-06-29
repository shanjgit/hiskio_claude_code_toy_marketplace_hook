# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint linter
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React TypeScript application built with Vite that implements a toy marketplace platform. The app uses:

- **Frontend Framework**: React 18 with TypeScript and Vite
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom animations
- **Backend**: Supabase for authentication, database, and real-time features
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: React Router DOM with file-based page structure

### Project Structure

- `src/pages/` - Page components following React Router structure
  - Categories (home page), Auth, Profile, ProductDetail, CreateListing/CreateListingForm
  - Conversation system: ConversationList, ConversationDetail
  - SavedItems for user bookmarks
- `src/components/` - Reusable UI components
  - NavigationBar, ProductCard, FilterSheet, HamburgerMenu
  - `src/components/ui/` - shadcn/ui components
  - `src/components/auth/` - Authentication-related components
- `src/integrations/supabase/` - Supabase client configuration and TypeScript types
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React contexts including PresenceProvider for real-time features

### Database Schema

Key Supabase tables include:
- `conversations` - Chat conversations between users
- `products` - Marketplace listings
- `users` - User profiles and authentication data

## Development Guidelines

### File Naming
- Use camelCase for files: `CreateListingForm.tsx`

### Supabase Integration
- Always check existing RPC functions in Supabase before creating new ones
- When accessing data across joined tables, create new RPC functions to avoid RLS permission issues
- Supabase types are auto-generated in `src/integrations/supabase/types.ts`

### Security
- Never commit PII information such as emails
- Follow RLS (Row Level Security) policies defined in Supabase

### Pending Features
- Image upload feature in conversation system (see README_TODO.md)

## Key Dependencies

- **UI**: @radix-ui components, shadcn/ui, Tailwind CSS, Lucide icons
- **Data Fetching**: @tanstack/react-query, @supabase/supabase-js
- **Forms**: react-hook-form with @hookform/resolvers and zod validation
- **Charts**: recharts for data visualization
- **Notifications**: sonner for toast messages