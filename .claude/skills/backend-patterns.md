# Backend Development Patterns

Best practices, patterns, and code examples for robust backend development.

## Express.js API Patterns

### Controller Pattern with Error Handling
```typescript
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users/:id
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      throw new ApiError(400, 'Valid user ID is required');
    }

    const user = await this.userService.findById(Number(id));
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  });

  // POST /api/users
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    
    const validationErrors = this.validateUserData(userData);
    if (validationErrors.length > 0) {
      throw new ApiError(400, 'Validation failed', validationErrors);
    }

    const newUser = await this.userService.create(userData);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  });

  // PUT /api/users/:id
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      throw new ApiError(400, 'Valid user ID is required');
    }

    const updatedUser = await this.userService.update(Number(id), updateData);
    
    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  });

  private validateUserData(userData: any): string[] {
    const errors: string[] = [];
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email is required');
    }
    
    if (!userData.name || userData.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    return errors;
  }
}
```

### Service Layer Pattern
```typescript
import { User, CreateUserDto, UpdateUserDto } from '../types/User';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';
import { Logger } from '../utils/Logger';

export class UserService {
  private userRepository: UserRepository;
  private emailService: EmailService;
  private logger: Logger;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
    this.logger = new Logger('UserService');
  }

  async findById(id: number): Promise<User | null> {
    try {
      this.logger.info(`Fetching user with ID: ${id}`);
      return await this.userRepository.findById(id);
    } catch (error) {
      this.logger.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async create(userData: CreateUserDto): Promise<User> {
    try {
      this.logger.info('Creating new user');
      
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user
      const newUser = await this.userRepository.create(userData);
      
      // Send welcome email
      await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);
      
      this.logger.info(`User created successfully: ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: number, updateData: UpdateUserDto): Promise<User | null> {
    try {
      this.logger.info(`Updating user: ${id}`);
      
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return null;
      }

      // If email is being updated, check for conflicts
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userRepository.findByEmail(updateData.email);
        if (emailExists) {
          throw new Error('Email already in use by another user');
        }
      }

      const updatedUser = await this.userRepository.update(id, updateData);
      this.logger.info(`User updated successfully: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      this.logger.info(`Deleting user: ${id}`);
      
      const result = await this.userRepository.delete(id);
      
      if (result) {
        this.logger.info(`User deleted successfully: ${id}`);
      } else {
        this.logger.warn(`User not found for deletion: ${id}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}
```

### Middleware Patterns

#### Authentication Middleware
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    throw new ApiError(403, 'Invalid or expired token');
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};
```

#### Error Handling Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

const logger = new Logger('ErrorHandler');

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle known API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = error.message;
  }
  // Handle database errors
  else if (error.message.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Log the error
  logger.error(`${req.method} ${req.path}`, {
    error: error.message,
    stack: error.stack,
    statusCode,
    userId: (req as any).user?.id,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
```

## Database Integration

### Repository Pattern
```typescript
import { Pool } from 'pg';
import { User, CreateUserDto, UpdateUserDto } from '../types/User';
import { DatabaseError } from '../utils/DatabaseError';

export class UserRepository {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
  }

  async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, name, role, created_at, updated_at 
        FROM users 
        WHERE id = $1
      `;
      
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Error finding user by ID: ${error.message}`);
    }
  }

  async create(userData: CreateUserDto): Promise<User> {
    try {
      const query = `
        INSERT INTO users (email, name, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, email, name, role, created_at, updated_at
      `;
      
      const values = [userData.email, userData.name, userData.role || 'user'];
      const result = await this.db.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new DatabaseError('User with this email already exists');
      }
      throw new DatabaseError(`Error creating user: ${error.message}`);
    }
  }

  async update(id: number, updateData: UpdateUserDto): Promise<User | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          setClause.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING id, email, name, role, created_at, updated_at
      `;
      
      const result = await this.db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Error updating user: ${error.message}`);
    }
  }
}
```