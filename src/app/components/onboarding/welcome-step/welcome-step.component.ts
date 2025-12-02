import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../../services/onboarding.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-welcome-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-step.component.html',
  styleUrls: ['./welcome-step.component.css']
})
export class WelcomeStepComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();

  private onboardingService = inject(OnboardingService);
  private toastService = inject(ToastService);

  steps = [
    {
      icon: '🏪',
      title: 'Set Up Your Location',
      description: 'Configure your business location with essential details like address, contact information, and store format.'
    },
    {
      icon: '✅',
      title: 'Complete Setup',
      description: 'Review your configuration and start using the Gas Metro POS system.'
    }
  ];

  ngOnInit(): void {
    // Mark welcome step as viewed
    this.markStepViewed();
  }

  private markStepViewed(): void {
    this.onboardingService.updateProgress('welcomeViewed').subscribe({
      next: () => {
        // Progress updated successfully
      },
      error: (error) => {
        console.error('Error updating welcome progress:', error);
        // Don't show error to user, this is not critical
      }
    });
  }

  onGetStarted(): void {
    this.complete.emit();
  }
}
