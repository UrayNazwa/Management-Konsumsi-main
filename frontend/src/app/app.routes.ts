import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ItemsComponent } from './components/master-data/items/items.component';
import { CategoriesComponent } from './components/master-data/categories/categories.component';
import { DivisionsComponent } from './components/master-data/divisions/divisions.component';
import { TransactionsComponent } from './components/transactions/input/transactions.component';
import { HistoryComponent } from './components/transactions/history/history.component';
import { ReportsComponent } from './components/reports/monthly/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'divisions', component: DivisionsComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'reports/monthly', component: ReportsComponent },
  { path: 'reports/division', component: ReportsComponent },
  { path: 'reports/item-usage', component: ReportsComponent }
];
