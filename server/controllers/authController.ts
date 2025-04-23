import { Request, Response } from 'express';
import { storage } from '../storage';
import { loginSchema, registerSchema, type LoginCredentials, type RegisterCredentials } from '@shared/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const userData = result.data;

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Nome de usuário já existe' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email já está sendo utilizado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login bem-sucedido',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Erro no servidor durante o login' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};
