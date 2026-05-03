# Backend Code Standards & Best Practices

## Overview
This document outlines the coding standards, best practices, and architectural decisions for the Agentic Platform backend.

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration and constants
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── prisma/          # Database client
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── prisma/              # Prisma schema and migrations
└── uploads/             # Uploaded files (gitignored)
```

## Code Standards

### 1. Constants Management
- **Location**: `src/config/constants.js`
- **Purpose**: Centralize all magic numbers and configuration values
- **Usage**: Import constants instead of hardcoding values
```javascript
import { HTTP_STATUS, APP_CONFIG } from '../config/constants.js';
```

### 2. Error Handling
- Always use try-catch blocks in async functions
- Use appropriate HTTP status codes from `HTTP_STATUS` constants
- Provide meaningful error messages
- Log errors using the logger utility

### 3. Logging
- **Location**: `src/utils/logger.js`
- **Purpose**: Conditional logging based on environment
- **Usage**:
```javascript
import logger from '../utils/logger.js';

logger.info('Info message');      // Only in development
logger.debug('Debug message');    // Only in development
logger.warn('Warning message');   // Always logged
logger.error('Error message');    // Always logged
```

### 4. Security Best Practices
- ✅ No `eval()` usage - Use safer alternatives
- ✅ Input validation on all endpoints
- ✅ API keys encrypted at rest
- ✅ JWT tokens for authentication
- ✅ CORS enabled with proper configuration
- ✅ Rate limiting (recommended to add)

### 5. Database
- Use Prisma ORM for all database operations
- Connection pooling configured in `src/prisma/client.js`
- Always use parameterized queries (Prisma handles this)
- Use transactions for multi-step operations

### 6. File Uploads
- Max file size: 20MB (configurable in constants)
- Allowed types: PDF, TXT, DOC, DOCX, MD
- Files are validated before processing
- Temporary files are cleaned up after processing

### 7. API Design
- RESTful endpoints
- Consistent response format
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Authentication required on protected routes

## Environment Variables

Required environment variables (`.env`):
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your_secret_key

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@example.com

# Encryption
ENCRYPTION_KEY=your_encryption_key

# Frontend
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=5000
```

## Performance Optimization

### 1. Database Connection Pooling
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### 2. Request Payload Limits
- JSON: 10MB
- URL-encoded: 10MB

### 3. Sandbox Execution
- Memory limit: 128MB per execution
- Timeout: 5 seconds

### 4. RAG (Retrieval-Augmented Generation)
- Chunk size: 1000 characters
- Chunk overlap: 200 characters
- Similarity threshold: 0.3

## Testing

### Manual Testing
1. Use the health check endpoints:
   - `GET /api/health` - Basic health check
   - `GET /api/health/document-health` - Document processing health
   - `GET /api/health/test-rag` - RAG service health

### Recommended Testing Tools
- Postman/Insomnia for API testing
- Jest for unit testing (to be added)
- Supertest for integration testing (to be added)

## Common Patterns

### Controller Pattern
```javascript
export const controllerName = async (req, res) => {
    try {
        // 1. Extract and validate input
        const { param1, param2 } = req.body;
        const userId = req.user.id;

        if (!param1) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                error: 'Param1 is required' 
            });
        }

        // 2. Business logic
        const result = await someService.doSomething(param1, userId);

        // 3. Return response
        res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
        logger.error('Controller error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
            error: 'Failed to process request' 
        });
    }
};
```

### Service Pattern
```javascript
class ServiceName {
    async methodName(param1, param2) {
        // Business logic here
        const result = await prisma.model.findMany({
            where: { param1 }
        });
        
        return result;
    }
}

export default new ServiceName();
```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Use strong `ENCRYPTION_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Review and minimize console.log statements
- [ ] Enable rate limiting
- [ ] Set up error tracking (e.g., Sentry)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **File Upload Failed**
   - Check file size (max 20MB)
   - Verify file type is allowed
   - Ensure uploads directory exists

3. **PDF Processing Failed**
   - Verify PDF is not corrupted
   - Check if PDF contains extractable text
   - Review RAG service logs

4. **Agent Execution Timeout**
   - Check sandbox timeout settings
   - Review custom tool code for infinite loops
   - Verify API keys are valid

## Contributing

When adding new features:
1. Follow existing code patterns
2. Add constants to `config/constants.js`
3. Use the logger utility for logging
4. Add proper error handling
5. Update this documentation
6. Test thoroughly before committing

## License
[Your License Here]
