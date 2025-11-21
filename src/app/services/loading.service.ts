import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCountSignal = signal(0);
  readonly loading = this.loadingCountSignal.asReadonly();
  readonly isLoading = signal(false);

  show() {
    this.loadingCountSignal.update((count) => count + 1);
    this.isLoading.set(true);
  }

  hide() {
    this.loadingCountSignal.update((count) => Math.max(0, count - 1));

    // Only set isLoading to false if count reaches 0
    if (this.loadingCountSignal() === 0) {
      this.isLoading.set(false);
    }
  }

  reset() {
    this.loadingCountSignal.set(0);
    this.isLoading.set(false);
  }
}
