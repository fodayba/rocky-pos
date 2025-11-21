import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📈</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
        <p class="text-gray-600">Detailed reports and analytics coming soon</p>
      </div>
    </div>
  `
})
export class ReportsComponent {}
