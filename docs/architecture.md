# System Architecture

## Overview
The architecture follows a Clean Architecture approach with a modular design, ensuring strict separation of concerns and high scalability.

## Backend Architecture
- **Framework**: NestJS
- **Pattern**: Modular Type A (Functional Modules) with Repository Pattern
- **Database**: PostgreSQL with Prisma ORM

### Layers
1. **Controller Layer**: Handles HTTP requests/responses, input validation (DTOs).
2. **Service Layer**: Contains business logic.
3. **Repository Layer**: Handles data access and abstraction over Prisma.
4. **Data Access Layer**: Prisma Client interacting with PostgreSQL.

### Key Components
- **Auth Module**: JWT-based authentication.
- **Recommendations Module**: Implements Strategy Pattern for pluggable algorithms.
- **Common Module**: Shared utilities, guards, and interceptors.

## Frontend Architecture
- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS
- **State Management**: Context API with Reducer pattern

### Structure
- **/app**: Pages and routing logic.
- **/features**: Feature-specific business logic.
- **/components**: Reusable UI and layout components (server/client separation).
- **/services**: API communication layer.
