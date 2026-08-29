Yes. Copy-paste this **entire content** into:

```text
docs/architecture/system-design.md
```

````markdown
# AI Personal OS — System Design

## 1. Overview

AI Personal OS is a multi-user, AI-powered personal productivity platform.

The platform allows users to manage their personal goals, tasks, notes, and other personal information while providing AI-powered assistance.

The system is designed with security, scalability, reliability, and maintainability as core requirements.

---

## 2. Project Goals

The main goals of the system are:

- Support multiple users
- Keep every user's data isolated
- Provide secure authentication and authorization
- Provide personal goals, tasks, and notes
- Provide AI-powered assistance
- Build a scalable backend architecture
- Maintain a smooth user experience
- Deploy and operate the application in a production environment

---

## 3. Core Principle

The most important security principle is:

> One user must never be able to access another user's private data.

The backend must never trust the frontend to determine resource ownership.

The authenticated user's identity must be used when accessing protected resources.

---

# 4. Core Resources

The initial application will contain the following core resources:

### User

Represents an account in the system.

### Goal

Represents a personal goal belonging to a user.

### Task

Represents a task belonging to a user.

### Note

Represents a private note belonging to a user.

---

# 5. Core Data Relationship

The initial relationship is:

```text
User
 │
 ├── Goals
 │
 ├── Tasks
 │
 └── Notes
````

Every Goal, Task, and Note belongs to a specific User.

Future resources may include:

```text
User
 │
 ├── Goals
 ├── Tasks
 ├── Notes
 ├── AI Conversations
 ├── AI Messages
 ├── Memories
 ├── Embeddings
 └── Daily Plans
```

---

# 6. High-Level System Architecture

The initial architecture is:

```text
                         USERS
                           │
                           ▼
                    React Frontend
                           │
                           │ HTTPS
                           ▼
                  Reverse Proxy / Gateway
                           │
                           ▼
                 Express REST API
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Rate Limit   Authentication   Validation
                           │
                           ▼
                     Authorization
                           │
                           ▼
                    Business Logic
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           Goals         Tasks        Notes
              │            │            │
              └────────────┼────────────┘
                           ▼
                         Prisma
                           │
                           ▼
                      PostgreSQL
```

---

# 7. Request Lifecycle

A protected request will follow this general flow:

```text
User
 ↓
React Client
 ↓
HTTPS
 ↓
Reverse Proxy
 ↓
Express API
 ↓
Rate Limiting
 ↓
Authentication
 ↓
Authorization
 ↓
Input Validation
 ↓
Business Logic
 ↓
Service Layer
 ↓
Prisma
 ↓
PostgreSQL
 ↓
User-specific Data
 ↓
API Response
 ↓
React Client
 ↓
User
```

---

# 8. Frontend

The frontend will be built using React.

The frontend is responsible for:

* User interface
* Forms
* Dashboard
* Goals UI
* Tasks UI
* Notes UI
* AI interaction UI
* API communication
* Displaying errors and loading states

The frontend is **not trusted** for security decisions.

The frontend should never be responsible for deciding whether a user is authorized to access a resource.

---

# 9. Backend

The backend will be built using:

* Node.js
* Express
* TypeScript

The backend is responsible for:

* Authentication
* Authorization
* Validation
* Business logic
* Database access
* Security
* API responses
* AI integration
* Error handling

The backend is the main security boundary of the application.

---

# 10. Authentication

Authentication determines:

> Who is the user?

The general authentication flow will be:

```text
Register
   ↓
Store User
   ↓
Login
   ↓
Verify Credentials
   ↓
Create Authentication Session / Tokens
   ↓
Authenticated User
```

Protected requests will contain the required authentication credentials.

The backend will verify the authentication credentials before allowing access to protected routes.

---

# 11. Authorization

Authorization determines:

> What is this authenticated user allowed to access?

Authentication alone is not enough.

Example:

```text
User A
 ↓
Valid Authentication
 ↓
Request User B's Note
 ↓
Authorization Check
 ↓
DENIED
```

The backend must verify that the requested resource belongs to the authenticated user.

---

# 12. User Data Isolation

Every user's data must remain isolated.

Example:

```text
User A
 ├── Goal A
 ├── Task A
 └── Note A


User B
 ├── Goal B
 ├── Task B
 └── Note B
```

User A must never be able to access:

```text
Goal B
Task B
Note B
```

even if User A knows the resource ID.

---

# 13. Resource Ownership

The backend should verify ownership before returning or modifying a resource.

Conceptually:

```text
Authenticated User
        │
        ▼
   authenticatedUserId
        │
        ▼
   Requested Resource
        │
        ▼
   Ownership Check
        │
   ┌────┴────┐
   ▼         ▼
 ALLOWED    DENIED
