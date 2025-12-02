import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { User, UserRole } from '../schemas/user.schema';
import { Location, StoreFormat } from '../schemas/location.schema';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userModel: any;
  let locationModel: any;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    role: UserRole.ADMIN,
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    active: true,
    onboardingCompleted: false,
    onboardingCompletedAt: null,
    onboardingProgress: {
      welcomeViewed: false,
      locationSetup: false,
      completionViewed: false,
    },
    primaryLocation: null,
    assignedLocations: [],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockLocation = {
    _id: 'location123',
    storeNumber: 'STORE-001',
    name: 'Test Store',
    address: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'USA',
    phone: '555-1234',
    storeFormat: StoreFormat.FULL_SERVICE,
    timezone: 'America/New_York',
    save: jest.fn().mockResolvedValue(this),
  };

  let mockUserModel: any;
  let mockLocationModel: any;

  beforeEach(async () => {
    mockUserModel = {
      findById: jest.fn(),
    };

    mockLocationModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'location123',
      save: jest.fn().mockResolvedValue({ ...data, _id: 'location123' }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Location.name),
          useValue: mockLocationModel,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    userModel = module.get(getModelToken(User.name));
    locationModel = module.get(getModelToken(Location.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOnboardingStatus', () => {
    it('should return onboarding status for a user', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.getOnboardingStatus('user123');

      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        completed: false,
        completedAt: null,
        progress: {
          welcomeViewed: false,
          locationSetup: false,
          completionViewed: false,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOnboardingStatus('user123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProgress', () => {
    it('should update onboarding progress for a specific step', async () => {
      const user = { ...mockUser };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      await service.updateProgress('user123', { step: 'welcomeViewed' });

      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(user.onboardingProgress.welcomeViewed).toBe(true);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateProgress('user123', { step: 'welcomeViewed' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if onboarding already completed', async () => {
      const completedUser = { ...mockUser, onboardingCompleted: true };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedUser),
      });

      await expect(
        service.updateProgress('user123', { step: 'welcomeViewed' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid step', async () => {
      const user = { ...mockUser };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      await expect(
        service.updateProgress('user123', { step: 'invalidStep' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createOnboardingLocation', () => {
    const locationData = {
      storeNumber: 'STORE-001',
      name: 'Test Store',
      address: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA',
      phone: '555-1234',
      storeFormat: StoreFormat.FULL_SERVICE,
      timezone: 'America/New_York',
    };

    it('should create location and assign to user', async () => {
      const user = { ...mockUser };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.createOnboardingLocation('user123', locationData as any);

      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(mockLocationModel).toHaveBeenCalledWith(locationData);
      expect(user.primaryLocation).toBe('location123');
      expect(user.assignedLocations).toContain('location123');
      expect(user.onboardingProgress.locationSetup).toBe(true);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createOnboardingLocation('user123', locationData as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if onboarding already completed', async () => {
      const completedUser = { ...mockUser, onboardingCompleted: true };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedUser),
      });

      await expect(
        service.createOnboardingLocation('user123', locationData as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as complete and set timestamp', async () => {
      const user = { ...mockUser };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      await service.completeOnboarding('user123');

      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(user.onboardingCompleted).toBe(true);
      expect(user.onboardingCompletedAt).toBeInstanceOf(Date);
      expect(user.onboardingProgress.completionViewed).toBe(true);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.completeOnboarding('user123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if onboarding already completed', async () => {
      const completedUser = { ...mockUser, onboardingCompleted: true };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedUser),
      });

      await expect(service.completeOnboarding('user123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('backward compatibility', () => {
    it('should return completed status for existing users who were migrated', async () => {
      const migratedUser = {
        ...mockUser,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date('2024-01-01'),
        onboardingProgress: {
          welcomeViewed: true,
          locationSetup: true,
          completionViewed: true,
        },
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(migratedUser),
      });

      const result = await service.getOnboardingStatus('user123');

      expect(result.completed).toBe(true);
      expect(result.completedAt).toEqual(new Date('2024-01-01'));
      expect(result.progress).toEqual({
        welcomeViewed: true,
        locationSetup: true,
        completionViewed: true,
      });
    });

    it('should prevent migrated users from accessing onboarding endpoints', async () => {
      const migratedUser = {
        ...mockUser,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date('2024-01-01'),
        onboardingProgress: {
          welcomeViewed: true,
          locationSetup: true,
          completionViewed: true,
        },
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(migratedUser),
      });

      await expect(
        service.updateProgress('user123', { step: 'welcomeViewed' }),
      ).rejects.toThrow(BadRequestException);

      await expect(service.completeOnboarding('user123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow new users to complete onboarding flow', async () => {
      const newUser = {
        ...mockUser,
        onboardingCompleted: false,
        onboardingProgress: {
          welcomeViewed: false,
          locationSetup: false,
          completionViewed: false,
        },
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(newUser),
      });

      const result = await service.getOnboardingStatus('user123');

      expect(result.completed).toBe(false);
      expect(result.progress).toEqual({
        welcomeViewed: false,
        locationSetup: false,
        completionViewed: false,
      });
    });
  });
});
