import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from '../schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    active: true,
    onboardingCompleted: false,
    onboardingProgress: {
      welcomeViewed: false,
      locationSetup: false,
      completionViewed: false,
    },
    save: jest.fn().mockResolvedValue(this),
  };

  let mockUserModel: any;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    mockUserModel = jest.fn();
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      businessName: 'Test Business',
    };

    it('should create a new user with ADMIN role and initialize onboarding fields', async () => {
      const bcrypt = require('bcrypt');
      const savedUser = {
        _id: 'newuser123',
        email: signupDto.email,
        role: UserRole.ADMIN,
        fullName: 'Jane Smith',
        firstName: signupDto.firstName,
        lastName: signupDto.lastName,
        active: true,
        onboardingCompleted: false,
        onboardingProgress: {
          welcomeViewed: false,
          locationSetup: false,
          completionViewed: false,
        },
        primaryLocation: null,
        populate: jest.fn().mockResolvedValue(this),
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockSave = jest.fn().mockResolvedValue(savedUser);
      mockUserModel.mockImplementation(() => ({
        save: mockSave,
        populate: jest.fn().mockResolvedValue(savedUser),
      }));

      bcrypt.hash.mockResolvedValue('hashedPassword');

      const result = await service.signup(signupDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: signupDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockSave).toHaveBeenCalled();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.user.onboardingCompleted).toBe(false);
      expect(result.user.onboardingProgress).toEqual({
        welcomeViewed: false,
        locationSetup: false,
        completionViewed: false,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user with onboarding status on successful login', async () => {
      const bcrypt = require('bcrypt');
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.onboardingCompleted).toBe(false);
      expect(result.user.onboardingProgress).toEqual({
        welcomeViewed: false,
        locationSetup: false,
        completionViewed: false,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const bcrypt = require('bcrypt');
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(inactiveUser),
        }),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('backward compatibility', () => {
    it('should allow existing users with onboardingCompleted=true to login without seeing onboarding', async () => {
      const bcrypt = require('bcrypt');
      const existingUser = {
        ...mockUser,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date('2024-01-01'),
        onboardingProgress: {
          welcomeViewed: true,
          locationSetup: true,
          completionViewed: true,
        },
      };

      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingUser),
        }),
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.user.onboardingCompleted).toBe(true);
      expect(result.user.onboardingProgress).toEqual({
        welcomeViewed: true,
        locationSetup: true,
        completionViewed: true,
      });
    });

    it('should handle users migrated from old schema with onboarding fields', async () => {
      const bcrypt = require('bcrypt');
      const migratedUser = {
        _id: 'migrated123',
        email: 'migrated@example.com',
        password: 'hashedPassword',
        role: UserRole.MANAGER,
        fullName: 'Migrated User',
        firstName: 'Migrated',
        lastName: 'User',
        active: true,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        onboardingProgress: {
          welcomeViewed: true,
          locationSetup: true,
          completionViewed: true,
        },
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(migratedUser),
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: 'migrated@example.com',
        password: 'password123',
      });

      expect(result.user.onboardingCompleted).toBe(true);
      expect(result.user.onboardingCompletedAt).toBeDefined();
      expect(result.user.onboardingProgress.welcomeViewed).toBe(true);
      expect(result.user.onboardingProgress.locationSetup).toBe(true);
      expect(result.user.onboardingProgress.completionViewed).toBe(true);
    });

    it('should redirect new users with onboardingCompleted=false to onboarding flow', async () => {
      const bcrypt = require('bcrypt');
      const newUser = {
        ...mockUser,
        onboardingCompleted: false,
        onboardingProgress: {
          welcomeViewed: false,
          locationSetup: false,
          completionViewed: false,
        },
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(newUser),
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(result.user.onboardingCompleted).toBe(false);
      expect(result.user.onboardingProgress).toEqual({
        welcomeViewed: false,
        locationSetup: false,
        completionViewed: false,
      });
    });
  });
});
