import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Item } from '../models/item.model';
import { Category } from '../models/category.model';
import { Transaction } from '../models/transaction.model';
import { Dashboard } from '../models/dashboard.model';
import { Division } from '../models/division.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';
  private refreshSubject = new BehaviorSubject<void>(void 0);
  refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  // Dashboard
  getDashboard(year?: number, month?: number): Observable<Dashboard> {
    let url = `${this.apiUrl}/dashboard`;
    const params: string[] = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<Dashboard>(url);
  }

  // Items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }

  createItem(item: Omit<Item, 'id'>): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  updateItem(id: number, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  // Divisions
  getDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(`${this.apiUrl}/divisions`);
  }

  createDivision(division: Omit<Division, 'id'>): Observable<Division> {
    return this.http.post<Division>(`${this.apiUrl}/divisions`, division).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  updateDivision(id: number, division: Partial<Division>): Observable<Division> {
    return this.http.put<Division>(`${this.apiUrl}/divisions/${id}`, division).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  deleteDivision(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/divisions/${id}`).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  createTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, transaction).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`).pipe(
      tap(() => this.triggerRefresh())
    );
  }
}
