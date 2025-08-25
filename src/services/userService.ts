import { queryService } from '../database';
import { User, CreateUserData } from '../database/models/User';
import { hashPassword } from '../lib/auth';

export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Prepare user data for insertion
    const userToInsert = {
      ...userData,
      password: hashedPassword,
      address_line_2: userData.address_line_2 || null,
    };

    // Insert user into database
    const newUser = await queryService.insert('users', userToInsert);

    // Remove password from returned user object
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await queryService.findWhere('users', { email });
    return Array.isArray(users) && users.length > 0 ? (users[0] as User) : null;
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await queryService.findById('users', id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  }

  validateUserData(userData: CreateUserData): string[] {
    const errors: string[] = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Required fields validation
    const requiredFields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'ic_passport_number',
      'address_line_1',
      'city',
      'state',
      'postal_code',
      'country',
    ];

    requiredFields.forEach((field) => {
      if (!userData[field as keyof CreateUserData]) {
        errors.push(`${field.replace('_', ' ')} is required`);
      }
    });

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(userData.phone)) {
      errors.push('Invalid phone number format');
    }

    // Date of birth validation
    const dob = new Date(userData.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 13) {
      errors.push('User must be at least 13 years old');
    }

    return errors;
  }
}

export const userService = new UserService();
