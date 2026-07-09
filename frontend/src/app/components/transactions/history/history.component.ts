import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Transaction } from '../../../models/transaction.model';
import { Item } from '../../../models/item.model';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface MonthYear {
  label: string;
  value: string;
  month: number;
  year: number;
}

interface TransactionWithStock extends Transaction {
  finalStock?: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    SelectModule,
    FormsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Riwayat Transaksi</h1>
          <p>Lihat riwayat transaksi setahun belakangan</p>
        </div>
        <div class="filter-group">
          <span class="filter-label">Pilih Bulan:</span>
          <p-select
            [options]="monthYearOptions"
            [(ngModel)]="selectedMonthYear"
            (onChange)="filterTransactions()"
            styleClass="w-full md:w-40"
            appendTo="body"
            optionLabel="label"
          ></p-select>
        </div>
      </div>

      <div class="page-section" *ngIf="filteredTransactions.length > 0; else emptyState">
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card-label">Total Transaksi</p>
            <p class="stat-card-value text-teal-500">{{ filteredTransactions.length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-label">Total Pengeluaran</p>
            <p class="stat-card-value text-blue-500">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-label">Jumlah Barang</p>
            <p class="stat-card-value text-purple-500">{{ totalQuantity }}</p>
          </div>
        </div>

        <div class="card-container scrollable-table-card">
          <p-table
            [value]="filteredTransactions"
            responsiveLayout="scroll"
            scrollable="true"
            scrollHeight="18.75rem"
            styleClass="p-datatable-striped history-scrollable"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                <th>Barang Keluar</th>
                <th>Stok Akhir</th>
                <th>Divisi</th>
                <th>Total</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-transaction>
              <tr>
                <td class="font-medium text-slate-200">{{ transaction.date }}</td>
                <td class="text-slate-200">{{ transaction.itemName }}</td>
                <td class="text-slate-300">{{ transaction.quantity }}</td>
                <td [ngClass]="transaction.finalStock && transaction.finalStock < 10 ? 'text-red-400 font-medium' : 'text-slate-300'">
                  {{ transaction.finalStock }}
                </td>
                <td>
                  <span class="badge-teal">
                    {{ transaction.division }}
                  </span>
                </td>
                <td class="font-semibold text-slate-200">{{ formatCurrency(transaction.total) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <i class="pi pi-inbox empty-state-icon text-slate-600"></i>
          <h3 class="empty-state-title">Tidak ada transaksi</h3>
          <p class="empty-state-description">Belum ada transaksi pada bulan yang dipilih</p>
        </div>
      </ng-template>
    </div>
  `
})
export class HistoryComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  items: Item[] = [];
  filteredTransactions: TransactionWithStock[] = [];
  monthYearOptions: MonthYear[] = [];
  selectedMonthYear: MonthYear | null = null;
  private refreshSub?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.generateMonthYearOptions();
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadData(): void {
    this.apiService.getItems().subscribe(data => {
      this.items = data;
    });
    this.apiService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.filterTransactions();
    });
  }

  generateMonthYearOptions(): void {
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const label = `${this.getMonthName(month)} ${year}`;
      const value = `${year}-${String(month).padStart(2, '0')}`;
      this.monthYearOptions.push({ label, value, month, year });
    }
    this.selectedMonthYear = this.monthYearOptions[0];
  }

  getMonthName(month: number): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  }

  filterTransactions(): void {
    if (!this.selectedMonthYear) {
      this.filteredTransactions = this.calculateFinalStock(this.transactions);
      return;
    }
    const filtered = this.transactions.filter(t => 
      t.date.startsWith(this.selectedMonthYear!.value)
    );
    this.filteredTransactions = this.calculateFinalStock(filtered);
  }

  calculateFinalStock(transactions: Transaction[]): TransactionWithStock[] {
    // Urutkan transaksi berdasarkan tanggal
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    // Hitung total barang keluar per item sampai saat ini
    const totalOutMap: { [key: number]: number } = {};
    
    // Mulai dari transaksi paling awal untuk perhitungan stok yang akurat
    // Kita butuh semua transaksi untuk perhitungan stok, bukan hanya yang di-filter
    const allSorted = [...this.transactions].sort((a, b) => a.date.localeCompare(b.date));
    const allTotalOutMap: { [key: number]: number } = {};
    
    allSorted.forEach(t => {
      if (!allTotalOutMap[t.itemId]) {
        allTotalOutMap[t.itemId] = 0;
      }
      allTotalOutMap[t.itemId] += t.quantity;
    });

    return sorted.map(t => {
      const item = this.items.find(i => i.id === t.itemId);
      let finalStock = 0;
      
      if (item) {
        // Hitung total keluar sebelum dan termasuk transaksi ini
        const totalOutBefore = allTotalOutMap[t.itemId] || 0;
        // Kurangi dengan transaksi setelahnya untuk mendapatkan stok pada saat transaksi ini
        // Wait, better approach: hitung stok berjalan dari awal
        // Kita buat map baru untuk perhitungan stok berjalan
      }
      
      // Alternatif: hitung stok berjalan dari transaksi paling awal
      // Reset map
      const runningStockMap: { [key: number]: number } = {};
      this.items.forEach(item => {
        runningStockMap[item.id] = item.stock;
      });
      
      let finalStockVal = 0;
      let found = false;
      
      for (const trx of allSorted) {
        if (runningStockMap[trx.itemId] !== undefined) {
          runningStockMap[trx.itemId] -= trx.quantity;
        }
        if (trx.id === t.id) {
          finalStockVal = runningStockMap[trx.itemId] || 0;
          found = true;
          break;
        }
      }
      
      return {
        ...t,
        finalStock: finalStockVal
      };
    });
  }

  get totalAmount(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  }

  get totalQuantity(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + t.quantity, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
