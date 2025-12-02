import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .populate('primaryLocation')
      .exec();

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        active: user.active,
        onboardingCompleted: user.onboardingCompleted,
        onboardingCompletedAt: user.onboardingCompletedAt,
        onboardingProgress: user.onboardingProgress,
        primaryLocation: user.primaryLocation,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: signupDto.email }).exec();

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create super admin user for the business
    const fullName = `${signupDto.firstName} ${signupDto.lastName}`;
    const user = new this.userModel({
      email: signupDto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      active: true,
      onboardingCompleted: false,
      onboardingProgress: {
        welcomeViewed: false,
        locationSetup: false,
        completionViewed: false,
      },
    });

    const savedUser = await user.save();

    // Populate primaryLocation for response
    await savedUser.populate('primaryLocation');

    // Generate JWT token for immediate login
    const payload = { sub: savedUser._id, email: savedUser.email, role: savedUser.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        fullName: savedUser.fullName,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        active: savedUser.active,
        onboardingCompleted: savedUser.onboardingCompleted,
        onboardingCompletedAt: savedUser.onboardingCompletedAt,
        onboardingProgress: savedUser.onboardingProgress,
        primaryLocation: savedUser.primaryLocation,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: registerDto.email }).exec();

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const fullName = `${registerDto.firstName} ${registerDto.lastName}`;
    const user = new this.userModel({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role,
      fullName,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      active: true,
    });

    const savedUser = await user.save();

    return {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      fullName: savedUser.fullName,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      active: savedUser.active,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('primaryLocation')
      .exec();

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      primaryLocation: user.primaryLocation,
    };
  }

  async getAllUsers() {
    const users = await this.userModel.find().exec();
    return users.map(user => ({
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
    }));
  }

  async getUserPreferences(userId: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      locale: user.locale || 'en-US',
    };
  }

  async updateUserPreferences(userId: string, locale: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.locale = locale;
    await user.save();

    return {
      locale: user.locale,
    };
  }
}
