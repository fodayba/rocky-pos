import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, duration = 5000) {
    this.addToast({ message, type: 'success', duration });
  }

  error(message: string, duration = 5000) {
    this.addToast({ message, type: 'error', duration });
  }

  info(message: string, duration = 5000) {
    this.addToast({ message, type: 'info', duration });
  }

  warning(message: string, duration = 5000) {
    this.addToast({ message, type: 'warning', duration });
  }

  private addToast(toast: Omit<Toast, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };

    this.toastsSignal.update((toasts) => [...toasts, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.removeToast(id), toast.duration);
    }
  }

  removeToast(id: string) {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  clear() {
    this.toastsSignal.set([]);
  }
}
