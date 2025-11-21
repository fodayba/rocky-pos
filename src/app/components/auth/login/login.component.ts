import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);
  showCredentials = signal(false);

  mockCredentials = this.authService.getMockCredentials();

  async onSubmit(): Promise<void> {
    if (!this.username() || !this.password()) {
      this.error.set('Please enter username and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login({
        username: this.username(),
        password: this.password()
      });

      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set('Invalid username or password');
    } finally {
      this.loading.set(false);
    }
  }

  toggleCredentials(): void {
    this.showCredentials.set(!this.showCredentials());
  }

  fillCredentials(username: string, password: string): void {
    this.username.set(username);
    this.password.set(password);
  }
}