```

Database queries should be scoped to the authenticated user's identity.

Conceptually:

```text
WHERE userId = authenticatedUserId
```

The application should not blindly trust a `userId` supplied by the client.

---

# 14. Example: Getting Notes

Suppose:

```text
User A ID = A123
User B ID = B456
```

Database:

```text
Notes

ID      userId      title
----------------------------
N001    A123        Note A
N002    A123        Project Idea
N003    B456        Private Note
```

User A requests:

```text
GET /api/notes
```

The backend identifies:

```text
authenticatedUserId = A123
```

The query should conceptually become:

```text
WHERE userId = A123
```

The response contains:

```text
N001
N002
```

It must not contain:

```text
N003
```

---

# 15. Authentication and Authorization Boundary

The security flow is:

```text
Client
  │
  ▼
API Request
  │
  ▼
Authentication
  │
  ├── Invalid → Reject
  │
  ▼
Authenticated User
  │
  ▼
Authorization
  │
  ├── Not allowed → Reject
  │
  ▼
Resource Ownership
  │
  ├── Not owner → Reject
  │
  ▼
Business Logic
  │
  ▼
Database
```

---

# 16. Logout and Credential Revocation

The system must handle logout securely.

A future authentication design will consider:

* Credential expiration
* Logout
* Token/session revocation
* Refresh credential rotation
* Detection and handling of revoked credentials

The exact authentication implementation will be finalized during the authentication design phase.

---

# 17. API Architecture

The API will be organized around resources.

Initial structure:

```text
/api/auth
/api/users
/api/goals
/api/tasks
/api/notes
/api/ai
```

Example endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/users/me

POST   /api/goals
GET    /api/goals
GET    /api/goals/:id
PATCH  /api/goals/:id
DELETE /api/goals/:id

POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

POST   /api/notes
GET    /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

The exact API structure may evolve during implementation.

---

# 18. Backend Layering

The backend will progressively move toward a layered architecture:

```text
Request
   ↓
Routes
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository / Data Access
   ↓
Prisma
   ↓
PostgreSQL
```

### Routes

Define API endpoints.

### Middleware

Handle cross-cutting concerns such as:

* Authentication
* Rate limiting
* Validation
* Error handling

### Controllers

Handle HTTP requests and responses.

### Services

Contain business logic.

### Data Access

Communicates with the database through Prisma.

This separation will make the application easier to test, maintain, and scale.

---

# 19. Database Architecture

The database will use:

```text
PostgreSQL
     ↑
   Prisma
     ↑
Backend
```

The database design will consider:

* Primary keys
* Foreign keys
* Relationships
* Unique constraints
* Indexes
* Migrations
* Transactions
* Data integrity
* User-level isolation
* Query performance

---

# 20. Initial Database Model

Conceptually:

```text
┌──────────────┐
│     User     │
├──────────────┤
│ id           │
│ email        │
│ password     │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│     Goal     │  │     Task     │
├──────────────┤  ├──────────────┤
│ id           │  │ id           │
│ userId       │  │ userId       │
│ title        │  │ title        │
│ ...          │  │ ...          │
└──────────────┘  └──────────────┘
       │
       │
       ▼
┌──────────────┐
│     Note     │
├──────────────┤
│ id           │
│ userId       │
│ title        │
│ content      │
│ ...          │
└──────────────┘
```

The exact schema will be finalized during database design.

---

# 21. Security Requirements

Security requirements include:

* Secure authentication
* Authorization
* Resource ownership checks
* User data isolation
* Password hashing
* Input validation
* Rate limiting
* Secure secret management
* HTTPS in production
* Secure error handling
* Logging
* Monitoring
* Database security
* AI tool permissions
* AI data access restrictions

---

# 22. Frontend Security Principle

The frontend must be considered untrusted.

For example, hiding a button does not provide authorization.

This is not sufficient:

```text
if (userIsOwner) {
    showDeleteButton();
}
```

The backend must independently verify:

```text
Authenticated User
        ↓
Is owner?
        ↓
YES → Delete
NO  → Reject
```

Security decisions must always be enforced server-side.

---

# 23. AI Architecture

AI capabilities will be introduced after the core application foundation.

The AI system will communicate through a dedicated AI service.

```text
User
 │
 ▼
React
 │
 ▼
Backend API
 │
 ▼
