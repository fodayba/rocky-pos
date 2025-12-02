import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../services/onboarding.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-completion-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completion-step.component.html',
  styleUrls: ['./completion-step.component.css']
})
export class CompletionStepComponent implements OnInit {
  @Input() locationData: any;
  @Output() complete = new EventEmitter<void>();

  private onboardingService = inject(OnboardingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isCompleting = signal(false);

  ngOnInit(): void {
    // Mark completion step as viewed
    this.markStepViewed();
  }

  private markStepViewed(): void {
    this.onboardingService.updateProgress('completionViewed').subscribe({
      next: () => {
        // Progress updated successfully
      },
      error: (error) => {
        console.error('Error updating completion progress:', error);
        // Don't show error to user, this is not critical
      }
    });
  }

  onGoToDashboard(): void {
    this.isCompleting.set(true);

    this.onboardingService.completeOnboarding().subscribe({
      next: () => {
        this.toastService.success('Welcome to Gas Metro POS! 🎉');
        
        // Keep loading state while navigating
        // Navigate to dashboard after a brief delay for the success message
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (error) => {
        // Reset loading state on error
        this.isCompleting.set(false);
        
        // Error toast is already shown by the service
        // Log for debugging
        console.error('Failed to complete onboarding:', error);
      }
    });
  }

  getStoreFormatLabel(format: string): string {
    const formats: Record<string, string> = {
      'full_service': 'Full Service (Gas + Large C-Store)',
      'express': 'Express (Gas + Small C-Store)',
      'fuel_only': 'Fuel Only',
      'truck_stop': 'Truck Stop',
      'mini_mart': 'Mini Mart (C-Store Only)'
    };
    return formats[format] || format;
  }
}
