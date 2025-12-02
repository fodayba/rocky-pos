import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WelcomeStepComponent } from './welcome-step/welcome-step.component';
import { LocationSetupStepComponent } from './location-setup-step/location-setup-step.component';
import { CompletionStepComponent } from './completion-step/completion-step.component';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  locationData: any;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeStepComponent,
    LocationSetupStepComponent,
    CompletionStepComponent
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // State management
  state = signal<OnboardingState>({
    currentStep: 0,
    totalSteps: 3,
    isLoading: false,
    locationData: null
  });

  // Computed properties
  canGoBack = computed(() => this.state().currentStep > 0);
  canGoNext = computed(() => {
    const step = this.state().currentStep;
    // Can't go next from last step
    if (step === this.state().totalSteps - 1) return false;
    // Location setup step requires valid data
    if (step === 1) return this.state().locationData !== null;
    return true;
  });
  progressPercentage = computed(() => 
    ((this.state().currentStep + 1) / this.state().totalSteps) * 100
  );

  ngOnInit(): void {
    // Check if user has already completed onboarding
    if (this.authService.onboardingCompleted()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Load onboarding status to determine starting step
    this.loadOnboardingStatus();
  }

  private loadOnboardingStatus(): void {
    this.state.update(s => ({ ...s, isLoading: true }));
    
    this.onboardingService.getStatus().subscribe({
      next: (status) => {
        // Determine which step to start on based on progress
        let startStep = 0;
        if (status.progress.welcomeViewed && !status.progress.locationSetup) {
          startStep = 1;
        } else if (status.progress.locationSetup && !status.progress.completionViewed) {
          startStep = 2;
        }
        
        this.state.update(s => ({ 
          ...s, 
          currentStep: startStep,
          isLoading: false 
        }));
      },
      error: (error) => {
        console.error('Error loading onboarding status:', error);
        // Show error but allow user to continue with default state
        this.toastService.error('Could not load your progress. Starting from the beginning.');
        this.state.update(s => ({ ...s, isLoading: false, currentStep: 0 }));
      }
    });
  }

  onNext(): void {
    const currentStep = this.state().currentStep;
    
    // Validate before proceeding
    if (!this.validateCurrentStep()) {
      return;
    }

    // Move to next step
    this.state.update(s => ({ 
      ...s, 
      currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1)
    }));
  }

  onBack(): void {
    if (this.canGoBack()) {
      this.state.update(s => ({ 
        ...s, 
        currentStep: Math.max(s.currentStep - 1, 0)
      }));
    }
  }

  onStepComplete(data?: any): void {
    const currentStep = this.state().currentStep;
    
    // Handle step-specific completion logic
    if (currentStep === 1 && data) {
      // Location setup step completed
      this.state.update(s => ({ ...s, locationData: data }));
      this.onNext();
    } else if (currentStep === 0) {
      // Welcome step completed
      this.onNext();
    } else if (currentStep === 2) {
      // Completion step - navigate to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  onLocationDataChange(data: any): void {
    this.state.update(s => ({ ...s, locationData: data }));
  }

  private validateCurrentStep(): boolean {
    const currentStep = this.state().currentStep;
    
    // Step 0 (Welcome) - no validation needed
    if (currentStep === 0) return true;
    
    // Step 1 (Location Setup) - requires location data
    if (currentStep === 1) {
      if (!this.state().locationData) {
        this.toastService.error('Please complete the location setup before continuing');
        return false;
      }
      return true;
    }
    
    // Step 2 (Completion) - no validation needed
    return true;
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, isLoading: loading }));
  }

  // Keyboard navigation support
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Don't interfere with form inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    // Alt + Left Arrow: Go back
    if (event.altKey && event.key === 'ArrowLeft' && this.canGoBack() && !this.state().isLoading) {
      event.preventDefault();
      this.onBack();
    }

    // Alt + Right Arrow: Go next
    if (event.altKey && event.key === 'ArrowRight' && this.canGoNext() && !this.state().isLoading) {
      event.preventDefault();
      this.onNext();
    }
  }
}
