import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent, IconName } from '../icon/icon.component';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => string;
}

export interface TableAction<T = any> {
  label: string;
  icon?: IconName;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
  class?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="data-table-container">
      <!-- Search and Actions -->
      @if (searchable() || bulkActions().length > 0) {
        <div class="table-toolbar">
          @if (searchable()) {
            <div class="search-box">
              <app-icon name="search" class="search-icon" />
              <input
                type="text"
                class="search-input"
                placeholder="Search..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
              />
            </div>
          }

          @if (bulkActions().length > 0 && selectedRows().size > 0) {
            <div class="bulk-actions">
              <span class="selected-count">{{ selectedRows().size }} selected</span>
              @for (action of bulkActions(); track action.label) {
                <button
                  class="btn btn-sm"
                  [class]="action.class || 'btn-secondary'"
                  (click)="action.onClick(getSelectedRowData())"
                >
                  @if (action.icon) {
                    <app-icon [name]="action.icon" />
                  }
                  {{ action.label }}
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- Table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              @if (selectable()) {
                <th class="checkbox-cell">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    [indeterminate]="isSomeSelected()"
                    (change)="toggleSelectAll()"
                  />
                </th>
              }

              @for (column of columns(); track column.key) {
                <th
                  [style.width]="column.width"
                  [class.text-center]="column.align === 'center'"
                  [class.text-right]="column.align === 'right'"
                  [class.sortable]="column.sortable"
                  (click)="column.sortable && handleSort(column.key)"
                >
                  <div class="th-content">
                    {{ column.label }}
                    @if (column.sortable && sortBy() === column.key) {
                      <app-icon
                        [name]="sortDirection() === 'asc' ? 'chevron-up' : 'chevron-down'"
                        class="sort-icon"
                      />
                    }
                  </div>
                </th>
              }

              @if (actions().length > 0) {
                <th class="actions-cell">Actions</th>
              }
            </tr>
          </thead>

          <tbody>
            @if (loading()) {
              <tr>
                <td [attr.colspan]="getTotalColumns()" class="text-center py-8">
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            } @else if (filteredAndSortedData().length === 0) {
              <tr>
                <td [attr.colspan]="getTotalColumns()" class="text-center py-8">
                  <div class="empty-state">
                    <app-icon name="inbox" class="empty-icon" />
                    <p>{{ emptyMessage() }}</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (row of paginatedData(); track getRowId(row); let i = $index) {
                <tr
                  [class.selected]="selectedRows().has(getRowId(row))"
                  (click)="handleRowClick(row)"
                >
                  @if (selectable()) {
                    <td class="checkbox-cell">
                      <input
                        type="checkbox"
                        [checked]="selectedRows().has(getRowId(row))"
                        (change)="toggleSelectRow(row)"
                        (click)="$event.stopPropagation()"
                      />
                    </td>
                  }

                  @for (column of columns(); track column.key) {
                    <td
                      [class.text-center]="column.align === 'center'"
                      [class.text-right]="column.align === 'right'"
                    >
                      @if (column.render) {
                        <span [innerHTML]="column.render(row)"></span>
                      } @else {
                        {{ getValue(row, column.key) }}
                      }
                    </td>
                  }

                  @if (actions().length > 0) {
                    <td class="actions-cell">
                      <div class="action-buttons">
                        @for (action of actions(); track action.label) {
                          @if (!action.show || action.show(row)) {
                            <button
                              class="action-btn"
                              [class]="action.class || ''"
                              (click)="action.onClick(row); $event.stopPropagation()"
                              [title]="action.label"
                            >
                              @if (action.icon) {
                                <app-icon [name]="action.icon" />
                              } @else {
                                {{ action.label }}
                              }
                            </button>
                          }
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (paginated() && filteredAndSortedData().length > 0) {
        <div class="pagination">
          <div class="pagination-info">
            Showing {{ paginationStart() + 1 }} to {{ paginationEnd() }} of {{ filteredAndSortedData().length }} results
          </div>

          <div class="pagination-controls">
            <button
              class="btn btn-sm btn-ghost"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              <app-icon name="chevron-left" />
              Previous
            </button>

            <div class="page-numbers">
              @for (page of getPageNumbers(); track page) {
                @if (page === '...') {
                  <span class="page-ellipsis">...</span>
                } @else {
                  <button
                    class="page-btn"
                    [class.active]="page === currentPage()"
                    (click)="goToPage(+page)"
                  >
                    {{ page }}
                  </button>
                }
              }
            </div>

            <button
              class="btn btn-sm btn-ghost"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Next
              <app-icon name="chevron-right" />
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .data-table-container {
      background: white;
      border-radius: 0.5rem;
      border: 1px solid var(--color-stone-200);
      overflow: hidden;
    }

    .table-toolbar {
      padding: 1rem;
      border-bottom: 1px solid var(--color-stone-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-stone-400);
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid var(--color-stone-300);
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .selected-count {
      font-size: 0.875rem;
      color: var(--color-stone-600);
      font-weight: 500;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: var(--color-stone-50);
    }

    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-stone-700);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-stone-200);
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .data-table th.sortable:hover {
      background: var(--color-stone-100);
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-icon {
      width: 1rem;
      height: 1rem;
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--color-stone-200);
      font-size: 0.875rem;
      color: var(--color-stone-900);
    }

    .data-table tbody tr {
      transition: background-color 0.15s;
    }

    .data-table tbody tr:hover {
      background: var(--color-stone-50);
    }

    .data-table tbody tr.selected {
      background: var(--color-blue-50);
    }

    .checkbox-cell {
      width: 40px;
      padding: 0.75rem !important;
    }

    .actions-cell {
      width: auto;
      white-space: nowrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.375rem;
      border: none;
      background: transparent;
      color: var(--color-stone-600);
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .action-btn:hover {
      background: var(--color-stone-100);
      color: var(--color-stone-900);
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--color-stone-500);
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid var(--color-stone-200);
      border-top-color: var(--color-stone-600);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .empty-icon {
      width: 3rem;
      height: 3rem;
      color: var(--color-stone-400);
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-top: 1px solid var(--color-stone-200);
      gap: 1rem;
      flex-wrap: wrap;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: var(--color-stone-600);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .page-btn {
      min-width: 2rem;
      height: 2rem;
      padding: 0 0.5rem;
      border: 1px solid var(--color-stone-300);
      background: white;
      color: var(--color-stone-700);
      font-size: 0.875rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .page-btn:hover {
      background: var(--color-stone-50);
      border-color: var(--color-stone-400);
    }

    .page-btn.active {
      background: var(--color-stone-900);
      color: white;
      border-color: var(--color-stone-900);
    }

    .page-ellipsis {
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      color: var(--color-stone-400);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-controls {
        justify-content: center;
      }
    }
  `]
})
export class DataTableComponent<T = any> {
  // Inputs
  data = input<T[]>([]);
  columns = input<TableColumn<T>[]>([]);
  actions = input<TableAction<T>[]>([]);
  bulkActions = input<TableAction<T[]>[]>([]);

  loading = input(false);
  searchable = input(true);
  selectable = input(false);
  paginated = input(true);
  pageSize = input(10);
  emptyMessage = input('No data available');
  rowIdKey = input('_id');

  // Outputs
  rowClicked = output<T>();

  // State
  searchQuery = signal('');
  sortBy = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  selectedRows = signal<Set<any>>(new Set());
  currentPage = signal(1);

  // Computed
  filteredAndSortedData = computed(() => {
    let result = [...this.data()];

    // Filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(row =>
        this.columns().some(col => {
          const value = this.getValue(row, col.key);
          return value?.toString().toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (this.sortBy()) {
      result.sort((a, b) => {
        const aVal = this.getValue(a, this.sortBy());
        const bVal = this.getValue(b, this.sortBy());

        if (aVal < bVal) return this.sortDirection() === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection() === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredAndSortedData().length / this.pageSize())
  );

  paginatedData = computed(() => {
    if (!this.paginated()) return this.filteredAndSortedData();

    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredAndSortedData().slice(start, end);
  });

  paginationStart = computed(() =>
    (this.currentPage() - 1) * this.pageSize()
  );

  paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredAndSortedData().length)
  );

  isAllSelected = computed(() => {
    const total = this.paginatedData().length;
    return total > 0 && this.selectedRows().size === total;
  });

  isSomeSelected = computed(() => {
    const size = this.selectedRows().size;
    return size > 0 && size < this.paginatedData().length;
  });

  // Methods
  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  getRowId(row: T): any {
    return this.getValue(row, this.rowIdKey());
  }

  getTotalColumns(): number {
    let count = this.columns().length;
    if (this.selectable()) count++;
    if (this.actions().length > 0) count++;
    return count;
  }

  handleSort(key: string) {
    if (this.sortBy() === key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(key);
      this.sortDirection.set('asc');
    }
  }

  handleRowClick(row: T) {
    this.rowClicked.emit(row);
  }

  toggleSelectRow(row: T) {
    const id = this.getRowId(row);
    const newSet = new Set(this.selectedRows());

    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }

    this.selectedRows.set(newSet);
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedRows.set(new Set());
    } else {
      const allIds = this.paginatedData().map(row => this.getRowId(row));
      this.selectedRows.set(new Set(allIds));
    }
  }

  getSelectedRowData(): T[] {
    return this.data().filter(row => this.selectedRows().has(this.getRowId(row)));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) pages.push('...');

      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');

      pages.push(total);
    }

    return pages;
  }
}
