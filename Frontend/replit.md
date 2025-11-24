# Overview

A meal pre-order platform built with React that allows customers to order customizable meals from restaurants. The system supports different user roles (admin, customer, merchant) with features for meal customization, store management, and order processing. The platform focuses on Sri Lankan cuisine with configurable main dishes, curries, and portion sizes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with Vite for fast development and building
- **Routing**: React Router DOM for single-page application navigation
- **State Management**: Local storage for demo data persistence, React hooks for component state
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Radix UI primitives for accessible, unstyled components with custom styling
- **Animation**: Framer Motion for smooth transitions and interactions

## Component Structure
- **UI Library**: Custom component library built on Radix UI primitives
- **Design System**: Consistent theming with light/dark mode support via CSS custom properties
- **Utility Functions**: Class name merging utilities for conditional styling
- **Toast System**: Custom toast notification system with state management

## Data Management
- **Demo Data**: Local storage-based user management with predefined roles
- **Pricing Engine**: Configurable pricing system for meals, portions, and add-ons
- **Meal Configuration**: Flexible meal composition with main dishes, vegetarian/non-vegetarian curries
- **Store Settings**: Merchant-configurable pricing, availability, and business hours

## User Role System
- **Admin**: Platform administration and user approval
- **Merchant**: Store management, menu configuration, order processing
- **Customer**: Meal ordering and customization

## Pricing Architecture
- **Base Pricing**: Main meal prices by portion size (full, half, small)
- **Add-on Pricing**: Extra charges for additional curries beyond free allowance
- **Divisible Items**: Per-piece pricing for items like chicken and fish
- **Non-divisible Items**: Fixed pricing with optional extra piece charges

# External Dependencies

## Core Frontend Dependencies
- **React Ecosystem**: React 18.2.0, React DOM, React Router DOM for navigation
- **Build Tools**: Vite for development server and building, PostCSS with Autoprefixer

## UI and Styling
- **Radix UI**: Complete suite of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework with animations plugin
- **Framer Motion**: Animation library for enhanced user interactions
- **Lucide React**: Icon library for consistent iconography

## Utility Libraries
- **Class Variance Authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional class name utilities
- **cmdk**: Command palette component
- **UUID**: Unique identifier generation
- **React Helmet**: Document head management

## Development Tools
- **Babel**: Code transformation and parsing tools
- **ESLint**: Code linting with React-specific rules
- **TypeScript Types**: Type definitions for Node.js and React
- **Terser**: JavaScript minification for production builds

Note: The application currently uses local storage for data persistence but is architected to easily integrate with backend services and databases for production deployment.