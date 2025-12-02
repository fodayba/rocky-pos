import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);
  showCredentials = signal(false);

  mockCredentials = this.authService.getMockCredentials();

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.error.set(this.translate.instant('validation.enterEmailAndPassword'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (user) => {
        // Navigate based on onboarding status
        // The onboarding guard will handle the actual redirect
        if (user.onboardingCompleted) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/onboarding']);
        }
      },
      error: (err) => {
        this.error.set(err.message || this.translate.instant('validation.invalidEmailOrPassword'));
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  toggleCredentials(): void {
    this.showCredentials.set(!this.showCredentials());
  }

  fillCredentials(email: string, password: string): void {
    this.email.set(email);
    this.password.set(password);
  }
}
