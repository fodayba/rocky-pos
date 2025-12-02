import { Component, input, output, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'modal-title'"
      >
        <div
          #modalContainer
          class="modal-container"
          [class]="'modal-' + size()"
          (click)="$event.stopPropagation()"
          [@scaleIn]
          tabindex="-1"
        >
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title" id="modal-title">{{ title() }}</h2>
            @if (showClose()) {
              <button
                #closeButton
                class="modal-close-btn"
                (click)="close()"
                type="button"
                aria-label="Close modal"
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
export class ModalComponent implements AfterViewInit {
  @ViewChild('modalContainer') modalContainer?: ElementRef;
  @ViewChild('closeButton') closeButton?: ElementRef;

  isOpen = input(false);
  title = input('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  showClose = input(true);
  showFooter = input(true);
  closeOnBackdrop = input(true);

  closed = output<void>();

  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
        this.storeFocusAndFocusModal();
      } else {
        document.body.style.overflow = '';
        this.restoreFocus();
      }
    });
  }

  ngAfterViewInit() {
    if (this.isOpen()) {
      this.focusModal();
    }
  }

  private storeFocusAndFocusModal() {
    // Store the currently focused element
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    // Focus the modal after a short delay to ensure it's rendered
    setTimeout(() => {
      this.focusModal();
    }, 100);
  }

  private focusModal() {
    // Try to focus the first focusable element in the modal
    const focusableElements = this.modalContainer?.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else if (this.modalContainer) {
      // If no focusable elements, focus the container itself
      this.modalContainer.nativeElement.focus();
    }
  }

  private restoreFocus() {
    // Return focus to the element that had focus before the modal opened
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      setTimeout(() => {
        this.previousActiveElement?.focus();
      }, 0);
    }
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
