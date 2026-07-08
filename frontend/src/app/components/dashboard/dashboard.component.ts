import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Dashboard as DashboardModel } from '../../models/dashboard.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface MonthOption {
  label: string;
  value: number;
}

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    SelectModule,
    FormsModule
  ],
  template: `
    <div *ngIf="data" class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-title">
          <h1>Dashboard</h1>
          <p>Ringkasan konsumsi dan kebutuhan pokok perusahaan</p>
        </div>

        <!-- Month & Year Selector -->
        <div class="selector-group">
          <p-select
              [options]="monthOptions"
              [(ngModel)]="selectedMonth"
              (onChange)="loadData()"
              styleClass="w-32"
              appendTo="body"
            ></p-select>
          <p-select
              [options]="yearOptions"
              [(ngModel)]="selectedYear"
              (onChange)="loadData()"
              styleClass="w-32"
              appendTo="body"
            ></p-select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div [routerLink]="['/reports/monthly']" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-info">
              <p>Pengeluaran {{ selectedMonthLabel }}</p>
              <h3>{{ formatCurrency(data.monthlyExpense) }}</h3>
            </div>
            <div class="stat-icon teal-bg">
              <i class="pi pi-wallet"></i>
            </div>
          </div>
          <p class="stat-footer">
            <i class="pi pi-arrow-right"></i>{{ data.selectedMonthTransactionCount }} transaksi
          </p>
        </div>

        <div [routerLink]="['/reports/item-usage']" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-info">
              <p>Item Barang {{ selectedMonthLabel }}</p>
              <h3>{{ data.totalItems }}</h3>
            </div>
            <div class="stat-icon indigo-bg">
              <i class="pi pi-box"></i>
            </div>
          </div>
          <p class="stat-footer">
            <i class="pi pi-arrow-right"></i>{{ categoryCount }} kategori
          </p>
        </div>

        <div [routerLink]="['/reports/monthly']" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-info">
              <p>Transaksi {{ selectedMonthLabel }}</p>
              <h3>{{ data.totalTransactions }}</h3>
            </div>
            <div class="stat-icon blue-bg">
              <i class="pi pi-shopping-cart"></i>
            </div>
          </div>
          <p class="stat-footer">
            <i class="pi pi-arrow-right"></i>Hanya {{ selectedMonthLabel }}
          </p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-title">Pengeluaran per Divisi ({{ selectedMonthLabel }})</div>
          <p-chart type="bar" [data]="barChartData" [options]="barChartOptions"></p-chart>
        </div>

        <div class="chart-card">
          <div class="chart-title">Kebutuhan per Kategori</div>
          <p-chart type="doughnut" [data]="doughnutChartData" [options]="doughnutChartOptions"></p-chart>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="chart-card trend-chart">
        <div class="chart-title">Tren Pengeluaran</div>
        <div class="chart-subtitle">6 bulan terakhir</div>
        <p-chart type="line" [data]="lineChartData" [options]="lineChartOptions"></p-chart>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .dashboard-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .dashboard-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .header-title h1 {
      font-size: 1.875rem;
      font-weight: bold;
      color: white;
      margin: 0;
    }

    .header-title p {
      color: #94a3b8;
      margin: 0.25rem 0 0 0;
    }

    .selector-group {
      display: flex;
      gap: 0.75rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .stat-card {
      background-color: #1e293b;
      border-radius: 1rem;
      padding: 1.5rem;
      border: 1px solid #334155;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #475569;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .stat-card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-info p {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0 0 0.25rem 0;
    }

    .stat-info h3 {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      margin: 0;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon i {
      color: white;
      font-size: 1.25rem;
    }

    .teal-bg {
      background: linear-gradient(135deg, #14b8a6, #0f766e);
    }

    .indigo-bg {
      background: linear-gradient(135deg, #6366f1, #4338ca);
    }

    .blue-bg {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .stat-footer {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0.5rem 0 0 0;
    }

    .stat-footer i {
      margin-right: 0.25rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 1024px) {
      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .chart-card {
      background-color: #1e293b;
      border-radius: 1rem;
      padding: 1.5rem;
      border: 1px solid #334155;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .chart-title {
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      margin-bottom: 1rem;
    }

    .chart-subtitle {
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .trend-chart {
      margin-top: 1.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  data?: DashboardModel;
  private refreshSub?: Subscription;

  selectedMonth?: number;
  selectedYear?: number;
  monthOptions: MonthOption[] = [
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 }
  ];
  yearOptions: YearOption[] = [];

  get categoryCount(): number {
    return this.data ? Object.keys(this.data.categoryConsumption).length : 0;
  }

  get selectedMonthLabel(): string {
    if (this.selectedMonth) {
      return this.monthOptions.find(m => m.value === this.selectedMonth)?.label || '';
    }
    return 'Bulan Ini';
  }

  barChartData: any;
  barChartOptions: any;
  doughnutChartData: any;
  doughnutChartOptions: any;
  lineChartData: any;
  lineChartOptions: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    
    // Generate year options (last 5 years + next 1 year)
    for (let y = now.getFullYear() - 5; y <= now.getFullYear() + 1; y++) {
      this.yearOptions.push({ label: y.toString(), value: y });
    }

    this.loadData();
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadData(): void {
    this.apiService.getDashboard(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.data = data;
        this.initCharts();
      },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  initCharts(): void {
    if (!this.data) return;

    // Bar Chart - Pengeluaran per Divisi
    const barLabels = Object.keys(this.data.divisionExpenses);
    const barValues = Object.values(this.data.divisionExpenses);
    const barColors = [
      'rgba(20, 184, 166, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ];
    this.barChartData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Pengeluaran',
          data: barValues,
          backgroundColor: barColors.slice(0, barLabels.length),
          borderColor: barColors.slice(0, barLabels.length).map(c => c.replace('0.8', '1')),
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
    this.barChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.formatCurrency(context.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          },
          ticks: {
            color: '#94a3b8',
            callback: (value: any) => this.formatCurrency(value)
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };

    // Doughnut Chart - Konsumsi per Kategori
    const doughnutLabels = Object.keys(this.data.categoryConsumption);
    const doughnutValues = Object.values(this.data.categoryConsumption);
    const doughnutTotal = doughnutValues.reduce((a, b) => a + b, 0);
    this.doughnutChartData = {
      labels: doughnutLabels,
      datasets: [
        {
          data: doughnutValues,
          backgroundColor: barColors.slice(0, doughnutLabels.length),
          borderColor: barColors.slice(0, doughnutLabels.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2,
          cutout: '60%'
        }
      ]
    };
    this.doughnutChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8'
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const percentage = doughnutTotal > 0 ? Math.round((context.raw / doughnutTotal) * 100) : 0;
              return `${percentage}%`;
            }
          }
        }
      }
    };

    // Line Chart - Tren Pengeluaran
    const lineLabels = this.data.monthlyTrend.map(t => t.month);
    const lineValues = this.data.monthlyTrend.map(t => t.value);
    this.lineChartData = {
      labels: lineLabels,
      datasets: [
        {
          label: 'Pengeluaran',
          data: lineValues,
          fill: true,
          tension: 0.4,
          backgroundColor: 'rgba(20, 184, 166, 0.2)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(20, 184, 166, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(20, 184, 166, 1)',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
    this.lineChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 3,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.formatCurrency(context.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          },
          ticks: {
            color: '#94a3b8',
            callback: (value: any) => this.formatCurrency(value)
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
