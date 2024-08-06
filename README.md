---

# Interativa

## Overview

This project is a full-stack application with a backend developed using NestJS, TypeORM, PostgreSQL, and Redis, and a frontend developed using React. It includes features such as user authentication, password recovery, and session management.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Ensure you have the following installed:

- Node.js (>=14.x)
- PostgreSQL
- Redis

## Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure the database:**

   Create a `.env` file in the `backend` directory with the following content:

   ```dotenv
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=your-db-user
   DATABASE_PASSWORD=your-db-password
   DATABASE_NAME=your-db-name
   JWT_SECRET=your-jwt-secret
   ```

5. **Run database migrations:**

   ```bash
   npm run migration:run
   ```

6. **Start the backend server:**

   ```bash
   npm run start:dev
   ```

## Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the frontend application:**

   ```bash
   npm run start:dev
   ```

   The application will be available at `http://localhost:3000`.

## Running the Application

1. Ensure that PostgreSQL and Redis are running.
2. Start the backend server (see Backend Setup).
3. Start the frontend application (see Frontend Setup).

## Testing

### Backend

1. **Run unit tests:**

   ```bash
   cd backend
   npm test
   ```

2. **Run integration tests:**

   ```bash
   npm test -- --detectOpenHandles
   ```

### Frontend

1. **Run unit tests:**

   ```bash
   cd frontend
   npm test
   ```

## Environment Variables

Make sure to configure the following environment variables in your `.env` file for the backend:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `JWT_SECRET`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License.

---
