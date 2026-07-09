import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Item } from '../../../models/item.model';
import { Category } from '../../../models/category.model';
import { Transaction } from '../../../models/transaction.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-items',
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
    TagModule,
    ToastModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Master Barang</h1>
          <p>Kelola data barang konsumsi dan kebutuhan pokok</p>
        </div>
        <p-button 
          label="Tambah Barang" 
          icon="pi pi-plus" 
          (click)="openAddDialog()" 
          styleClass="p-button-success"
        />
      </div>

      <div class="card-container scrollable-table-card">
        <p-table 
          [value]="items" 
          responsiveLayout="scroll"
          scrollable="true"
          scrollHeight="calc(var(--p-datatable-row-height) * 6)"
          styleClass="p-datatable-striped scrollable-6-rows"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nama Barang</th>
              <th>Kategori</th>
              <th>Satuan</th>
              <th>Harga Satuan</th>
              <th>Stok Saat Ini</th>
              <th>Sisa Stok</th>
              <th style="width: 12rem;">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td class="font-medium text-slate-200">{{ item.name }}</td>
              <td class="text-slate-300">{{ item.category }}</td>
              <td class="text-slate-300">{{ item.unit }}</td>
              <td class="text-slate-300">{{ formatCurrency(item.price) }}</td>
              <td>
                <span class="text-slate-300">{{ item.stock }}</span>
              </td>
              <td>
                <span [class]="isLowStock(getRemainingStock(item.id)) ? 'text-orange-500 font-bold' : 'text-slate-300'">
                  {{ getRemainingStock(item.id) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-pencil" 
                    class="p-button-text" 
                    (click)="openEditDialog(item)"
                  ></p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    class="p-button-text p-button-danger" 
                    (click)="deleteItem(item)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog 
      [header]="isEdit ? 'Edit Barang' : 'Tambah Barang Baru'" 
      [(visible)]="dialogVisible" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="w-full max-w-md"
      appendTo="body"
    >
      <form [formGroup]="itemForm" (ngSubmit)="saveItem()">
        <div class="form-group">
          <label class="form-label">Nama Barang</label>
          <input 
            pInputText 
            formControlName="name" 
            class="w-full"
            placeholder="Masukkan nama barang"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Kategori</label>
          <p-select
            [options]="categories"
            optionLabel="name"
            optionValue="name"
            formControlName="category"
            placeholder="Pilih kategori"
            styleClass="w-full"
            [scrollHeight]="'200px'"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Satuan</label>
           <p-select
            [options]="units"
            formControlName="unit"
            placeholder="Pilih satuan"
            styleClass="w-full"
            [scrollHeight]="'200px'"
            appendTo="body"
          ></p-select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Satuan</label>
            <p-inputNumber 
              formControlName="price" 
              mode="currency" 
              currency="IDR"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
        </div>

        <div *ngIf="isEdit; else addStockField" class="form-grid">
          <div class="form-group">
            <label class="form-label">Sisa Stok</label>
            <p-inputNumber
              formControlName="stock"
              styleClass="w-full"
              [disabled]="true"
            ></p-inputNumber>
          </div>
          <div class="form-group">
            <label class="form-label">Restock</label>
            <p-inputNumber
              formControlName="restock"
              styleClass="w-full"
              [min]="0"
            ></p-inputNumber>
          </div>
        </div>
        <ng-template #addStockField>
          <div class="form-group">
            <label class="form-label">Stok Saat Ini</label>
            <p-inputNumber 
              formControlName="stock" 
              styleClass="w-full"
            ></p-inputNumber>
          </div>
        </ng-template>

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
            [disabled]="!itemForm.valid"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class ItemsComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  transactions: Transaction[] = [];
  categories: Category[] = [];
  units = ['Dus', 'Box', 'Bungkus', 'Kg', 'Pack/Lusin', 'Strip', 'Botol', 'PCS', 'RIM', 'Bal' ];
  dialogVisible = false;
  isEdit = false;
  selectedItemId?: number;
  selectedItemStock = 0;
  selectedItemRemainingStock = 0;
  lowStockThreshold = 10;
  itemForm: FormGroup;
  private refreshSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      unit: ['', Validators.required],
      price: [0, Validators.required],
      stock: [0, Validators.required],
      restock: [0]
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
    this.apiService.getItems().subscribe(data => this.items = data);
    this.apiService.getTransactions().subscribe(data => this.transactions = data);
    this.apiService.getCategories().subscribe(data => this.categories = data);
  }

  getRemainingStock(itemId: number): number {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return 0;
    
    const usedStock = this.transactions
      .filter(t => t.itemId === itemId)
      .reduce((sum, t) => sum + t.quantity, 0);
      
    return item.stock - usedStock;
  }

  openAddDialog(): void {
    this.isEdit = false;
    this.selectedItemId = undefined;
    this.itemForm.get('stock')?.enable();
    this.itemForm.reset();
    this.dialogVisible = true;
  }

  openEditDialog(item: Item): void {
    this.isEdit = true;
    this.selectedItemId = item.id;
    this.selectedItemStock = item.stock;
    this.selectedItemRemainingStock = this.getRemainingStock(item.id);
    this.itemForm.patchValue({
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: item.price,
      stock: item.stock,
      restock: 0
    });
    this.itemForm.get('stock')?.disable();
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  saveItem(): void {
    if (!this.itemForm.valid) return;

    if (this.isEdit && this.selectedItemId) {
      const formValue = this.itemForm.getRawValue();
      const stockIncrement = Number(formValue.restock) || 0;
      const updatedStock = Number(this.selectedItemStock) + stockIncrement;
      const updatePayload = {
        name: formValue.name,
        category: formValue.category,
        unit: formValue.unit,
        price: formValue.price,
        stock: updatedStock
      };

      this.apiService.updateItem(this.selectedItemId, updatePayload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Item diperbarui', life: 1000 });
          this.itemForm.patchValue({ restock: 0, stock: updatedStock });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui item', life: 1000 });
        }
      });
    } else {
      this.apiService.createItem(this.itemForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Item ditambahkan', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menambahkan item', life: 1000 });
        }
      });
    }
  }

  deleteItem(item: Item): void {
    if (confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
      this.apiService.deleteItem(item.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Item dihapus', life: 1000 });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus item', life: 1000 });
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

  isLowStock(stock: number): boolean {
    return stock <= this.lowStockThreshold;
  }
}
