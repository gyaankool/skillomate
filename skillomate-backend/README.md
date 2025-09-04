# Skillomate Backend API

A robust Node.js backend API for the Skillomate application with authentication, email verification, and SMTP functionality.

## Features

- 🔐 JWT-based authentication
- 📧 Email verification with SMTP
- 🔒 Password reset functionality
- 🛡️ Security middleware (Helmet, Rate limiting)
- ✅ Input validation
- 🗄️ MongoDB integration
- 📝 Comprehensive error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- SMTP email service (Gmail, SendGrid, etc.)

## Installation

1. **Clone the repository**
   ```bash
   cd skillomate-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/skillomate

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # SMTP Configuration (Gmail Example)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## SMTP Setup

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `SMTP_PASS`

### Other SMTP Providers
Update the SMTP configuration in `.env`:
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=your-email
```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "board": "CBSE",
  "grade": "Class 10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "board": "CBSE",
    "grade": "Class 10",
    "isEmailVerified": false,
    "role": "student"
  }
}
```

#### POST `/api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "board": "CBSE",
    "grade": "Class 10",
    "isEmailVerified": true,
    "role": "student",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/verify-email`
Verify email address.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

#### POST `/api/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### POST `/api/auth/resend-verification`
Resend email verification (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Health Check

#### GET `/api/health`
Check API status.

**Response:**
```json
{
  "message": "Skillomate API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend access
- **Helmet**: Security headers

## Email Templates

The API includes beautiful HTML email templates for:
- Welcome emails
- Email verification
- Password reset

## Development

### Project Structure
```
skillomate-backend/
├── config/
│   ├── database.js
│   └── smtp.js
├── middleware/
│   ├── auth.js
│   └── validate.js
├── models/
│   └── User.js
├── routes/
│   └── auth.js
├── server.js
├── package.json
└── README.md
```

### Adding New Routes
1. Create route file in `routes/` directory
2. Add validation middleware
3. Import and use in `server.js`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production MongoDB
4. Set up production SMTP
5. Configure CORS for production domain
6. Use HTTPS in production

## Support

For issues and questions, please check the error logs and ensure all environment variables are properly configured.

