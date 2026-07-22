import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Category } from '../../../models/category.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Master Kategori</h1>
          <p>Kelola kategori barang konsumsi dan kebutuhan pokok</p>
        </div>
        <p-button 
          label="Tambah Kategori" 
          icon="pi pi-plus" 
          (click)="openAddDialog()" 
          styleClass="p-button-success"
        />
      </div>

      <div class="card-container scrollable-table-card">
        <p-table 
          [value]="categories" 
          responsiveLayout="scroll"
          scrollable="true"
          scrollHeight="calc(var(--p-datatable-row-height) * 6)"
          styleClass="p-datatable-striped history-scrollable scrollable-6-rows"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th style="width: 12rem;">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-category>
            <tr>
              <td class="font-medium text-slate-200">{{ category.name }}</td>
              <td class="text-slate-300">{{ category.description }}</td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-pencil" 
                    styleClass="p-button-text p-button-sm" 
                    (click)="openEditDialog(category)"
                  ></p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    styleClass="p-button-text p-button-danger p-button-sm" 
                    (click)="deleteCategory(category)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog 
      [header]="isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'" 
      [(visible)]="dialogVisible" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="w-full max-w-md"
      appendTo="body"
    >
      <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
        <div class="form-group">
          <label class="form-label">Nama Kategori</label>
          <input 
            pInputText 
            formControlName="name" 
            class="w-full"
            placeholder="Masukkan nama kategori"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea 
            pInputTextarea 
            formControlName="description" 
            class="w-full"
            rows="4"
            placeholder="Masukkan deskripsi kategori"
          ></textarea>
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
            [disabled]="!categoryForm.valid"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  dialogVisible = false;
  isEdit = false;
  selectedCategoryId?: number;
  categoryForm: FormGroup;
  private refreshSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadCategories();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe(data => this.categories = data);
  }

  openAddDialog(): void {
    this.isEdit = false;
    this.selectedCategoryId = undefined;
    this.categoryForm.reset();
    this.dialogVisible = true;
  }

  openEditDialog(category: Category): void {
    this.isEdit = true;
    this.selectedCategoryId = category.id;
    this.categoryForm.patchValue(category);
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  saveCategory(): void {
    if (!this.categoryForm.valid) return;

    if (this.isEdit && this.selectedCategoryId) {
      this.apiService.updateCategory(this.selectedCategoryId, this.categoryForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Kategori diperbarui', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui kategori', life: 1000 });
        }
      });
    } else {
      this.apiService.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Kategori ditambahkan', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menambahkan kategori', life: 1000 });
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (confirm(`Apakah Anda yakin ingin menghapus ${category.name}?`)) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Kategori dihapus', life: 1000 });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus kategori', life: 1000 });
        }
      });
    }
  }
}
