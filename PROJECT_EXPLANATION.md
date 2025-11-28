# CareerCraft Platform - Complete Project Explanation
## Mini Project Semester 5 - Viva Presentation Guide

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Development Steps](#4-development-steps)
5. [File Structure & Roles](#5-file-structure--roles)
6. [Key Features Implementation](#6-key-features-implementation)
7. [Database Schema](#7-database-schema)
8. [Backend Services](#8-backend-services)
9. [Frontend Components](#9-frontend-components)
10. [Deployment Configuration](#10-deployment-configuration)

---

## 1. PROJECT OVERVIEW

**CareerCraft** is a comprehensive career readiness platform that helps students and professionals:
- Analyze resumes against job descriptions using AI
- Track job applications with detailed analytics
- Plan daily tasks with Pomodoro timer
- Explore tech companies and interview experiences
- Follow structured learning roadmaps for different tech roles

---

## 2. TECHNOLOGY STACK

### **Frontend (Next.js Stack)**
- **Framework**: Next.js 15.5.4 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives (50+ components)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Theming**: next-themes (dark/light mode)

### **Backend**
- **API Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI server)
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **PDF Processing**: pdfplumber, pdf2image, pytesseract
- **Containerization**: Docker

### **Database**
- **Database**: MongoDB (via Mongoose)
- **Connection**: Connection pooling with caching

### **Development Tools**
- **Package Manager**: npm/pnpm
- **Build Tool**: Next.js built-in bundler
- **Type Checking**: TypeScript

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │  API Routes  │  │
│  │  (App Router)│  │  (UI/Logic)  │  │ (Next.js API)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │              │
                        │              │
        ┌──────────────┘              └──────────────┐
        │                                           │
┌───────▼────────┐                       ┌─────────▼────────┐
│  MongoDB       │                       │  FastAPI Backend │
│  (User Data)   │                       │  (AI Analysis)   │
│                │                       │                  │
│  - Users       │                       │  - PDF Extract   │
│  - Profiles    │                       │  - Gemini AI     │
│  - Skills      │                       │  - OCR Fallback  │
│  - Resumes     │                       │                  │
└────────────────┘                       └──────────────────┘
```

---

## 4. DEVELOPMENT STEPS

### **Step 1: Project Initialization**
1. Created Next.js project with TypeScript
2. Configured Tailwind CSS for styling
3. Set up folder structure following Next.js App Router conventions

### **Step 2: Database Setup**
1. Created MongoDB connection utility (`lib/db.ts`)
2. Defined User schema with Mongoose (`models/User.ts`)
3. Implemented connection pooling for performance

### **Step 3: Authentication System**
1. Built client-side auth context (`components/auth-context.tsx`)
2. Used localStorage for session management (demo purposes)
3. Created login and signup pages (`app/auth/login`, `app/auth/signup`)

### **Step 4: Core Features Development**

#### **4.1 Resume Analyzer**
- Built frontend component (`components/resume-analyzer.tsx`)
- Created FastAPI backend (`backend/app/main.py`, `backend/app/analyzer.py`)
- Integrated Google Gemini AI for intelligent analysis
- Added PDF text extraction with OCR fallback
- Implemented local keyword matching as backup

#### **4.2 Job Tracker**
- Built interactive job tracking component (`components/job-tracker.tsx`)
- Added analytics with Recharts (bar charts, pie charts, line charts)
- Implemented CRUD operations for job applications
- Added filtering and tagging system

#### **4.3 Smart Planner**
- Created planner dashboard (`components/planner-dashboard.tsx`)
- Integrated Pomodoro timer functionality
- Added calendar view (`components/calendar-view.tsx`)
- Implemented task management with progress tracking

#### **4.4 Additional Features**
- Companies Directory (`components/companies-directory.tsx`)
- Interview Experiences (`components/interview-experiences.tsx`)
- Role Roadmaps (`components/role-roadmaps.tsx`)

### **Step 5: API Routes Development**
1. User profile API (`app/api/users/[email]/route.ts`)
2. Skills management API (`app/api/users/[email]/skills/route.ts`)
3. Resume upload API (`app/api/users/[email]/resume/route.ts`)

### **Step 6: UI Component Library**
1. Set up shadcn/ui components (50+ reusable components)
2. Configured theme provider for dark/light mode
3. Created custom components following design system

### **Step 7: Docker Configuration**
1. Created Dockerfile for FastAPI backend
2. Configured system dependencies (poppler-utils, tesseract-ocr)
3. Set up Python environment with all requirements

### **Step 8: Integration & Testing**
1. Connected frontend to backend APIs
2. Tested PDF upload and analysis flow
3. Verified MongoDB operations
4. Tested all features end-to-end

---

## 5. FILE STRUCTURE & ROLES

### **Root Level Files**

#### `package.json`
- **Role**: Defines all npm dependencies and scripts
- **Key Dependencies**: Next.js, React, Tailwind, Radix UI, Mongoose, Recharts
- **Scripts**: `dev` (development), `build` (production), `start` (production server)

#### `tsconfig.json`
- **Role**: TypeScript configuration
- **Features**: Path aliases (`@/*`), strict type checking, ES6 target
- **Purpose**: Ensures type safety across the application

#### `next.config.mjs`
- **Role**: Next.js configuration
- **Settings**: Image optimization, TypeScript build error handling
- **Purpose**: Configures Next.js behavior and build process

#### `README.md`
- **Role**: Project documentation
- **Contains**: Setup instructions, API routes documentation

---

### **Frontend Structure (`app/`)**

#### `app/layout.tsx`
- **Role**: Root layout component
- **Responsibilities**:
  - Wraps entire application
  - Provides AuthProvider context
  - Includes Navbar and Footer
  - Sets up Toast notifications
  - Configures fonts (Geist, Geist Mono)

#### `app/page.tsx`
- **Role**: Homepage component
- **Features**: Landing page with feature cards, call-to-action buttons
- **Purpose**: First impression and navigation hub

#### `app/globals.css`
- **Role**: Global CSS styles
- **Contains**: Tailwind directives, custom CSS variables, theme colors

#### **Page Routes** (`app/*/page.tsx`)
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/resume/page.tsx` - Resume analyzer page
- `app/jobs/page.tsx` - Job tracker page
- `app/planner/page.tsx` - Daily planner page
- `app/companies/page.tsx` - Companies directory
- `app/interviews/page.tsx` - Interview experiences
- `app/roadmaps/page.tsx` - Career roadmaps
- `app/bookmarks/page.tsx` - Saved bookmarks

#### **API Routes** (`app/api/users/[email]/`)
- `route.ts` - GET/PUT user profile
- `skills/route.ts` - PUT skills array
- `resume/route.ts` - POST resume PDF upload

---

### **Components Directory (`components/`)**

#### **Core Components**
- `auth-context.tsx` - Authentication context provider
  - Manages user session (localStorage-based)
  - Provides login, signup, logout functions
  - Handles session persistence

- `navbar.tsx` - Navigation bar component
  - User menu, logout, navigation links
  - Responsive design

- `footer.tsx` - Footer component
  - Site links, copyright information

- `require-auth.tsx` - Route protection HOC
  - Redirects unauthenticated users
  - Protects private routes

#### **Feature Components**
- `resume-analyzer.tsx` - Resume analysis interface
  - PDF upload or text input
  - Job description input
  - Analysis results display (match score, missing keywords, suggestions)
  - Saved resumes/jobs management
  - Integrates with FastAPI backend

- `job-tracker.tsx` - Job application tracker
  - Add/edit/delete job applications
  - Filter by status, type, field
  - Analytics dashboard (charts)
  - Salary tracking
  - Interview date management

- `planner-dashboard.tsx` - Daily planner
  - Task creation and management
  - Pomodoro timer integration
  - Calendar view
  - Productivity charts

- `calendar-view.tsx` - Calendar component
  - Date selection
  - Event display

- `companies-directory.tsx` - Tech companies listing
  - Filter by field (Full Stack, Data Science, etc.)
  - Company information display

- `interview-experiences.tsx` - Interview stories
  - Read interview experiences
  - Bookmark functionality

- `role-roadmaps.tsx` - Career learning paths
  - Structured roadmaps for different roles
  - Skill progression tracking

#### **UI Components** (`components/ui/`)
- **Role**: Reusable UI primitives from shadcn/ui
- **Examples**: Button, Card, Input, Tabs, Dialog, Toast, Calendar, etc.
- **Purpose**: Consistent design system across the app
- **Count**: 50+ components

#### **Theme Provider**
- `theme-provider.tsx` - Dark/light mode switcher
- Uses next-themes library
- Persists theme preference

---

### **Backend Structure (`backend/app/`)**

#### `main.py`
- **Role**: FastAPI application entry point
- **Endpoints**:
  - `POST /analyze` - Analyze resume against job description
  - `GET /health` - Health check endpoint
- **Features**:
  - CORS middleware configuration
  - File upload handling (multipart/form-data)
  - Error handling and validation
  - Integrates with analyzer.py for AI processing

#### `analyzer.py`
- **Role**: Core analysis logic
- **Functions**:
  - `extract_text_from_pdf_bytes()` - PDF text extraction
    - Primary: pdfplumber (direct text extraction)
    - Fallback: pdf2image + pytesseract (OCR for scanned PDFs)
  - `analyze_with_gemini()` - AI-powered analysis using Google Gemini
    - Sends resume and job description to Gemini API
    - Returns match score, missing keywords, suggestions, analysis
  - `_local_baseline_analysis()` - Local keyword matching fallback
    - Used when Gemini API key is not available
    - Tokenization and overlap scoring

#### `requirements.txt`
- **Role**: Python dependencies
- **Packages**:
  - `fastapi` - Web framework
  - `uvicorn[standard]` - ASGI server
  - `python-dotenv` - Environment variables
  - `google-generativeai` - Gemini AI integration
  - `pytesseract` - OCR library
  - `pdfplumber` - PDF parsing
  - `pdf2image` - PDF to image conversion
  - `python-multipart` - File upload support

#### `Dockerfile`
- **Role**: Containerizes the FastAPI backend
- **Steps**:
  1. Base image: `python:3.11-slim`
  2. Install system dependencies: `poppler-utils`, `tesseract-ocr`
  3. Install Python packages from requirements.txt
  4. Copy application code
  5. Run uvicorn server on port 8000
- **Purpose**: Consistent deployment environment

---

### **Database & Models**

#### `lib/db.ts`
- **Role**: MongoDB connection utility
- **Features**:
  - Connection pooling with caching
  - Singleton pattern for connection reuse
  - Error handling
  - Server selection timeout configuration

#### `models/User.ts`
- **Role**: User data model (Mongoose schema)
- **Fields**:
  - `email` (String, unique, indexed)
  - `name` (String)
  - `avatarUrl` (String)
  - `skills` (Array of Strings)
  - `resumePath` (String) - Path to uploaded PDF
  - `profile` (Object):
    - `college` (String)
    - `graduationYear` (Number)
    - `bio` (String)
    - `links` (Object: github, linkedin, portfolio)
  - `timestamps` (createdAt, updatedAt)

---

### **Utilities & Configuration**

#### `lib/utils.ts`
- **Role**: Utility functions
- **Common**: `cn()` function for conditional className merging (Tailwind)

#### `components.json`
- **Role**: shadcn/ui configuration
- **Purpose**: Configures component generation and styling

#### `postcss.config.mjs`
- **Role**: PostCSS configuration
- **Purpose**: Processes Tailwind CSS

---

## 6. KEY FEATURES IMPLEMENTATION

### **Feature 1: Resume Analyzer**

#### **Frontend Flow** (`components/resume-analyzer.tsx`)
1. User uploads PDF or pastes resume text
2. User enters job description (optional)
3. Frontend sends FormData to FastAPI backend
4. Displays analysis results:
   - Match score (0-100)
   - Missing keywords
   - Improvement suggestions
   - Detailed analysis text

#### **Backend Flow** (`backend/app/analyzer.py`)
1. Receives PDF file or text
2. Extracts text from PDF:
   - Tries pdfplumber first (direct extraction)
   - Falls back to OCR if needed (pdf2image + pytesseract)
3. Sends to Gemini AI for analysis
4. Returns structured JSON response
5. If Gemini unavailable, uses local keyword matching

#### **AI Integration**
- Uses Google Generative AI (Gemini 1.5 Flash)
- System prompt guides AI to return structured JSON
- Fallback mechanism for API failures

---

### **Feature 2: Job Application Tracker**

#### **Functionality** (`components/job-tracker.tsx`)
- **CRUD Operations**: Create, read, update, delete job applications
- **Data Structure**:
  - Company name
  - Position title
  - Type (Job/Internship)
  - Tags (Applied, Rejected, On Campus, Referral)
  - Dates (Applied, Interview)
  - Salary information
  - Description/notes
  - Field category

#### **Analytics Dashboard**
- **Bar Chart**: Applications by field
- **Pie Chart**: Distribution by status/tags
- **Line Chart**: Applications over time
- Uses Recharts library for visualizations

#### **Storage**
- Currently uses React state (localStorage can be added)
- Can be integrated with MongoDB for persistence

---

### **Feature 3: Smart Daily Planner**

#### **Features** (`components/planner-dashboard.tsx`)
- Task creation and management
- Pomodoro timer (25-minute focus sessions)
- Calendar integration
- Progress tracking
- Productivity metrics

#### **Implementation**
- React state for task management
- Date-fns for date handling
- Calendar view component for visualization

---

### **Feature 4: User Profile Management**

#### **API Endpoints**
- `GET /api/users/[email]` - Fetch user profile
- `PUT /api/users/[email]` - Update user profile (upsert)
- `PUT /api/users/[email]/skills` - Update skills array
- `POST /api/users/[email]/resume` - Upload resume PDF

#### **File Upload** (`app/api/users/[email]/resume/route.ts`)
- Accepts multipart/form-data
- Validates PDF file type
- Saves to `public/uploads/` directory
- Stores file path in MongoDB
- Uses Node.js `fs` module for file operations

---

## 7. DATABASE SCHEMA

### **User Collection**
```typescript
{
  email: string (unique, indexed)
  name?: string
  avatarUrl?: string
  skills: string[]
  resumePath?: string
  profile: {
    college?: string
    graduationYear?: number
    bio?: string
    links: {
      github?: string
      linkedin?: string
      portfolio?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

### **Connection Strategy**
- Connection pooling via Mongoose
- Cached connections for performance
- Automatic reconnection handling

---

## 8. BACKEND SERVICES

### **FastAPI Application**

#### **Configuration**
- CORS enabled for frontend origin
- Async endpoints for better performance
- Environment variables via `.env`
- Error handling with HTTPException

#### **Endpoints**

##### `POST /analyze`
- **Input**: 
  - `resumeFile` (optional File)
  - `resumeText` (optional string)
  - `jobDesc` (optional string)
- **Process**:
  1. Validates input (at least one resume source)
  2. Extracts text from PDF if file provided
  3. Calls Gemini AI for analysis
  4. Returns analysis result
- **Output**: JSON with match_score, missing_keywords, suggestions, analysis

##### `GET /health`
- **Purpose**: Health check endpoint
- **Returns**: `{"status": "ok"}`

#### **Dependencies**
- **System**: poppler-utils, tesseract-ocr
- **Python**: See requirements.txt

---

## 9. FRONTEND COMPONENTS

### **Architecture Pattern**
- **App Router**: Next.js 13+ routing
- **Server Components**: Default (React Server Components)
- **Client Components**: Marked with `"use client"`
- **Context API**: For authentication state

### **State Management**
- React hooks (useState, useMemo, useEffect)
- Context API for global state (Auth)
- Local state for component-specific data
- localStorage for persistence (session, theme)

### **Styling Approach**
- Tailwind CSS utility classes
- CSS variables for theming
- Radix UI for accessible components
- Responsive design (mobile-first)

### **Component Hierarchy**
```
RootLayout
  ├── AuthProvider
  ├── Navbar
  ├── Main (pages)
  │   ├── HomePage
  │   ├── ResumeAnalyzer
  │   ├── JobTracker
  │   ├── PlannerDashboard
  │   └── ...other pages
  ├── Footer
  └── Toast Providers
```

---

## 10. DEPLOYMENT CONFIGURATION

### **Docker Setup**

#### **Dockerfile** (`backend/app/Dockerfile`)
- **Base**: Python 3.11-slim
- **System Packages**: poppler-utils, tesseract-ocr
- **Python Packages**: From requirements.txt
- **Port**: 8000
- **Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

#### **Usage**
```bash
# Build image
docker build -t careercraft-backend ./backend/app

# Run container
docker run -p 8000:8000 -e GOOGLE_API_KEY=xxx careercraft-backend
```

### **Environment Variables**

#### **Frontend** (`.env.local`)
- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_BACKEND_URL` - FastAPI backend URL (default: http://localhost:8000)

#### **Backend** (`.env`)
- `GOOGLE_API_KEY` - Google Generative AI API key
- `FRONTEND_URL` - Frontend origin for CORS (default: http://localhost:3000)

### **Build Process**

#### **Frontend**
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
```

#### **Backend**
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload  # Development
```

---

## 🎯 KEY TECHNICAL DECISIONS

### **Why Next.js?**
- Server-side rendering for better SEO
- Built-in API routes for backend integration
- App Router for modern React patterns
- Excellent TypeScript support

### **Why FastAPI?**
- High performance (async support)
- Automatic API documentation
- Easy integration with AI services
- Python ecosystem for PDF/AI processing

### **Why MongoDB?**
- Flexible schema for evolving user profiles
- Easy integration with Node.js/Next.js
- Good for document-based data (user profiles)

### **Why Docker?**
- Consistent environment for backend
- Easy deployment
- System dependencies isolation
- Reproducible builds

### **Why Gemini AI?**
- High-quality analysis
- Cost-effective (Flash model)
- Easy API integration
- Good JSON response handling

---

## 📊 PROJECT STATISTICS

- **Total Files**: 100+ files
- **Frontend Components**: 50+ UI components + 10 feature components
- **API Routes**: 3 endpoints (Next.js API) + 2 endpoints (FastAPI)
- **Pages**: 9 main pages
- **Technologies**: 7 major frameworks/libraries
- **Lines of Code**: ~5000+ lines

---

## 🚀 FUTURE ENHANCEMENTS

1. **Authentication**: JWT-based auth instead of localStorage
2. **Database**: Add more collections (jobs, interviews, roadmaps)
3. **Caching**: Redis for session management
4. **Testing**: Unit and integration tests
5. **CI/CD**: Automated deployment pipeline
6. **Real-time**: WebSocket for live updates
7. **Mobile App**: React Native version

---

## 📝 CONCLUSION

CareerCraft is a full-stack web application built with modern technologies, combining:
- **Frontend**: Next.js with React and TypeScript
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **AI**: Google Gemini for intelligent resume analysis
- **UI**: Tailwind CSS and Radix UI
- **Containerization**: Docker

The platform demonstrates proficiency in:
- Full-stack development
- AI/ML integration
- Database design
- API development
- UI/UX design
- DevOps (Docker)

---

**End of Document**



