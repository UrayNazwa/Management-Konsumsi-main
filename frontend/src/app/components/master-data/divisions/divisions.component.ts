import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Division } from '../../../models/division.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-divisions',
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
          <h1>Master Divisi</h1>
          <p>Kelola divisi kantor</p>
        </div>
        <p-button 
          label="Tambah Divisi" 
          icon="pi pi-plus" 
          (click)="openAddDialog()" 
          styleClass="p-button-success"
        />
      </div>

      <div class="card-container">
        <p-table 
          [value]="divisions" 
          responsiveLayout="scroll"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nama Divisi</th>
              <th>Deskripsi</th>
              <th style="width: 12rem;">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-division>
            <tr>
              <td class="font-medium text-slate-200">{{ division.name }}</td>
              <td class="text-slate-300">{{ division.description }}</td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-pencil" 
                    class="p-button-text" 
                    (click)="openEditDialog(division)"
                  />
                  <p-button 
                    icon="pi pi-trash" 
                    class="p-button-text p-button-danger" 
                    (click)="deleteDivision(division)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog 
      [header]="isEdit ? 'Edit Divisi' : 'Tambah Divisi Baru'" 
      [(visible)]="dialogVisible" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="w-full max-w-md"
    >
      <form [formGroup]="divisionForm" (ngSubmit)="saveDivision()">
        <div class="form-group">
          <label class="form-label">Nama Divisi</label>
          <input 
            pInputText 
            formControlName="name" 
            class="w-full"
            placeholder="Masukkan nama divisi"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea 
            pInputTextarea 
            formControlName="description" 
            rows="3"
            class="w-full"
            placeholder="Masukkan deskripsi divisi"
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
            [disabled]="!divisionForm.valid"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast />
  `
})
export class DivisionsComponent implements OnInit, OnDestroy {
  divisions: Division[] = [];
  dialogVisible = false;
  isEdit = false;
  selectedDivisionId?: number;
  divisionForm: FormGroup;
  private refreshSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.divisionForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDivisions();
    this.refreshSub = this.apiService.refresh$.subscribe(() => {
      this.loadDivisions();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadDivisions(): void {
    this.apiService.getDivisions().subscribe(data => this.divisions = data);
  }

  openAddDialog(): void {
    this.isEdit = false;
    this.selectedDivisionId = undefined;
    this.divisionForm.reset();
    this.dialogVisible = true;
  }

  openEditDialog(division: Division): void {
    this.isEdit = true;
    this.selectedDivisionId = division.id;
    this.divisionForm.patchValue(division);
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  saveDivision(): void {
    if (!this.divisionForm.valid) return;

    if (this.isEdit && this.selectedDivisionId) {
      this.apiService.updateDivision(this.selectedDivisionId, this.divisionForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Divisi diperbarui', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui divisi', life: 1000 });
        }
      });
    } else {
      this.apiService.createDivision(this.divisionForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Divisi ditambahkan', life: 1000 });
          this.closeDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menambahkan divisi', life: 1000 });
        }
      });
    }
  }

  deleteDivision(division: Division): void {
    if (confirm(`Apakah Anda yakin ingin menghapus ${division.name}?`)) {
      this.apiService.deleteDivision(division.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Divisi dihapus', life: 1000 });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus divisi', life: 1000 });
        }
      });
    }
  }
}
