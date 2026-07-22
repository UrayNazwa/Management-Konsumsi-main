import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Transaction } from '../../../models/transaction.model';
import { Item } from '../../../models/item.model';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

interface MonthYear {
  label: string;
  value: string;
  month: number;
  year: number;
}

@Component({
  selector: 'app-item-usage-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    ChartModule,
    ButtonModule
  ],
  template: `
    <div class="report-page">
      <div class="report-header">
        <div>
          <h1 class="report-title">Laporan Penggunaan Barang</h1>
          <p class="report-subtitle">Analisis penggunaan setiap barang</p>
        </div>
        <div class="report-controls selector-group">
          <p-select
            [options]="monthOptions"
            [(ngModel)]="selectedMonth"
            (onChange)="loadData()"
            styleClass="select-small"
            optionLabel="label"
            placeholder="Bulan"
            appendTo="body"
          ></p-select>
          <p-select
            [options]="categoryOptions"
            [(ngModel)]="selectedCategory"
            (onChange)="loadData()"
            styleClass="select-small"
            placeholder="Kategori"
            appendTo="body"
          ></p-select>
          <p-button
            label="Excel"
            icon="pi pi-download"
            styleClass="p-button-sm p-button-secondary"
            (click)="downloadExcel()"
          ></p-button>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Total Jenis Barang</div>
          <div class="info-value">{{ totalItemTypes }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Total Nilai Penggunaan</div>
          <div class="info-value">{{ formatCurrency(totalItemUsageValue) }}</div>
        </div>
      </div>

      <div class="report-card-grid">
        <div class="chart-card">
          <div class="chart-card-header">Penggunaan Barang {{ selectedCategory ? ' - ' + selectedCategory : '' }}</div>
          <p-chart type="bar" [data]="barChartData" [options]="barChartOptions"></p-chart>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">Proporsi Penggunaan</div>
          <p-chart type="doughnut" [data]="doughnutChartData" [options]="doughnutChartOptions"></p-chart>
        </div>
      </div>

      <div class="table-card detail-card">
        <div class="table-card-header">Detail Penggunaan Barang</div>
        <div class="detail-card-body">
          <p-table [value]="itemUsageDetail" responsiveLayout="scroll" scrollable="true" scrollHeight="18.75rem" styleClass="p-datatable-striped history-scrollable">
            <ng-template pTemplate="header">
              <tr>
                <th>Barang</th>
                <th>Kategori</th>
                <th>Divisi</th>
                <th>Barang Keluar</th>
                <th>Stok Saat Ini</th>
                <th>Total Nilai Keluar</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr class="table-row-hover">
                <td class="table-cell-strong">{{ item.name }}</td>
                <td class="text-muted">{{ item.category }}</td>
                <td class="text-muted">{{ item.division }}</td>
                <td class="text-muted">{{ item.outgoing }} {{ item.unit }}</td>
                <td [ngClass]="item.currentStock < 10 ? 'low-stock table-cell-strong' : 'text-muted'">{{ item.currentStock }} {{ item.unit }}</td>
                <td class="table-cell-strong">{{ formatCurrency(item.totalOutgoing) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `
})
export class ItemUsageReportComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  items: Item[] = [];
  monthOptions: MonthYear[] = [];
  categoryOptions: { label: string; value: string | null }[] = [];
  selectedMonth: MonthYear | null = null;
  selectedCategory: string | null = null;

  private refreshSub?: Subscription;

  totalItemTypes = 0;
  totalItemUsageValue = 0;
  itemUsageDetail: any[] = [];
  barChartData: any;
  barChartOptions: any;
  doughnutChartData: any;
  doughnutChartOptions: any;

  categoryColors = [
    'rgba(16, 185, 129, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 246, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(249, 115, 22, 0.8)'
  ];
  categoryColorMap: { [key: string]: string } = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadData();
    });
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadInitialData(): void {
    this.generateMonthOptions();

    this.apiService.getItems().subscribe(data => {
      this.items = data;
      const categories = Array.from(new Set(data.map(i => i.category)));
      this.categoryOptions = [
        { label: 'Semua Kategori', value: null },
        ...categories.map(c => ({ label: c, value: c }))
      ];
      categories.forEach((c, i) => {
        this.categoryColorMap[c] = this.categoryColors[i % this.categoryColors.length];
      });
      this.loadData();
    });

    this.apiService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.loadData();
    });
  }

  generateMonthOptions(): void {
    const now = new Date();
    this.monthOptions = [];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const label = `${months[month - 1]} ${year}`;
      const value = `${year}-${String(month).padStart(2, '0')}`;
      this.monthOptions.push({ label, value, month, year });
    }

    this.selectedMonth = this.monthOptions[0];
  }

  loadData(): void {
    if (!this.selectedMonth || this.items.length === 0 || this.transactions.length === 0) return;

    const monthTransactions = this.transactions.filter(t =>
      t.date.startsWith(this.selectedMonth!.value)
    );

    let filteredTransactions = monthTransactions;
    if (this.selectedCategory) {
      filteredTransactions = monthTransactions.filter(t => {
        const item = this.items.find(i => i.name === t.itemName);
        return item?.category === this.selectedCategory;
      });
    }

    this.prepareItemUsageData(filteredTransactions);
  }

  prepareItemUsageData(monthTransactions: Transaction[]): void {
    const itemUsage: { [key: string]: { category: string; division: string; outgoing: number; totalValue: number; unit: string } } = {};

    this.items.forEach(item => {
      const itemTransactions = monthTransactions.filter(t => t.itemName === item.name);
      if (itemTransactions.length > 0) {
        const division = itemTransactions[0].division || 'Umum';
        itemUsage[item.name] = {
          category: item.category,
          division: division,
          outgoing: 0,
          totalValue: 0,
          unit: item.unit
        };
      }
    });

    monthTransactions.forEach(t => {
      if (itemUsage[t.itemName]) {
        itemUsage[t.itemName].outgoing += t.quantity;
        itemUsage[t.itemName].totalValue += t.total;
      }
    });

    this.itemUsageDetail = Object.keys(itemUsage)
      .filter(key => itemUsage[key].outgoing > 0)
      .map(key => {
        const item = this.items.find(i => i.name === key);
        const totalOut = this.transactions
          .filter(t => t.itemName === key)
          .reduce((sum, t) => sum + t.quantity, 0);
        const remaining = (item?.stock || 0) - totalOut;

        return {
          name: key,
          category: itemUsage[key].category,
          division: itemUsage[key].division,
          outgoing: itemUsage[key].outgoing,
          currentStock: remaining,
          totalOutgoing: itemUsage[key].totalValue,
          unit: itemUsage[key].unit
        };
      })
      .sort((a, b) => b.totalOutgoing - a.totalOutgoing);

    this.totalItemTypes = this.itemUsageDetail.length;
    this.totalItemUsageValue = this.itemUsageDetail.reduce((sum, item) => sum + item.totalOutgoing, 0);

    this.prepareCharts();
  }

  prepareCharts(): void {
    const labels = this.itemUsageDetail.slice(0, 10).map(d => d.name);
    const data = this.itemUsageDetail.slice(0, 10).map(d => d.totalOutgoing);
    const colors = labels.map(label => {
      const item = this.itemUsageDetail.find(d => d.name === label);
      return this.categoryColorMap[item?.category || ''];
    });

    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Total Nilai Penggunaan',
          data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };

    this.barChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      indexAxis: 'y' as const,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#94a3b8' }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.formatCurrency(context.raw)
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.1)' },
          ticks: {
            color: '#94a3b8',
            callback: (value: any) => {
              if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
              return value;
            }
          }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };

    const allData = this.itemUsageDetail.map(d => d.totalOutgoing);
    const allLabels = this.itemUsageDetail.map(d => d.name);
    const allColors = allLabels.map(label => {
      const item = this.itemUsageDetail.find(d => d.name === label);
      return this.categoryColorMap[item?.category || ''];
    });

    this.doughnutChartData = {
      labels: allLabels,
      datasets: [
        {
          data: allData,
          backgroundColor: allColors,
          borderColor: allColors.map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }
      ]
    };

    this.doughnutChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8' }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.formatCurrency(context.raw)
          }
        }
      }
    };
  }

  downloadExcel(): void {
    const data = this.itemUsageDetail.map(item => ({
      'Barang': item.name,
      'Kategori': item.category,
      'Divisi': item.division,
      'Barang Keluar': item.outgoing,
      'Stok Saat Ini': item.currentStock,
      'Total Nilai Keluar': item.totalOutgoing
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penggunaan Barang');
    XLSX.writeFile(workbook, `Laporan-Penggunaan-Barang-${this.selectedMonth?.value}.xlsx`);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }
}
