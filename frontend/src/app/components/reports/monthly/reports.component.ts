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

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-monthly-report',
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
          <h1 class="report-title">Laporan Pengeluaran Bulanan</h1>
          <p class="report-subtitle">Analisis pengeluaran per bulan</p>
        </div>
        <div class="report-controls selector-group">
          <p-select
            [options]="yearOptions"
            [(ngModel)]="selectedYear"
            (onChange)="loadData()"
            styleClass="select-small"
            placeholder="Tahun"
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
          <div class="info-label">Total Pengeluaran {{ selectedYear }}</div>
          <div class="info-value">{{ formatCurrency(totalYearlyExpense) }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Total Transaksi</div>
          <div class="info-value">{{ totalTransactions }}</div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-card-header">Grafik Pengeluaran {{ selectedYear }}</h3>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions"></p-chart>
      </div>

      <div class="table-card detail-card">
        <div class="table-card-header">Detail Pengeluaran per Bulan</div>
        <div class="detail-card-body">
          <p-table [value]="monthlyDetail" responsiveLayout="scroll" scrollable="true" scrollHeight="18.75rem" styleClass="p-datatable-striped history-scrollable">
            <ng-template pTemplate="header">
              <tr>
                <th>Bulan</th>
                <th>Jumlah Transaksi</th>
                <th>Total Pengeluaran</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr class="table-row-hover">
                <td class="table-cell-strong">{{ item.month }}</td>
                <td class="text-muted">{{ item.transactionCount }}</td>
                <td class="table-cell-strong">{{ formatCurrency(item.total) }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td class="table-cell-strong">Total</td>
                <td class="table-cell-strong">{{ totalTransactions }}</td>
                <td class="table-cell-strong">{{ formatCurrency(totalYearlyExpense) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  items: Item[] = [];
  yearOptions: YearOption[] = [];
  selectedYear = new Date().getFullYear();

  private refreshSub?: Subscription;

  totalYearlyExpense = 0;
  totalTransactions = 0;
  monthlyDetail: any[] = [];
  chartData: any;
  chartOptions: any;

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
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.yearOptions.push({
        label: (currentYear - i).toString(),
        value: currentYear - i
      });
    }

    this.apiService.getItems().subscribe(data => {
      this.items = data;
      this.loadData();
    });

    this.apiService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.loadData();
    });
  }

  loadData(): void {
    if (this.transactions.length === 0 || this.items.length === 0) return;

    const yearTransactions = this.transactions.filter(t => 
      t.date.startsWith(this.selectedYear.toString())
    );

    this.totalTransactions = yearTransactions.length;
    this.totalYearlyExpense = yearTransactions.reduce((sum, t) => sum + t.total, 0);

    this.prepareMonthlyData(yearTransactions);
  }

  prepareMonthlyData(yearTransactions: Transaction[]): void {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const monthlyData: { [key: number]: { count: number; total: number } } = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i + 1] = { count: 0, total: 0 };
    }

    yearTransactions.forEach(t => {
      const month = parseInt(t.date.split('-')[1]);
      monthlyData[month].count++;
      monthlyData[month].total += t.total;
    });

    this.monthlyDetail = months.map((m, i) => ({
      month: m,
      transactionCount: monthlyData[i + 1].count,
      total: monthlyData[i + 1].total
    }));

    this.chartData = {
      labels: monthShort,
      datasets: [
        {
          label: 'Total Pengeluaran',
          data: months.map((_, i) => monthlyData[i + 1].total),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 3,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#94a3b8'
          }
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
            callback: (value: any) => {
              if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
              return value;
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };
  }

  downloadExcel(): void {
    const data = this.monthlyDetail.map(item => ({
      'Bulan': item.month,
      'Jumlah Transaksi': item.transactionCount,
      'Total Pengeluaran': item.total
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pengeluaran Bulanan');
    XLSX.writeFile(wb, `Pengeluaran_Bulanan_${this.selectedYear}.xlsx`);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
