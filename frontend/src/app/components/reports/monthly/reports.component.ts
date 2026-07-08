import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Transaction } from '../../../models/transaction.model';
import { Division } from '../../../models/division.model';
import { Item } from '../../../models/item.model';
import { Category } from '../../../models/category.model';
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

interface MonthYear {
  label: string;
  value: string;
  month: number;
  year: number;
}

@Component({
  selector: 'app-reports',
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
    <div class="space-y-6">
      <!-- Pengeluaran Bulanan -->
      <div *ngIf="showMonthly">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-white">Pengeluaran Bulanan</h1>
            <p class="text-slate-400 mt-1">Analisis pengeluaran per bulan</p>
          </div>
          <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">Tahun</span>
            <p-select
              [options]="yearOptions"
              [(ngModel)]="selectedYear"
              (onChange)="loadData()"
              styleClass="w-32 py-1 text-sm"
               appendTo="body"
            ></p-select>
          </div>
          <p-button
            label="Excel"
            icon="pi pi-download"
            (click)="downloadMonthlyExcel()"
          ></p-button>
        </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
            <p class="text-sm text-slate-400 mb-2">Total Pengeluaran {{ selectedYear }}</p>
            <p class="text-2xl font-bold text-white">{{ formatCurrency(totalYearlyExpense) }}</p>
          </div>
          <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
            <p class="text-sm text-slate-400 mb-2">Total Transaksi</p>
            <p class="text-2xl font-bold text-white">{{ totalTransactions }}</p>
          </div>
        </div>

        <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 mb-6">
          <p class="text-white font-semibold mb-4">Grafik Pengeluaran {{ selectedYear }}</p>
          <p-chart type="bar" [data]="monthlyChartData" [options]="monthlyChartOptions"></p-chart>
        </div>

        <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div class="p-6 border-b border-slate-700">
            <h3 class="font-semibold text-white">Detail Pengeluaran per Bulan</h3>
          </div>
          <p-table [value]="monthlyDetail" responsiveLayout="scroll" styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Bulan</th>
                <th>Jumlah Transaksi</th>
                <th>Total Pengeluaran</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr class="hover:bg-slate-800">
                <td class="font-medium text-slate-200">{{ item.month }}</td>
                <td class="text-slate-300">{{ item.transactionCount }}</td>
                <td class="font-medium text-slate-200">{{ formatCurrency(item.total) }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td class="font-bold text-white">Total</td>
                <td class="font-bold text-white">{{ totalTransactions }}</td>
                <td class="font-bold text-white">{{ formatCurrency(totalYearlyExpense) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Per Divisi -->
      <div *ngIf="showDivision">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-white">Per Divisi</h1>
            <p class="text-slate-400 mt-1">Analisis pengeluaran setiap divisi</p>
          </div>
          <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">Tahun</span>
            <p-select
              [options]="yearOptions"
              [(ngModel)]="selectedYear"
              (onChange)="loadData()"
              styleClass="w-32 py-1 text-sm"
               appendTo="body"
            ></p-select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">Divisi</span>
            <p-select
              [options]="divisionOptions"
              [(ngModel)]="selectedDivision"
              (onChange)="loadData()"
              styleClass="w-48 py-1 text-sm"
              placeholder="Semua Divisi"
               appendTo="body"
            ></p-select>
          </div>
          <p-button
            label="Excel"
            icon="pi pi-download"
            (click)="downloadDivisionExcel()"
          ></p-button>
        </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
            <p class="text-white font-semibold mb-4">Perbandingan Pengeluaran {{ selectedYear }}</p>
            <p-chart type="bar" [data]="divisionBarChartData" [options]="divisionBarChartOptions"></p-chart>
          </div>
          <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
            <p class="text-white font-semibold mb-4">Proporsi Pengeluaran</p>
            <p-chart type="doughnut" [data]="divisionDoughnutChartData" [options]="divisionDoughnutChartOptions"></p-chart>
          </div>
        </div>

        <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden mb-6">
          <div class="p-6 border-b border-slate-700">
            <h3 class="font-semibold text-white">Detail Pengeluaran per Divisi</h3>
          </div>
          <p-table [value]="divisionDetail" responsiveLayout="scroll" styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th>Divisi</th>
                <th>Jumlah Transaksi</th>
                <th>Total Pengeluaran</th>
                <th>Aksi</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr class="hover:bg-slate-800">
                <td class="font-medium text-slate-200">{{ item.name }}</td>
                <td class="text-slate-300">{{ item.transactionCount }}</td>
                <td class="font-medium text-slate-200">{{ formatCurrency(item.total) }}</td>
                <td>
                  <p-button 
                    label="Lihat Detail" 
                    icon="pi pi-eye" 
                    class="p-button-text"
                    (click)="openDivisionDetail(item.name)"
                  ></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td class="font-bold text-white">Total</td>
                <td class="font-bold text-white">{{ totalTransactions }}</td>
                <td class="font-bold text-white">{{ formatCurrency(totalYearlyExpense) }}</td>
                <td></td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div *ngIf="selectedDivision" class="space-y-6">
          <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
            <p class="text-white font-semibold mb-4">Tren Bulanan - {{ selectedDivision }}</p>
            <p-chart type="bar" [data]="divisionMonthlyChartData" [options]="divisionMonthlyChartOptions"></p-chart>
          </div>
        </div>
      </div>

      <!-- Penggunaan Barang -->
      <div *ngIf="showItemUsage">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-white">Penggunaan Barang</h1>
            <p class="text-slate-400 mt-1">Analisis penggunaan setiap barang</p>
          </div>
          <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">Bulan</span>
            <p-select
              [options]="itemUsageMonthOptions"
              [(ngModel)]="selectedItemUsageMonth"
              (onChange)="loadData()"
              styleClass="w-36 py-1 text-sm"
              optionLabel="label"
               appendTo="body"
            ></p-select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">Kategori</span>
            <p-select
              [options]="categoryOptions"
              [(ngModel)]="selectedCategory"
              (onChange)="loadData()"
              styleClass="w-36 py-1 text-sm"
              placeholder="Semua Kategori"
               appendTo="body"
            ></p-select>
          </div>
          <p-button
            label="Excel"
            icon="pi pi-download"
            (click)="downloadItemUsageExcel()"
          ></p-button>
        </div>
        </div>

        <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 mb-6">
          <h3 class="text-white font-semibold mb-4">{{ getCurrentMonthYearLabel() }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-slate-400 mb-2">Total Jenis Barang</p>
              <p class="text-2xl font-bold text-white">{{ totalItemTypes }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-400 mb-2">Total Nilai Penggunaan</p>
              <p class="text-2xl font-bold text-white">{{ formatCurrency(totalItemUsageValue) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div class="p-6 border-b border-slate-700">
            <h3 class="font-semibold text-white">Detail Penggunaan Barang</h3>
          </div>
          <p-table [value]="itemUsageDetail" responsiveLayout="scroll" styleClass="p-datatable-striped">
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
              <tr class="hover:bg-slate-800">
                <td class="font-medium text-slate-200">{{ item.name }}</td>
                <td class="text-slate-300">{{ item.category }}</td>
                <td class="text-slate-300">{{ item.division }}</td>
                <td class="text-slate-300">{{ item.outgoing }} {{ item.unit }}</td>
                <td [ngClass]="item.currentStock < 10 ? 'text-red-400 font-medium' : 'text-slate-300'">{{ item.currentStock }} {{ item.unit }}</td>
                <td class="font-medium text-slate-200">{{ formatCurrency(item.totalOutgoing) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>

    <!-- Modal Detail Transaksi Divisi -->
    <p-dialog 
      [header]="'Detail Transaksi ' + selectedDivisionForDetail" 
      [(visible)]="showDivisionDetailModal" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="w-full max-w-2xl"
      appendTo="body"
    >
      <div *ngIf="divisionDetailTransactions.length === 0" class="text-center py-8">
        <p class="text-gray-500">Tidak ada transaksi untuk divisi ini di tahun {{ selectedYear }}</p>
      </div>
      <div *ngIf="divisionDetailTransactions.length > 0" class="space-y-4">
        <p-table [value]="divisionDetailTransactions" responsiveLayout="scroll" styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>Tanggal</th>
              <th>Nama Barang</th>
              <th>Jumlah</th>
              <th>Total</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tx>
            <tr class="hover:bg-slate-800">
              <td class="font-medium text-slate-200">{{ tx.date }}</td>
              <td class="text-slate-200">{{ tx.itemName }}</td>
              <td class="text-slate-300">{{ tx.quantity }}</td>
              <td class="font-medium text-slate-200">{{ formatCurrency(tx.total) }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </p-dialog>
  `
})
export class ReportsComponent implements OnInit, OnDestroy {
  showMonthly = false;
  showDivision = false;
  showItemUsage = false;
  transactions: Transaction[] = [];
  divisions: Division[] = [];
  items: Item[] = [];
  categories: string[] = [];
  yearOptions: YearOption[] = [];
  divisionOptions: { label: string; value: string | null }[] = [];
  categoryOptions: { label: string; value: string | null }[] = [];
  itemUsageMonthOptions: MonthYear[] = [];
  selectedYear = new Date().getFullYear();
  selectedDivision: string | null = null;
  selectedCategory: string | null = null;
  selectedItemUsageMonth: MonthYear | null = null;
  
  // Untuk modal detail transaksi divisi
  showDivisionDetailModal = false;
  selectedDivisionForDetail: string | null = null;
  divisionDetailTransactions: Transaction[] = [];
  
  private refreshSub?: Subscription;

  totalYearlyExpense = 0;
  totalTransactions = 0;
  monthlyDetail: any[] = [];
  monthlyChartData: any;
  monthlyChartOptions: any;
  divisionDetail: any[] = [];
  divisionBarChartData: any;
  divisionBarChartOptions: any;
  divisionDoughnutChartData: any;
  divisionDoughnutChartOptions: any;
  divisionMonthlyChartData: any;
  divisionMonthlyChartOptions: any;

  totalItemTypes = 0;
  totalItemUsageValue = 0;
  itemUsageDetail: any[] = [];

  divisionColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(168, 85, 246, 0.8)'
  ];
  categoryColors = [
    'rgba(16, 185, 129, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 246, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(249, 115, 22, 0.8)'
  ];
  divisionColorMap: { [key: string]: string } = {};
  categoryColorMap: { [key: string]: string } = {};

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  getCurrentMonthYearLabel(): string {
    if (!this.selectedItemUsageMonth) return '';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `Ringkasan ${months[this.selectedItemUsageMonth.month - 1]} ${this.selectedItemUsageMonth.year}`;
  }

  ngOnInit(): void {
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadData();
    });
    this.route.url.subscribe((url) => {
      const path = url.join('/');
      this.showMonthly = path === 'reports/monthly';
      this.showDivision = path === 'reports/division';
      this.showItemUsage = path === 'reports/item-usage';
      this.loadInitialData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  generateItemUsageMonthOptions(): void {
    const now = new Date();
    this.itemUsageMonthOptions = [];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const label = `${months[month - 1]} ${year}`;
      const value = `${year}-${String(month).padStart(2, '0')}`;
      this.itemUsageMonthOptions.push({ label, value, month, year });
    }

    this.selectedItemUsageMonth = this.itemUsageMonthOptions[0];
  }

  loadInitialData(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.yearOptions.push({
        label: (currentYear - i).toString(),
        value: currentYear - i
      });
    }

    this.generateItemUsageMonthOptions();

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
      this.categories = Array.from(new Set(data.map(i => i.category)));
      this.categoryOptions = [
        { label: 'Semua Kategori', value: null },
        ...this.categories.map(c => ({ label: c, value: c }))
      ];
      this.categories.forEach((c, i) => {
        this.categoryColorMap[c] = this.categoryColors[i % this.categoryColors.length];
      });
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
    
    // Hitung total berdasarkan filter
    if (this.showDivision && this.selectedDivision) {
      const divisionTransactions = yearTransactions.filter(t => t.division === this.selectedDivision);
      this.totalTransactions = divisionTransactions.length;
      this.totalYearlyExpense = divisionTransactions.reduce((sum, t) => sum + t.total, 0);
    } else {
      this.totalTransactions = yearTransactions.length;
      this.totalYearlyExpense = yearTransactions.reduce((sum, t) => sum + t.total, 0);
    }

    this.prepareMonthlyData(yearTransactions);
    this.prepareDivisionData(yearTransactions);
    this.prepareItemUsageData();
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

    this.monthlyChartData = {
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

    this.monthlyChartOptions = {
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
          divisionData[t.division].items[t.itemName] = { qty: 0, total: 0, unit: '' };
        }
        divisionData[t.division].items[t.itemName].qty += t.quantity;
        divisionData[t.division].items[t.itemName].total += t.total;
      }
    });

    this.divisionDetail = Object.entries(divisionData).map(([name, data]) => ({
      name,
      transactionCount: data.count,
      total: data.total,
      percentage: this.totalYearlyExpense > 0 ? Math.round((data.total / this.totalYearlyExpense) * 100) : 0,
      average: data.count > 0 ? data.total / data.count : 0,
      items: data.items
    })).filter(d => d.transactionCount > 0 || !this.selectedDivision).sort((a, b) => b.total - a.total);

    this.divisionBarChartData = {
      labels: this.divisionDetail.map(d => d.name),
      datasets: [
        {
          label: 'Pengeluaran',
          data: this.divisionDetail.map(d => d.total),
          backgroundColor: this.divisionDetail.map(d => this.divisionColorMap[d.name]),
          borderColor: this.divisionDetail.map(d => this.divisionColorMap[d.name].replace('0.8', '1')),
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };

    this.divisionBarChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      indexAxis: 'y' as const,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (context: any) => this.formatCurrency(context.raw) }
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
        y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    };

    this.divisionDoughnutChartData = {
      labels: this.divisionDetail.map(d => d.name),
      datasets: [
        {
          data: this.divisionDetail.map(d => d.total),
          backgroundColor: this.divisionDetail.map(d => this.divisionColorMap[d.name]),
          borderColor: '#e5e7eb',
          borderWidth: 2,
          cutout: '60%'
        }
      ]
    };

    this.divisionDoughnutChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: '#94a3b8',
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((context.raw / total) * 100);
              return `${label}: ${percentage}%`;
            }
          }
        }
      }
    };

    if (this.selectedDivision) {
      this.prepareSelectedDivisionData(yearTransactions);
    }
  }

  prepareSelectedDivisionData(yearTransactions: Transaction[]): void {
    if (!this.selectedDivision) return;

    const divisionTransactions = yearTransactions.filter(t => t.division === this.selectedDivision);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyDivisionData: { [key: number]: number } = {};
    for (let i = 0; i < 12; i++) {
      monthlyDivisionData[i + 1] = 0;
    }

    divisionTransactions.forEach(t => {
      const month = parseInt(t.date.split('-')[1]);
      monthlyDivisionData[month] += t.total;
    });

    this.divisionMonthlyChartData = {
      labels: months,
      datasets: [
        {
          label: 'Pengeluaran',
          data: months.map((_, i) => monthlyDivisionData[i + 1]),
          backgroundColor: this.divisionColorMap[this.selectedDivision],
          borderColor: this.divisionColorMap[this.selectedDivision].replace('0.8', '1'),
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };

    this.divisionMonthlyChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 3,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#94a3b8' }
        },
        tooltip: {
          callbacks: { label: (context: any) => this.formatCurrency(context.raw) }
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
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    };
  }

  prepareItemUsageData(): void {
    if (!this.selectedItemUsageMonth) return;
    const monthTransactions = this.transactions.filter(t => t.date.startsWith(this.selectedItemUsageMonth!.value));

    let filteredTransactions = monthTransactions;
    if (this.selectedCategory) {
      const categoryItemIds = this.items
        .filter(i => i.category === this.selectedCategory)
        .map(i => i.id);
      filteredTransactions = monthTransactions.filter(t => categoryItemIds.includes(t.itemId));
    }

    const itemUsageMap: { [key: string]: any } = {};

    // Group by item.id + division
    filteredTransactions.forEach(t => {
      const key = `${t.itemId}-${t.division}`;
      if (!itemUsageMap[key]) {
        const item = this.items.find(i => i.id === t.itemId);
        if (item) {
          const totalUsedQuantity = this.transactions
            .filter(tr => tr.itemId === item.id)
            .reduce((sum, tr) => sum + tr.quantity, 0);
          itemUsageMap[key] = {
            name: item.name,
            category: item.category,
            division: t.division,
            unit: item.unit,
            currentStock: item.stock - totalUsedQuantity,
            outgoing: 0,
            totalOutgoing: 0
          };
        }
      }
      itemUsageMap[key].outgoing += t.quantity;
      itemUsageMap[key].totalOutgoing += t.total;
    });

    this.itemUsageDetail = Object.values(itemUsageMap);
    this.totalItemTypes = this.itemUsageDetail.length;
    this.totalItemUsageValue = this.itemUsageDetail.reduce((sum, item) => sum + item.totalOutgoing, 0);
  }

  getDivisionColor(name: string): string {
    return this.divisionColorMap[name] || '#9ca3af';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Fungsi untuk membuka modal detail transaksi divisi
  openDivisionDetail(divisionName: string): void {
    this.selectedDivisionForDetail = divisionName;
    this.divisionDetailTransactions = this.transactions.filter(t => 
      t.division === divisionName && t.date.startsWith(this.selectedYear.toString())
    );
    this.showDivisionDetailModal = true;
  }

  downloadMonthlyExcel(): void {
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

  downloadDivisionExcel(): void {
    const data = this.divisionDetail.map(item => ({
      'Divisi': item.name,
      'Jumlah Transaksi': item.transactionCount,
      'Total Pengeluaran': item.total
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pengeluaran per Divisi');
    XLSX.writeFile(wb, `Pengeluaran_Per_Divisi_${this.selectedYear}.xlsx`);
  }

  downloadItemUsageExcel(): void {
    const data = this.itemUsageDetail.map(item => ({
      'Barang': item.name,
      'Kategori': item.category,
      'Divisi': item.division,
      'Barang Keluar': item.outgoing,
      'Stok Saat Ini': item.currentStock,
      'Total Nilai Keluar': item.totalOutgoing
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Penggunaan Barang');
    XLSX.writeFile(wb, `Penggunaan_Barang_${this.selectedItemUsageMonth?.value || ''}.xlsx`);
  }
}
