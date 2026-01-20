I will help you build the Finance Tracker application. I see that a Next.js project is already initialized in the current directory (version 16.1.4, which satisfies the Next.js 14+ requirement). I will proceed with configuring the project and implementing the features as requested.

Here is the implementation plan:

## Phase 1: Setup & Configuration
1.  **Install Dependencies**:
    *   Core: `prisma`, `@prisma/client`, `next-auth` (v5 beta for best App Router support), `bcryptjs`, `zod`.
    *   UI: `shadcn-ui` (via CLI), `lucide-react`, `recharts`.
    *   Dev: `@types/bcryptjs`.
2.  **Initialize shadcn/ui**: Configure for the project (using `src` directory as existing).
3.  **Database Setup**:
    *   Initialize Prisma (`npx prisma init`).
    *   Define the schema in `prisma/schema.prisma` (User, Company, Account, Tag, Expenditure).
    *   **Note**: You will need to provide a valid `DATABASE_URL` in `.env`.
4.  **Authentication Setup**:
    *   Configure NextAuth (`lib/auth.ts` or `auth.ts`) with Credentials provider.
    *   Implement Middleware for route protection.

## Phase 2: Core Features Implementation
5.  **Authentication Pages**:
    *   Create Login and Signup pages (`app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`).
    *   Implement "Join/Create Company" logic during signup.
6.  **Layout & Navigation**:
    *   Create the Dashboard layout (`app/(dashboard)/layout.tsx`) with a sidebar/navbar.
7.  **Account Management**:
    *   Create Server Actions for Account CRUD.
    *   Build Account List and Create/Edit forms.
8.  **Tag Management**:
    *   Create Server Actions for Tag CRUD.
    *   Build Tag management UI.
9.  **Expenditure Logging**:
    *   Create Server Actions for Expenditures (with transaction support for balance updates).
    *   Build the Expenditure form with Account and Tag selection.
    *   Implement the Expenditure List with filters.
10. **Dashboard**:
    *   Implement summary statistics and charts.

## Phase 3: Refinement
11. **Validation & Error Handling**: Ensure Zod validation and user-friendly error messages.
12. **UI Polish**: Verify dark mode and responsiveness.

I will start by installing the dependencies and initializing the project tools.
