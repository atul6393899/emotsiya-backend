# Emotsiya Backend API

## API Documentation

Swagger documentation is available at `/api-docs` when the server is running.

## Endpoints

### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/me` - Get current profile (requires auth)

### Users
- `GET /api/v1/users` - List all users (requires auth)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Soft delete user (admin only)
