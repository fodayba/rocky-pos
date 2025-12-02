import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { StoreFormat } from '../schemas/location.schema';

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let service: OnboardingService;

  const mockOnboardingService = {
    getOnboardingStatus: jest.fn(),
    updateProgress: jest.fn(),
    createOnboardingLocation: jest.fn(),
    completeOnboarding: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user123',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        {
          provide: OnboardingService,
          useValue: mockOnboardingService,
        },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    service = module.get<OnboardingService>(OnboardingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return onboarding status', async () => {
      const mockStatus = {
        completed: false,
        completedAt: null,
        progress: {
          welcomeViewed: false,
          locationSetup: false,
          completionViewed: false,
        },
      };

      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus(mockRequest);

      expect(service.getOnboardingStatus).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('updateProgress', () => {
    it('should update progress and return success message', async () => {
      const updateProgressDto = { step: 'welcomeViewed' };
      mockOnboardingService.updateProgress.mockResolvedValue(undefined);

      const result = await controller.updateProgress(mockRequest, updateProgressDto);

      expect(service.updateProgress).toHaveBeenCalledWith('user123', updateProgressDto);
      expect(result).toEqual({ message: 'Progress updated successfully' });
    });
  });

  describe('createLocation', () => {
    it('should create location during onboarding', async () => {
      const createLocationDto = {
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

      const mockLocation = {
        _id: 'location123',
        ...createLocationDto,
      };

      mockOnboardingService.createOnboardingLocation.mockResolvedValue(mockLocation);

      const result = await controller.createLocation(mockRequest, createLocationDto as any);

      expect(service.createOnboardingLocation).toHaveBeenCalledWith(
        'user123',
        createLocationDto,
      );
      expect(result).toEqual(mockLocation);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding and return success message', async () => {
      mockOnboardingService.completeOnboarding.mockResolvedValue(undefined);

      const result = await controller.completeOnboarding(mockRequest);

      expect(service.completeOnboarding).toHaveBeenCalledWith('user123');
      expect(result).toEqual({ message: 'Onboarding completed successfully' });
    });
  });
});
