import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  businessName = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  onSubmit(): void {
    if (!this.firstName() || !this.lastName() || !this.email() || !this.password() || !this.businessName()) {
      this.error.set(this.translate.instant('validation.allFieldsRequired'));
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set(this.translate.instant('validation.passwordMismatch'));
      return;
    }

    if (this.password().length < 6) {
      this.error.set(this.translate.instant('validation.passwordMinLength', { min: 6 }));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.signup({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      password: this.password(),
      businessName: this.businessName()
    }).subscribe({
      next: (user) => {
        // New users should always go through onboarding
        // The onboarding guard will handle the actual redirect
        if (user.onboardingCompleted) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/onboarding']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || this.translate.instant('validation.signupFailed'));
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
