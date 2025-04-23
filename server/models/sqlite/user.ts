import { Database } from 'sqlite';
import bcrypt from 'bcrypt';
import { type User, type InsertUser } from '@shared/schema';

export async function createUserTable(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Create admin user if no users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    
    await db.run(
      `INSERT INTO users (username, password, email, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      'admin',
      adminPassword,
      'admin@example.com',
      'Administrador',
      'Sistema',
      'admin'
    );
    
    await db.run(
      `INSERT INTO users (username, password, email, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      'aluno',
      studentPassword,
      'aluno@example.com',
      'Aluno',
      'Padrão',
      'student'
    );
  }
}

export async function getUserById(db: Database, id: number): Promise<User | undefined> {
  const user = await db.get(
    `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
     FROM users WHERE id = ?`,
    id
  );
  
  return user || undefined;
}

export async function getUserByUsername(db: Database, username: string): Promise<User | undefined> {
  const user = await db.get(
    `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
     FROM users WHERE username = ?`,
    username
  );
  
  return user || undefined;
}

export async function getUserByEmail(db: Database, email: string): Promise<User | undefined> {
  const user = await db.get(
    `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
     FROM users WHERE email = ?`,
    email
  );
  
  return user || undefined;
}

export async function createUser(db: Database, user: InsertUser): Promise<User> {
  const result = await db.run(
    `INSERT INTO users (username, password, email, first_name, last_name, role) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    user.username,
    user.password,
    user.email,
    user.firstName,
    user.lastName,
    user.role
  );
  
  const createdUser = await getUserById(db, result.lastID!);
  return createdUser as User;
}

export async function updateUser(db: Database, id: number, user: Partial<User>): Promise<User | undefined> {
  const existingUser = await getUserById(db, id);
  if (!existingUser) return undefined;
  
  const fields = [];
  const values = [];
  
  if (user.username) {
    fields.push("username = ?");
    values.push(user.username);
  }
  
  if (user.password) {
    fields.push("password = ?");
    values.push(user.password);
  }
  
  if (user.email) {
    fields.push("email = ?");
    values.push(user.email);
  }
  
  if (user.firstName) {
    fields.push("first_name = ?");
    values.push(user.firstName);
  }
  
  if (user.lastName) {
    fields.push("last_name = ?");
    values.push(user.lastName);
  }
  
  if (user.role) {
    fields.push("role = ?");
    values.push(user.role);
  }
  
  if (fields.length === 0) return existingUser;
  
  await db.run(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    ...values,
    id
  );
  
  return getUserById(db, id);
}

export async function deleteUser(db: Database, id: number): Promise<boolean> {
  const result = await db.run('DELETE FROM users WHERE id = ?', id);
  return result.changes !== 0;
}

export async function getAllUsers(db: Database): Promise<User[]> {
  const users = await db.all(
    `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
     FROM users`
  );
  
  return users;
}