Authentication
 │
 ▼
Authorization
 │
 ▼
AI Service
 │
 ▼
Context Retrieval
 │
 ▼
Prompt Construction
 │
 ▼
LLM
 │
 ▼
Structured Output
 │
 ▼
Output Validation
 │
 ▼
Application
 │
 ▼
User
```

---

# 24. AI Service Responsibilities

The AI service will be responsible for:

* Communicating with AI models
* Constructing prompts
* Providing relevant user context
* Requesting structured outputs
* Validating AI responses
* Handling AI failures
* Managing AI-specific logic

The AI service must not bypass normal application authorization.

---

# 25. AI Data Access

The AI must only receive data that the authenticated user is authorized to access.

```text
Authenticated User
        │
        ▼
Authorized Data
        │
        ▼
Relevant Context
        │
        ▼
       AI
```

The AI should never have unrestricted access to the database.

---

# 26. RAG Architecture

Future RAG functionality may follow:

```text
User Data
   │
   ▼
Chunking
   │
   ▼
Embeddings
   │
   ▼
Vector Storage
   │
   ▼
Similarity Search
   │
   ▼
Relevant User Context
   │
   ▼
LLM
   │
   ▼
Response
```

Retrieval must remain scoped to the authenticated user.

---

# 27. AI Agent Architecture

The future AI agent will use controlled tools.

```text
                    AI AGENT
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Notes Tool    Tasks Tool   Goals Tool
          │            │            │
          └────────────┼────────────┘
                       ▼
                Application Layer
                       │
                       ▼
                   PostgreSQL
```

The agent will not have unrestricted database access.

---

# 28. Example AI Agent Request

Example:

```text
User:
"Create a task for tomorrow."
```

Flow:

```text
User
 ↓
React
 ↓
Backend API
 ↓
Authentication
 ↓
Authorization
 ↓
AI Agent
 ↓
Create Task Tool
 ↓
Validate Arguments
 ↓
Authorization
 ↓
Database
 ↓
Task Created
 ↓
Response
 ↓
User
```

Every tool action must be validated by the application.

---

# 29. Scalability Architecture

The initial application may start with a simple deployment.

The architecture should allow future scaling.

### Initial Deployment

```text
Users
  │
  ▼
HTTPS
  │
  ▼
Reverse Proxy
  │
  ▼
Backend API
  │
  ▼
PostgreSQL
```

### Future Scalable Architecture

```text
                    USERS
                      │
                      ▼
                  HTTPS / TLS
                      │
                      ▼
                Reverse Proxy
                      │
                      ▼
                 Load Balancer
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       API #1       API #2      API #3
          │           │           │
          └───────────┼───────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
           Redis         Background Jobs
             │
             ▼
        PostgreSQL
             │
             ▼
          Backups
```

The architecture will evolve based on actual traffic and application requirements.

---

# 30. Production Infrastructure

The production system is expected to include:

* HTTPS
* Reverse proxy
* Application server
* PostgreSQL
* Redis
* Background workers
* Logging
* Monitoring
* Backups
* CI/CD
* Docker

The user's development computer is not intended to be the permanent production server.

---

# 31. Performance

The application should provide a smooth user experience.

Performance considerations include:

* Efficient database queries
* Database indexes
* Pagination
* Appropriate caching
* Background processing
* Rate limiting
* Connection management
* Fast API responses
* Graceful handling of slow AI operations

Long-running operations should not unnecessarily block normal user interactions.

---

# 32. Reliability

The production system should be designed to handle failures gracefully.

Future considerations include:

* Database backups
* Error handling
* Retry strategies
* Background job retries
* Health checks
* Monitoring
* Logging
* Graceful shutdown
* AI provider failures
* Database connection failures

---

# 33. Testing Strategy

Testing will be introduced progressively.

```text
Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
Authentication Tests
    ↓
Authorization Tests
    ↓
Security Tests
    ↓
End-to-End Tests
```

Important scenarios include:

* Unauthenticated access to protected routes
* Invalid authentication
* Unauthorized resource access
* User A attempting to access User B's data
* Invalid input
* Expired credentials
* Excessive requests
* Database failures
* Invalid AI tool arguments
* AI attempts to access unauthorized data

---

# 34. Deployment Flow

The project will use a feature-based development workflow.

```text
Developer
    │
    ▼
Feature Branch
    │
    ▼
Development
    │
    ▼
Testing
    │
    ▼
Pull Request
    │
    ▼
Code Review
    │
    ▼
main
    │
    ▼
CI/CD
    │
    ▼
