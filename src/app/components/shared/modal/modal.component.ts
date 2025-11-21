import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div
        class="modal-backdrop"
        (click)="handleBackdropClick()"
        [@fadeIn]
      >
        <div
          class="modal-container"
          [class]="'modal-' + size()"
          (click)="$event.stopPropagation()"
          [@scaleIn]
        >
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ title() }}</h2>
            @if (showClose()) {
              <button
                class="modal-close-btn"
                (click)="close()"
                type="button"
                aria-label="Close"
              >
                <app-icon name="x" />
              </button>
            }
          </div>

          <!-- Body -->
          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter()) {
            <div class="modal-footer">
              <ng-content select="[slot='footer']"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      padding: 1rem;
      overflow-y: auto;
    }

    .modal-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: auto;
    }

    .modal-sm {
      max-width: 400px;
    }

    .modal-md {
      max-width: 600px;
    }

    .modal-lg {
      max-width: 800px;
    }

    .modal-xl {
      max-width: 1200px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-stone-200);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-stone-900);
      margin: 0;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-stone-500);
      transition: color 0.2s;
      border-radius: 0.375rem;
    }

    .modal-close-btn:hover {
      color: var(--color-stone-700);
      background: var(--color-stone-100);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-stone-200);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    @media (max-width: 640px) {
      .modal-container {
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-sm,
      .modal-md,
      .modal-lg,
      .modal-xl {
        max-width: 100%;
      }
    }
  `],
  animations: []
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  showClose = input(true);
  showFooter = input(true);
  closeOnBackdrop = input(true);

  closed = output<void>();

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  close() {
    this.closed.emit();
  }

  handleBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}
