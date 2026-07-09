import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Transaction } from '../../../models/transaction.model';
import { Division } from '../../../models/division.model';
import { Item } from '../../../models/item.model';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-division-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    ChartModule,
    ButtonModule,
    DialogModule
  ],
  template: `
    <div class="report-page">
      <div class="report-header">
        <div>
          <h1 class="report-title">Laporan Per Divisi</h1>
          <p class="report-subtitle">Analisis pengeluaran setiap divisi</p>
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
          <p-select
            [options]="divisionOptions"
            [(ngModel)]="selectedDivision"
            (onChange)="loadData()"
            styleClass="select-small"
            placeholder="Divisi"
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
          <div class="info-label">Total Transaksi Divisi</div>
          <div class="info-value">{{ totalTransactions }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Total Nilai Pengeluaran</div>
          <div class="info-value">{{ formatCurrency(totalYearlyExpense) }}</div>
        </div>
      </div>

      <div class="report-card-grid">
        <div class="chart-card">
          <div class="chart-card-header">Perbandingan Pengeluaran {{ selectedYear }}</div>
          <p-chart type="bar" [data]="barChartData" [options]="barChartOptions"></p-chart>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">Proporsi Pengeluaran</div>
          <p-chart type="doughnut" [data]="doughnutChartData" [options]="doughnutChartOptions"></p-chart>
        </div>
      </div>

      <div class="table-card detail-card">
        <div class="table-card-header">Detail Pengeluaran per Divisi</div>
        <div class="detail-card-body">
          <p-table [value]="divisionDetail" responsiveLayout="scroll" scrollable="true" scrollHeight="18rem" styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Divisi</th>
                <th>Jumlah Transaksi</th>
                <th>Total Pengeluaran</th>
                <th>Aksi</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr class="table-row-hover">
                <td class="table-cell-strong">{{ item.name }}</td>
                <td class="text-muted">{{ item.transactionCount }}</td>
                <td class="table-cell-strong">{{ formatCurrency(item.total) }}</td>
                <td>
                  <p-button 
                    label="Lihat Detail" 
                    icon="pi pi-eye" 
                    class="p-button-text"
                    (click)="openDetail(item.name)"
                  ></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td class="table-cell-strong">Total</td>
                <td class="table-cell-strong">{{ totalTransactions }}</td>
                <td class="table-cell-strong">{{ formatCurrency(totalYearlyExpense) }}</td>
                <td></td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <div *ngIf="selectedDivision" class="report-card">
        <div class="chart-card-header">Tren Bulanan - {{ selectedDivision }}</div>
        <p-chart type="bar" [data]="monthlyChartData" [options]="monthlyChartOptions"></p-chart>
      </div>
    </div>

    <!-- Modal Detail Transaksi -->
    <p-dialog 
      [header]="'Detail Transaksi ' + selectedDivisionForDetail" 
      [(visible)]="showDetailModal" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="dialog-box"
      appendTo="body"
    >
      <div *ngIf="detailTransactions.length === 0" class="dialog-empty-state">
        <p class="dialog-text">Tidak ada transaksi untuk divisi ini di tahun {{ selectedYear }}</p>
      </div>
      <div *ngIf="detailTransactions.length > 0" class="dialog-table">
        <p-table [value]="detailTransactions" responsiveLayout="scroll" styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>Tanggal</th>
              <th>Nama Barang</th>
              <th>Jumlah</th>
              <th>Total</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tx>
            <tr class="table-row-hover">
              <td class="table-cell-strong">{{ tx.date }}</td>
              <td class="table-cell-strong">{{ tx.itemName }}</td>
              <td class="text-muted">{{ tx.quantity }}</td>
              <td class="table-cell-strong">{{ formatCurrency(tx.total) }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </p-dialog>
  `
})
export class DivisionReportComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  divisions: Division[] = [];
  items: Item[] = [];
  yearOptions: YearOption[] = [];
  divisionOptions: { label: string; value: string | null }[] = [];
  selectedYear = new Date().getFullYear();
  selectedDivision: string | null = null;

  showDetailModal = false;
  selectedDivisionForDetail: string | null = null;
  detailTransactions: Transaction[] = [];

  private refreshSub?: Subscription;

  totalYearlyExpense = 0;
  totalTransactions = 0;
  divisionDetail: any[] = [];
  barChartData: any;
  barChartOptions: any;
  doughnutChartData: any;
  doughnutChartOptions: any;
  monthlyChartData: any;
  monthlyChartOptions: any;

  divisionColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(168, 85, 246, 0.8)'
  ];
  divisionColorMap: { [key: string]: string } = {};

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

    this.apiService.getDivisions().subscribe(data => {
      this.divisions = data;
      this.divisionOptions = [
        { label: 'Semua Divisi', value: null },
        ...data.map(d => ({ label: d.name, value: d.name }))
      ];
      data.forEach((d, i) => {
        this.divisionColorMap[d.name] = this.divisionColors[i % this.divisionColors.length];
      });
      this.loadData();
    });

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
    if (this.divisions.length === 0 || this.transactions.length === 0 || this.items.length === 0) return;

    const yearTransactions = this.transactions.filter(t => t.date.startsWith(this.selectedYear.toString()));
    
    if (this.selectedDivision) {
      const divisionTransactions = yearTransactions.filter(t => t.division === this.selectedDivision);
      this.totalTransactions = divisionTransactions.length;
      this.totalYearlyExpense = divisionTransactions.reduce((sum, t) => sum + t.total, 0);
    } else {
      this.totalTransactions = yearTransactions.length;
      this.totalYearlyExpense = yearTransactions.reduce((sum, t) => sum + t.total, 0);
    }

    this.prepareDivisionData(yearTransactions);
  }

  prepareDivisionData(yearTransactions: Transaction[]): void {
    let filteredTransactions = yearTransactions;
    if (this.selectedDivision) {
      filteredTransactions = yearTransactions.filter(t => t.division === this.selectedDivision);
    }

    const divisionData: { [key: string]: { count: number; total: number; items: { [key: string]: { qty: number; total: number; unit: string } } } } = {};
    this.divisions.forEach(d => {
      divisionData[d.name] = { count: 0, total: 0, items: {} };
    });

    filteredTransactions.forEach(t => {
      if (divisionData[t.division]) {
        divisionData[t.division].count++;
        divisionData[t.division].total += t.total;
        if (!divisionData[t.division].items[t.itemName]) {
          const item = this.items.find(i => i.name === t.itemName);
          divisionData[t.division].items[t.itemName] = { qty: 0, total: 0, unit: item?.unit || '' };
        }
        divisionData[t.division].items[t.itemName].qty += t.quantity;
        divisionData[t.division].items[t.itemName].total += t.total;
      }
    });

    this.divisionDetail = this.divisions
      .filter(d => divisionData[d.name].count > 0)
      .map(d => ({
        name: d.name,
        transactionCount: divisionData[d.name].count,
        total: divisionData[d.name].total,
        items: divisionData[d.name].items
      }));

    const labels = this.divisionDetail.map(d => d.name);
    const data = this.divisionDetail.map(d => d.total);
    const colors = labels.map(label => this.divisionColorMap[label]);

    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Total Pengeluaran',
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

    this.doughnutChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
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

    if (this.selectedDivision) {
      this.prepareMonthlyChart(filteredTransactions);
    }
  }

  prepareMonthlyChart(divisionTransactions: Transaction[]): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyData: { [key: number]: number } = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i + 1] = 0;
    }

    divisionTransactions.forEach(t => {
      const month = parseInt(t.date.split('-')[1]);
      monthlyData[month] += t.total;
    });

    this.monthlyChartData = {
      labels: months,
      datasets: [
        {
          label: `Pengeluaran ${this.selectedDivision}`,
          data: months.map((_, i) => monthlyData[i + 1]),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };

    this.monthlyChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
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
        y: {
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
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };
  }

  openDetail(divisionName: string): void {
    this.selectedDivisionForDetail = divisionName;
    this.detailTransactions = this.transactions.filter(
      t => t.division === divisionName && t.date.startsWith(this.selectedYear.toString())
    );
    this.showDetailModal = true;
  }

  downloadExcel(): void {
    const data = this.divisionDetail.map(d => ({
      'Divisi': d.name,
      'Jumlah Transaksi': d.transactionCount,
      'Total Pengeluaran': d.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Divisi');
    XLSX.writeFile(workbook, `Laporan-Divisi-${this.selectedYear}.xlsx`);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }
}
