import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { BadgeModule } from 'primeng/badge';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    PanelMenuModule,
    BadgeModule
  ],
  styleUrls: ['./layout.component.css'],
  template: `
    <div class="app-container">
      <!-- Sidebar Overlay (Mobile) -->
      <div *ngIf="sidebarOpen && isMobile" 
           class="sidebar-overlay"
           (click)="sidebarOpen = false">
      </div>

      <!-- Mobile Sidebar -->
      <div *ngIf="isMobile"
           class="sidebar sidebar-mobile"
           [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="logo-circle">
              <span class="logo-text">MK</span>
            </div>
            <div class="logo-title">
              <h1>Manajemen</h1>
              <p>Konsumsi & Pokok</p>
            </div>
          </div>
          <p-button icon="pi pi-times" 
                    styleClass="p-button-text p-button-sm text-white"
                    (onClick)="sidebarOpen = false" />
        </div>
        <p-panelmenu [model]="menuItems" [multiple]="false" class="sidebar-menu" />
        <div class="sidebar-footer">
          <p>v1.0 - 2026</p>
        </div>
      </div>

      <!-- Desktop Sidebar -->
      <div class="sidebar sidebar-desktop">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="logo-circle">
              <span class="logo-text">MK</span>
            </div>
            <div class="logo-title">
              <h1>Manajemen</h1>
              <p>Konsumsi & Pokok</p>
            </div>
          </div>
        </div>
        <p-panelmenu [model]="menuItems" [multiple]="false" class="sidebar-menu" />
        <div class="sidebar-footer">
          <p>v1.0 - 2026</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <header class="main-header">
          <div class="header-content">
            <div class="header-left">
              <p-button *ngIf="isMobile" 
                        icon="pi pi-bars" 
                        styleClass="p-button-text p-button-sm text-white"
                        (onClick)="sidebarOpen = true" />
              <h2>PT.Gamma Persada</h2>
            </div>
            <div class="header-right">
              <p-button icon="pi pi-bell" styleClass="p-button-text p-button-rounded p-button-sm" [badge]="lowStockCount.toString()" badgeClass="p-badge-danger" />
              <div class="user-avatar">
                <span>U</span>
              </div>
            </div>
          </div>
        </header>
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  isMobile = false;
  lowStockCount = 0;
  items: Item[] = [];
  transactions: Transaction[] = [];

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: '/dashboard',
      styleClass: 'sidebar-leaf-item'
    },
    {
      label: 'Master Data',
      icon: 'pi pi-database',
      expanded: false,
      styleClass: 'sidebar-parent-item',
      items: [
        { label: 'Kategori', icon: 'pi pi-tags', routerLink: '/categories' },
        { label: 'Barang', icon: 'pi pi-box', routerLink: '/items' },
        { label: 'Divisi', icon: 'pi pi-users', routerLink: '/divisions' }
      ]
    },
    {
      label: 'Transaksi',
      icon: 'pi pi-shopping-cart',
      expanded: false,
      styleClass: 'sidebar-parent-item',
      items: [
        { label: 'Input Konsumsi', icon: 'pi pi-file-edit', routerLink: '/transactions' },
        { label: 'Riwayat', icon: 'pi pi-history', routerLink: '/history' }
      ]
    },
    {
      label: 'Laporan',
      icon: 'pi pi-chart-pie',
      expanded: false,
      styleClass: 'sidebar-parent-item',
      items: [
        { label: 'Pengeluaran Bulanan', icon: 'pi pi-chart-line', routerLink: '/reports/monthly' },
        { label: 'Per Divisi', icon: 'pi pi-building', routerLink: '/reports/division' },
        { label: 'Penggunaan Barang', icon: 'pi pi-box', routerLink: '/reports/item-usage' }
      ]
    }
  ];

  private routerSub?: Subscription;
  private refreshSub?: Subscription;

  constructor(private router: Router, private apiService: ApiService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  ngOnInit(): void {
    this.updateMenuState();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuState();
      }
    });
    this.loadData();
    this.refreshSub = this.apiService.refresh$.subscribe(() => this.loadData());
  }

  loadData() {
    this.apiService.getItems().subscribe(data => {
      this.items = data;
      this.calculateLowStock();
    });
    this.apiService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.calculateLowStock();
    });
  }

  calculateLowStock() {
    let count = 0;
    this.items.forEach(item => {
      const totalOut = this.transactions
        .filter(t => t.itemId === item.id)
        .reduce((sum, t) => sum + t.quantity, 0);
      const remaining = item.stock - totalOut;
      if (remaining < 5) {
        count++;
      }
    });
    this.lowStockCount = count;
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  updateMenuState(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach((menu) => {
      if (menu.items) {
        const isParentActive = menu.items.some((item: MenuItem) => 
          currentUrl.startsWith((item.routerLink as string))
        );
        menu.expanded = isParentActive;
      }
    });
  }
}
