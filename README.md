# Password Manager - MERN Stack

A secure, full-featured password manager built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Security
- **End-to-end encryption** - Passwords encrypted with AES-256-GCM
- **Master password protection** - Additional layer of security
- **JWT authentication** - Secure user sessions
- **Rate limiting** - Protection against brute force attacks
- **Input validation** - Server-side validation for all inputs

### Functionality
- **Password CRUD operations** - Create, read, update, delete passwords
- **Search and filtering** - Find passwords quickly
- **Categories and favorites** - Organize passwords efficiently
- **Password generation** - Generate strong, random passwords
- **Copy to clipboard** - Easy password copying
- **Responsive design** - Works on all devices

## Project Structure

```
pass/
├── server/                 # Backend API
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions
│   ├── config/            # Database configuration
│   └── server.js          # Entry point
└── client/                # Frontend React app
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Main application pages
    │   ├── services/      # API calls
    │   ├── context/       # Global state management
    │   └── utils/         # Helper functions
    └── public/
```

## Security Features

### Encryption
- Passwords are encrypted using AES-256-GCM before storage
- Each password has a unique initialization vector (IV)
- Master password is required for encryption/decryption operations

### Authentication
- JWT tokens for session management
- Bcrypt for password hashing (12 rounds)
- Rate limiting to prevent brute force attacks

### Validation
- Server-side input validation using express-validator
- Client-side form validation using react-hook-form
- Password strength requirements

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications


<div align="center">

**[🌐 Live Demo](https://secure-pass-jet.vercel.app/)**

Made with ❤️ by Brijesh Patel

⭐ **Star this repo if you found it helpful!**

</div>
