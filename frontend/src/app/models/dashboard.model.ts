export interface Dashboard {
  selectedYear: number;
  selectedMonth: number | string;
  monthlyExpense: number;
  totalItems: number;
  totalTransactions: number;
  selectedMonthTransactionCount: number;
  lowStockItems: number;
  lowStockItemName: string;
  lowStockItemQty: number;
  divisionExpenses: { [key: string]: number };
  categoryConsumption: { [key: string]: number };
  monthlyTrend: Array<{ month: string; value: number }>;
}