Production
    │
    ▼
Monitoring
```

---

# 35. Git Branch Strategy

The main branch should represent a stable version of the application.

Feature development will use separate branches.

Example:

```text
main
 │
 ├── feature/system-design
 │
 ├── feature/database-design
 │
 ├── feature/authentication
 │
 ├── feature/goals
 │
 ├── feature/tasks
 │
 ├── feature/notes
 │
 ├── feature/ai-planner
 │
 └── feature/rag
```

Branches will be merged into `main` after the relevant work is complete and tested.

---

# 36. Development Roadmap

## Phase 1 — Foundation

* [x] Project setup
* [x] TypeScript setup
* [x] Express setup
* [x] PostgreSQL connection
* [x] Prisma setup
* [x] Initial system architecture
* [ ] Database design
* [ ] User model
* [ ] Goal model
* [ ] Task model
* [ ] Note model
* [ ] REST APIs
* [ ] Authentication
* [ ] Authorization
* [ ] React ↔ Backend integration

## Phase 2 — AI

* [ ] AI API integration
* [ ] Prompt engineering
* [ ] Structured outputs
* [ ] AI service
* [ ] AI daily planner

## Phase 3 — Advanced AI

* [ ] Embeddings
* [ ] RAG
* [ ] Vector search
* [ ] Tool calling
* [ ] Memory

## Phase 4 — AI Agent

* [ ] Agent architecture
* [ ] Agent tools
* [ ] Tool permissions
* [ ] Agent memory
* [ ] Secure agent execution

## Phase 5 — Production

* [ ] Security hardening
* [ ] Redis
* [ ] Background jobs
* [ ] Testing
* [ ] Docker
* [ ] CI/CD
* [ ] Monitoring
* [ ] Logging
* [ ] Backups
* [ ] Deployment
* [ ] Scalability improvements
* [ ] AI cost optimization

---

# 37. Design Principles

The system will follow these principles:

### Security First

Security decisions are enforced on the backend.

### Least Privilege

Users and AI tools should receive only the permissions they need.

### Data Isolation

User data must always be scoped to the authenticated user.

### Separation of Concerns

Routes, controllers, services, and data access should have clear responsibilities.

### Scalability

The system should be capable of evolving from a small application to a larger multi-user platform.

### Maintainability

The codebase should remain understandable and easy to modify.

### Reliability

Failures should be handled gracefully rather than crashing the entire application.

---

# 38. Current Status

**Under Active Development**

The project is currently in the Foundation phase.

Current focus:

```text
System Design
      ↓
Database Design
      ↓
Backend Architecture
      ↓
Authentication
      ↓
REST APIs
      ↓
Frontend Integration
      ↓
AI Integration
      ↓
Production Deployment
```

Current backend foundation includes:

* TypeScript
* Express
* Prisma
* PostgreSQL connection
* Environment-based database configuration
* Basic server setup

---

# 39. Learning Objectives

This project is being developed to gain practical experience in:

### Full-Stack Development

* React
* TypeScript
* Node.js
* Express
* REST APIs

### Backend Engineering

* API architecture
* Middleware
* Controllers
* Services
* Validation
* Error handling
* Authentication
* Authorization

### Database Engineering

* PostgreSQL
* Prisma
* Relational database design
* Indexes
* Transactions
* Migrations
* Query optimization

### System Design

* Multi-user architecture
* Data isolation
* Scalability
* Caching
* Load balancing
* Background jobs
* Reliability

### AI Engineering

* LLM APIs
* Prompt engineering
* Structured outputs
* Embeddings
* RAG
* Vector search
* Memory
* Tool calling
* AI agents

### Production Engineering

* Security
* Docker
* CI/CD
* Deployment
* Monitoring
* Logging
* Backups
* Performance optimization
* AI cost optimization

---

# 40. Project Objective

The objective of AI Personal OS is to build more than a simple CRUD application.

The project aims to demonstrate the complete lifecycle of a modern software product:

```text
Idea
 ↓
Requirements
 ↓
System Design
 ↓
Database Design
 ↓
Implementation
 ↓
Security
 ↓
Testing
 ↓
AI Integration
 ↓
Deployment
 ↓
Monitoring
 ↓
Scaling
 ↓
Maintenance
```

The project is being built with a focus on developing practical skills applicable to real-world software engineering, backend engineering, AI engineering, system design, and freelance development.

---

## License

This project is currently under active development.

````

Save with **Ctrl + S**.

Then run:

```powershell
git status
````

We can commit this design document to your `feature/system-design` branch after checking it.
