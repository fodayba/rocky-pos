import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'fuel'
  | 'users'
  | 'clock'
  | 'chart'
  | 'dollar'
  | 'receipt'
  | 'alert'
  | 'package'
  | 'droplet'
  | 'shopping-cart'
  | 'credit-card'
  | 'smartphone'
  | 'check'
  | 'x'
  | 'menu'
  | 'circle'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'edit'
  | 'search'
  | 'barcode'
  | 'log-out'
  | 'info'
  | 'inbox'
  | 'sun'
  | 'moon';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="customClass"
    >
      <ng-container [ngSwitch]="name">
        <!-- Dashboard -->
        <g *ngSwitchCase="'dashboard'">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </g>

        <!-- POS / Credit Card -->
        <g *ngSwitchCase="'pos'">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </g>

        <!-- Inventory / Package -->
        <g *ngSwitchCase="'inventory'">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </g>

        <!-- Fuel / Droplet -->
        <g *ngSwitchCase="'fuel'">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </g>

        <!-- Users -->
        <g *ngSwitchCase="'users'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </g>

        <!-- Clock -->
        <g *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </g>

        <!-- Chart / Trending Up -->
        <g *ngSwitchCase="'chart'">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </g>

        <!-- Dollar / Currency -->
        <g *ngSwitchCase="'dollar'">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </g>

        <!-- Receipt / File Text -->
        <g *ngSwitchCase="'receipt'">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </g>

        <!-- Alert / Alert Triangle -->
        <g *ngSwitchCase="'alert'">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </g>

        <!-- Package -->
        <g *ngSwitchCase="'package'">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </g>

        <!-- Droplet -->
        <g *ngSwitchCase="'droplet'">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </g>

        <!-- Shopping Cart -->
        <g *ngSwitchCase="'shopping-cart'">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </g>

        <!-- Credit Card -->
        <g *ngSwitchCase="'credit-card'">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </g>

        <!-- Smartphone -->
        <g *ngSwitchCase="'smartphone'">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </g>

        <!-- Check -->
        <g *ngSwitchCase="'check'">
          <polyline points="20 6 9 17 4 12"></polyline>
        </g>

        <!-- X / Close -->
        <g *ngSwitchCase="'x'">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </g>

        <!-- Menu / Hamburger -->
        <g *ngSwitchCase="'menu'">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </g>

        <!-- Circle -->
        <g *ngSwitchCase="'circle'">
          <circle cx="12" cy="12" r="10"></circle>
        </g>

        <!-- Chevron Down -->
        <g *ngSwitchCase="'chevron-down'">
          <polyline points="6 9 12 15 18 9"></polyline>
        </g>

        <!-- Chevron Up -->
        <g *ngSwitchCase="'chevron-up'">
          <polyline points="18 15 12 9 6 15"></polyline>
        </g>

        <!-- Plus -->
        <g *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </g>

        <!-- Minus -->
        <g *ngSwitchCase="'minus'">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </g>

        <!-- Trash -->
        <g *ngSwitchCase="'trash'">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </g>

        <!-- Edit / Pencil -->
        <g *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </g>

        <!-- Search -->
        <g *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </g>

        <!-- Barcode -->
        <g *ngSwitchCase="'barcode'">
          <line x1="3" y1="5" x2="3" y2="19"></line>
          <line x1="7" y1="5" x2="7" y2="19"></line>
          <line x1="11" y1="5" x2="11" y2="19"></line>
          <line x1="15" y1="5" x2="15" y2="19"></line>
          <line x1="19" y1="5" x2="19" y2="19"></line>
          <line x1="21" y1="5" x2="21" y2="19"></line>
        </g>

        <!-- Log Out -->
        <g *ngSwitchCase="'log-out'">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </g>

        <!-- Chevron Left -->
        <g *ngSwitchCase="'chevron-left'">
          <polyline points="15 18 9 12 15 6"></polyline>
        </g>

        <!-- Chevron Right -->
        <g *ngSwitchCase="'chevron-right'">
          <polyline points="9 18 15 12 9 6"></polyline>
        </g>

        <!-- Info -->
        <g *ngSwitchCase="'info'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </g>

        <!-- Inbox -->
        <g *ngSwitchCase="'inbox'">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </g>

        <!-- Sun -->
        <g *ngSwitchCase="'sun'">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>

        <!-- Moon -->
        <g *ngSwitchCase="'moon'">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </g>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      flex-shrink: 0;
    }
  `]
})
export class IconComponent {
  @Input() name: IconName = 'circle';
  @Input() size: number = 24;
  @Input() customClass: string = '';
}
