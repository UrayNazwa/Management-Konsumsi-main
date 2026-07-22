import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Transaction } from '../../../models/transaction.model';
import { Item } from '../../../models/item.model';
import { Division } from '../../../models/division.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DatePickerModule,
    ToastModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Input Konsumsi</h1>
          <p>Catat transaksi pengeluaran konsumsi dan kebutuhan pokok bulan {{ currentMonthYear }}</p>
        </div>
        <p-button 
          label="Tambah Transaksi" 
          icon="pi pi-plus" 
          (click)="openAddDialog()" 
          styleClass="p-button-success"
        ></p-button>
      </div>

      <div class="page-section" *ngIf="currentMonthTransactions.length > 0; else emptyState">
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card-label">Total Transaksi Bulan Ini</p>
            <p class="stat-card-value text-teal-500">{{ currentMonthTransactions.length }}</p>
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
            [value]="currentMonthTransactions"
            responsiveLayout="scroll"
            scrollable="true"
            scrollHeight="22.5rem"
            styleClass="p-datatable-striped history-scrollable"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                <th>Jumlah</th>
                <th>Divisi</th>
                <th>Total</th>
                <th style="width: 12rem;">Aksi</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-transaction>
              <tr>
                <td class="font-medium text-slate-200">{{ transaction.date }}</td>
                <td class="text-slate-200">{{ transaction.itemName }}</td>
                <td class="text-slate-300">{{ transaction.quantity }}</td>
                <td>
                  <span class="badge-teal">
                    {{ transaction.division }}
                  </span>
                </td>
                <td class="font-semibold text-slate-200">{{ formatCurrency(transaction.total) }}</td>
                <td>
                  <div class="action-buttons">
                    <p-button 
                      icon="pi pi-pencil" 
                      styleClass="p-button-text p-button-sm" 
                      (click)="openEditDialog(transaction)"
                    ></p-button>
                    <p-button 
                      icon="pi pi-trash" 
                      styleClass="p-button-text p-button-danger p-button-sm" 
                      (click)="deleteTransaction(transaction)"
                    ></p-button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <i class="pi pi-plus-circle empty-state-icon"></i>
          <h3 class="empty-state-title">Belum ada transaksi</h3>
          <p class="empty-state-description">Mulai catat transaksi konsumsi kamu!</p>
          <p-button
            label="Tambah Transaksi Pertama"
            icon="pi pi-plus"
            (click)="openAddDialog()"
            styleClass="p-button-success"
          ></p-button>
        </div>
      </ng-template>
    </div>

    <p-dialog 
      [header]="isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'" 
      [(visible)]="dialogVisible" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="w-full max-w-md"
      appendTo="body"
    >
      <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()">
        <div class="form-group">
          <label class="form-label">Barang</label>
          <p-select
            [options]="items"
            optionLabel="name"
            optionValue="id"
            formControlName="itemId"
            placeholder="Pilih barang"
            styleClass="w-full"
            [scrollHeight]="'200px'"
            appendTo="body"
          ></p-select>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah</label>
          <p-inputNumber 
            formControlName="quantity" 
            [min]="1"
            styleClass="w-full"
          ></p-inputNumber>
        </div>

        <div class="form-group">
          <label class="form-label">Divisi</label>
          <p-select
            [options]="divisions"
            optionLabel="name"
            optionValue="name"
            formControlName="division"
            placeholder="Pilih divisi"
            styleClass="w-full"
            [scrollHeight]="'200px'"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-group">
          <label class="form-label">Tanggal</label>
          <p-datepicker 
            formControlName="date" 
            dateFormat="yy-mm-dd"
            styleClass="w-full"
            [showIcon]="true"
          ></p-datepicker>
        </div>

        <div class="form-footer">
          <p-button 
            label="Batal" 
            styleClass="p-button-text p-button-sm" 
            (click)="closeDialog()"
            type="button"
          ></p-button>
          <p-button 
            label="Simpan" 
            styleClass="p-button-text p-button-sm" 
            type="submit"
            [disabled]="!transactionForm.valid"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  items: Item[] = [];
  divisions: Division[] = [];
  dialogVisible = false;
  isEdit = false;
  selectedTransactionId?: number;
  transactionForm: FormGroup;
  private refreshSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.transactionForm = this.fb.group({
      itemId: ['', Validators.required],
      quantity: [1, Validators.required],
      division: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadData(): void {
    this.apiService.getTransactions().subscribe(data => this.transactions = data);
    this.apiService.getItems().subscribe(data => this.items = data);
    this.apiService.getDivisions().subscribe(data => this.divisions = data);
  }

  get currentMonthYear(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[month - 1]} ${year}`;
  }

  get currentMonthTransactions(): Transaction[] {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = String(now.getFullYear());
    const currentMonthYear = `${currentYear}-${currentMonth}`;
    return this.transactions.filter(t => t.date.startsWith(currentMonthYear));
  }

  get totalAmount(): number {
    return this.currentMonthTransactions.reduce((sum, t) => sum + t.total, 0);
  }

  get totalQuantity(): number {
    return this.currentMonthTransactions.reduce((sum, t) => sum + t.quantity, 0);
  }

  openAddDialog(): void {
    this.isEdit = false;
    this.selectedTransactionId = undefined;
    this.transactionForm.reset({
      itemId: '',
      quantity: 1,
      division: '',
      date: new Date()
    });
    this.dialogVisible = true;
  }

  openEditDialog(transaction: Transaction): void {
    this.isEdit = true;
    this.selectedTransactionId = transaction.id;
    // Convert date string back to Date object
    const [year, month, day] = transaction.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    this.transactionForm.patchValue({
      itemId: transaction.itemId,
      quantity: transaction.quantity,
      division: transaction.division,
      date: dateObj
    });
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  saveTransaction(): void {
    if (!this.transactionForm.valid) return;

    const itemId = this.transactionForm.value.itemId;
    const item = this.items.find(i => i.id === itemId);

    if (!item) return;

    const transactionData = {
      itemId,
      itemName: item.name,
      quantity: this.transactionForm.value.quantity,
      division: this.transactionForm.value.division,
      date: this.formatDate(this.transactionForm.value.date),
      total: item.price * this.transactionForm.value.quantity
    };

    if (this.isEdit && this.selectedTransactionId) {
      this.apiService.updateTransaction(this.selectedTransactionId, transactionData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Transaksi diperbarui', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui transaksi', life: 1000 });
        }
      });
    } else {
      this.apiService.createTransaction(transactionData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Transaksi ditambahkan', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menambahkan transaksi', life: 1000 });
        }
      });
    }
  }

  deleteTransaction(transaction: Transaction): void {
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi ini?`)) {
      this.apiService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Transaksi dihapus', life: 1000 });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus transaksi', life: 1000 });
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
