import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { PromotionService } from '../../services/promotion.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Promotion, PromotionType, PromotionStatus } from '../../models/promotion.model';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  promotions = signal<Promotion[]>([]);
  searchQuery = signal('');
  selectedType = signal<string>('all');
  selectedStatus = signal<string>('all');

  filteredPromotions = computed(() => {
    let filtered = this.promotions();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.couponCode?.toLowerCase().includes(query)
      );
    }

    const type = this.selectedType();
    if (type !== 'all') {
      filtered = filtered.filter(p => p.type === type);
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }

    return filtered;
  });

  columns: TableColumn<Promotion>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => {
        const typeLabels: Record<string, string> = {
          percentage_discount: 'Percentage Off',
          fixed_amount_discount: 'Amount Off',
          buy_x_get_y: 'Buy X Get Y',
          bundle: 'Bundle',
          loyalty_points_multiplier: 'Points Multiplier',
          free_item: 'Free Item'
        };
        return typeLabels[row.type] || row.type;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-800',
          scheduled: 'bg-blue-100 text-blue-800',
          active: 'bg-green-100 text-green-800',
          paused: 'bg-yellow-100 text-yellow-800',
          expired: 'bg-red-100 text-red-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.status.toUpperCase()}</span>`;
      }
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (row) => new Date(row.startDate).toLocaleDateString()
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (row) => new Date(row.endDate).toLocaleDateString()
    },
    {
      key: 'currentUsageCount',
      label: 'Usage',
      sortable: true,
      render: (row) => {
        const limit = row.totalUsageLimit ? `/ ${row.totalUsageLimit}` : '';
        return `${row.currentUsageCount} ${limit}`;
      }
    },
    {
      key: 'totalDiscount',
      label: 'Total Discount',
      sortable: true,
      render: (row) => `$${row.totalDiscount.toFixed(2)}`
    }
  ];

  actions: TableAction<Promotion>[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (promotion) => this.editPromotion(promotion._id)
    },
    {
      label: 'Pause',
      icon: 'minus',
      onClick: (promotion) => this.pausePromotion(promotion)
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: (promotion) => this.deletePromotion(promotion)
    }
  ];

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.loadingService.show();
    this.promotionService.findAll().subscribe({
      next: (promotions) => {
        this.promotions.set(promotions);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load promotions');
        console.error('Error loading promotions:', error);
        this.loadingService.hide();
      }
    });
  }

  editPromotion(id: string) {
    this.toastService.info('Edit promotion feature coming soon');
  }

  pausePromotion(promotion: Promotion) {
    this.loadingService.show();
    this.promotionService.pause(promotion._id).subscribe({
      next: () => {
        this.toastService.success('Promotion paused successfully');
        this.loadPromotions();
      },
      error: (error) => {
        this.toastService.error('Failed to pause promotion');
        console.error('Error pausing promotion:', error);
        this.loadingService.hide();
      }
    });
  }

  deletePromotion(promotion: Promotion) {
    if (confirm(`Are you sure you want to delete promotion "${promotion.name}"?`)) {
      this.loadingService.show();
      this.promotionService.remove(promotion._id).subscribe({
        next: () => {
          this.toastService.success('Promotion deleted successfully');
          this.loadPromotions();
        },
        error: (error) => {
          this.toastService.error('Failed to delete promotion');
          console.error('Error deleting promotion:', error);
          this.loadingService.hide();
        }
      });
    }
  }

  addPromotion() {
    this.toastService.info('Add promotion feature coming soon');
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateTypeFilter(value: string) {
    this.selectedType.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
