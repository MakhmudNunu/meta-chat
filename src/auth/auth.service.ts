import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.userRepository.findOne({
        where: { email },
      });

    if (existingUser) {
      throw new BadRequestException(
        'User already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    console.log('Login attempt for email:', email);
    const user =
      await this.userRepository.findOne({
        where: { email },
      });

    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    console.log('User found, comparing passwords...');
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      );

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password comparison failed');
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const token =
      this.jwtService.sign({
        userId: user.id,
        email: user.email,
      });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }
}