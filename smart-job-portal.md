# Smart Job Portal System

## Project Description

Smart Job Portal is a recruitment platform built with NestJS and HBS where companies can publish job vacancies and users can apply for jobs online.

The system includes:
- Authentication
- Job management
- Resume uploads
- Telegram notifications
- Email confirmations

Frontend must be rendered using HBS inside NestJS.

---

# Technologies

## Backend
- NestJS
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- Nodemailer
- Multer
- Telegraf
- Jest

## Frontend
- HBS (Handlebars)
- Bootstrap 5

---

# Main Features

## Authentication
- Register
- Login
- Email activation
- JWT Authentication

## Candidate Features
- Browse jobs
- Apply for jobs
- Upload resume (PDF/DOC)
- View application history

## Company Features
- Create vacancies
- Edit vacancies
- Review applications

## Admin Features
- Manage users
- Manage companies
- Manage job categories

## Telegram Bot
- New job notifications
- Application status updates
- Daily vacancy reports

---

# Database Models

## User
```ts
id
full_name
email
password
role
telegram_id
is_active
```

## Company
```ts
id
name
description
logo
website
owner_id
```

## Vacancy
```ts
id
title
description
salary
location
company_id
category_id
```

## Application
```ts
id
user_id
vacancy_id
resume
status
```

## Category
```ts
id
name
```

---

# Folder Structure

```bash
src/
│
├── auth/
├── users/
├── companies/
├── vacancies/
├── applications/
├── telegram/
├── mail/
├── common/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── decorators/
│
├── views/
├── public/
└── main.ts
```

---

# Lessons Covered

## Lesson 2
- Sequelize ORM
- Associations
- CRUD operations

## Lesson 3-5
- TypeScript
- OOP
- Generics
- Utility Types
- Decorators

## Lesson 6
- Controllers
- Routing
- Request handling

## Lesson 7
- Providers
- Dependency Injection
- Modules

## Lesson 8
- Middleware
- Exception Filters

## Lesson 9
- Pipes
- Validation
- Guards
- Roles Guard

## Lesson 10
- Interceptors
- Custom Decorators

## Lesson 11
- CRUD operations

## Lesson 12
- Resume uploads
- Static file serving

## Lesson 13
- Full project development

## Lesson 14-16
- Unit tests
- E2E tests

## Lesson 17
- Sending emails

## Lesson 18-19
- Telegram bot integration

---

# Authentication Roles

## Roles
- Admin
- Company
- Candidate

---

# Middleware Tasks

Students must implement:
- Logger middleware
- Auth middleware

---

# Guards

Students must create:
- JwtAuthGuard
- RolesGuard

---

# Custom Pipes

Students must create:
- ParseVacancyIdPipe
- ResumeValidationPipe

---

# Interceptors

Students must create:
- LoggingInterceptor
- ResponseTransformInterceptor

---

# Exception Filters

Students must create:
- HttpExceptionFilter
- DatabaseExceptionFilter

---

# Frontend Pages

## Public Pages
- Home
- Vacancies
- Vacancy Details
- Login
- Register

## Candidate Pages
- My Applications
- Profile

## Company Pages
- Manage Vacancies
- Applications List

## Admin Pages
- Users Management
- Companies Management

---

# Telegram Bot Commands

```bash
/start
/jobs
/myapplications
/help
```

---

# Validation Requirements

- Email validation
- Resume file validation
- Salary validation

---

# Additional Tasks

## Easy
- Pagination

## Medium
- Vacancy filtering

## Hard
- Saved vacancies system

---

# Time Duration

Estimated completion time:
- 3 days

---

# Expected Outcome

Students will learn:
- NestJS architecture
- Sequelize ORM
- Authentication
- File uploads
- Telegram bots
- Testing
- HBS rendering