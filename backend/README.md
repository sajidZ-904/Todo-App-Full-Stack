# Todo App Backend

A robust RESTful API backend for a cross-platform todo application built with Node.js, Express.js, and Prisma ORM.

## Features

- 🔐 Secure RESTful API with comprehensive validation
- 🗄️ PostgreSQL database with Prisma ORM
- 📝 Complete CRUD operations for tasks and categories
- 🔍 Advanced filtering, sorting, and search capabilities
- 🚀 Rate limiting and security middleware
- 📊 Database seeding for development
- 🔄 Database migrations with Prisma

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Development**: Nodemon

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/todo_db"
   PORT=3001
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed database with sample data (optional)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks with optional filtering
  - Query parameters: `category`, `status`, `priority`, `search`, `sortBy`, `order`
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Health Check

- `GET /health` - Server health status

## Database Schema

### Task Model
```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  dueDate     DateTime?
  priority    Priority  @default(MEDIUM)
  categoryId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  category    Category? @relation(fields: [categoryId], references: [id])
}
```

### Category Model
```prisma
model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}
```