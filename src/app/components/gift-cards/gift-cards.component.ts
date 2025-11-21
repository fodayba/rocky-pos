import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { GiftCardService } from '../../services/gift-card.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { GiftCard, GiftCardStatus, GiftCardStatistics } from '../../models/gift-card.model';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './gift-cards.component.html',
  styleUrl: './gift-cards.component.css'
})
export class GiftCardsComponent implements OnInit {
  private giftCardService = inject(GiftCardService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  giftCards = signal<GiftCard[]>([]);
  statistics = signal<GiftCardStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredGiftCards = computed(() => {
    let filtered = this.giftCards();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(gc =>
        gc.cardNumber.toLowerCase().includes(query) ||
        gc.customerName?.toLowerCase().includes(query) ||
        gc.status.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(gc => gc.status === status);
    }

    return filtered;
  });

  columns: TableColumn<GiftCard>[] = [
    {
      key: 'cardNumber',
      label: 'Card Number',
      sortable: true,
      render: (row) => {
        const masked = row.cardNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3');
        return `<span class="font-mono">${masked}</span>`;
      }
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (row) => {
        return row.customerName || '<span class="text-stone-400">Unassigned</span>';
      }
    },
    {
      key: 'currentBalance',
      label: 'Balance',
      sortable: true,
      render: (row) => {
        const color = row.currentBalance > 0 ? 'text-green-600' : 'text-stone-400';
        return `<span class="${color} font-semibold">$${row.currentBalance.toFixed(2)}</span>`;
      }
    },
    {
      key: 'initialBalance',
      label: 'Initial Value',
      sortable: true,
      render: (row) => {
        return `<span class="text-stone-700">$${row.initialBalance.toFixed(2)}</span>`;
      }
    },
    {
      key: 'purchaseDate',
      label: 'Purchase Date',
      sortable: true,
      render: (row) => {
        const date = new Date(row.purchaseDate);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'expirationDate',
      label: 'Expiration',
      sortable: true,
      render: (row) => {
        if (!row.expirationDate) return '<span class="text-stone-400">Never</span>';
        const date = new Date(row.expirationDate);
        const isExpired = date < new Date();
        const color = isExpired ? 'text-red-600' : 'text-stone-700';
        return `<span class="${color}">${date.toLocaleDateString()}</span>`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          expired: 'bg-red-100 text-red-800',
          redeemed: 'bg-blue-100 text-blue-800',
          suspended: 'bg-orange-100 text-orange-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.status.toUpperCase()}</span>`;
      }
    }
  ];

  actions: TableAction<GiftCard>[] = [
    {
      label: 'View Details',
      icon: 'search',
      onClick: (card) => this.viewDetails(card._id)
    },
    {
      label: 'Reload',
      icon: 'plus',
      onClick: (card) => this.reloadCard(card),
      show: (card) => card.reloadable && card.status === GiftCardStatus.ACTIVE
    },
    {
      label: 'Suspend',
      icon: 'x',
      onClick: (card) => this.suspendCard(card),
      show: (card) => card.status === GiftCardStatus.ACTIVE
    },
    {
      label: 'Activate',
      icon: 'check',
      onClick: (card) => this.activateCard(card),
      show: (card) => card.status === GiftCardStatus.INACTIVE
    }
  ];

  ngOnInit() {
    this.loadGiftCards();
    this.loadStatistics();
  }

  loadGiftCards() {
    this.loadingService.show();
    this.giftCardService.findAll().subscribe({
      next: (cards) => {
        this.giftCards.set(cards);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load gift cards');
        console.error('Error loading gift cards:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.giftCardService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string) {
    this.router.navigate(['/gift-cards', id]);
  }

  reloadCard(card: GiftCard) {
    const amount = prompt(`Enter amount to reload on card ${card.cardNumber}:`);
    if (!amount || isNaN(parseFloat(amount))) return;

    this.loadingService.show();
    this.giftCardService.reload(card._id, {
      amount: parseFloat(amount),
      locationId: 'default', // TODO: Get from store/location service
      notes: 'Manual reload'
    }).subscribe({
      next: () => {
        this.toastService.success('Gift card reloaded successfully');
        this.loadGiftCards();
      },
      error: (error) => {
        this.toastService.error('Failed to reload gift card');
        console.error('Error reloading card:', error);
        this.loadingService.hide();
      }
    });
  }

  suspendCard(card: GiftCard) {
    const reason = prompt(`Enter reason for suspending card ${card.cardNumber}:`);
    if (!reason) return;

    this.loadingService.show();
    this.giftCardService.suspend(card._id, reason).subscribe({
      next: () => {
        this.toastService.success('Gift card suspended');
        this.loadGiftCards();
      },
      error: (error) => {
        this.toastService.error('Failed to suspend gift card');
        console.error('Error suspending card:', error);
        this.loadingService.hide();
      }
    });
  }

  activateCard(card: GiftCard) {
    if (!confirm(`Activate gift card ${card.cardNumber}?`)) return;

    this.loadingService.show();
    this.giftCardService.activate(card._id).subscribe({
      next: () => {
        this.toastService.success('Gift card activated');
        this.loadGiftCards();
      },
      error: (error) => {
        this.toastService.error('Failed to activate gift card');
        console.error('Error activating card:', error);
        this.loadingService.hide();
      }
    });
  }

  issueCard() {
    this.router.navigate(['/gift-cards/issue']);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
