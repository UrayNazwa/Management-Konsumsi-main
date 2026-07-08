const itemRepository = require('../repositories/item.repository');
const transactionRepository = require('../repositories/transaction.repository');
const categoryRepository = require('../repositories/category.repository');
const divisionRepository = require('../repositories/division.repository');

class DashboardService {
  async getDashboardData(year, month) {
    const items = await itemRepository.findAll();
    const transactions = await transactionRepository.findAll();
    const categories = await categoryRepository.findAll();
    const divisions = await divisionRepository.findAll();

    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || String(now.getMonth() + 1).padStart(2, '0');
    const targetMonthYear = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    const targetMonthTransactions = transactions.filter(t => t.date.startsWith(targetMonthYear));
    const monthlyExpense = targetMonthTransactions.reduce((sum, t) => sum + t.total, 0);
    
    // Get unique items that have transactions in this month
    const uniqueItemIdsInMonth = new Set(targetMonthTransactions.map(t => t.itemId));
    const itemsInMonth = items.filter(i => uniqueItemIdsInMonth.has(i.id));
    const totalItems = itemsInMonth.length;
    
    const totalTransactionsCount = targetMonthTransactions.length;
    const lowStockItems = items.filter(i => i.stock < 20);
    const lowStockItem = lowStockItems[0];

    const divisionExpenses = {};
    divisions.forEach(d => {
      divisionExpenses[d.name] = 0;
    });
    targetMonthTransactions.forEach(t => {
      divisionExpenses[t.division] = (divisionExpenses[t.division] || 0) + t.total;
    });

    const categoryConsumption = {};
    categories.forEach(c => {
      categoryConsumption[c.name] = 0;
    });
    targetMonthTransactions.forEach(t => {
      const item = items.find(i => i.id === t.itemId);
      if (item) {
        categoryConsumption[item.category] = (categoryConsumption[item.category] || 0) + t.quantity;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(targetYear, parseInt(targetMonth) - 1 - i, 1);
      const trendYear = date.getFullYear();
      const trendMonth = String(date.getMonth() + 1).padStart(2, '0');
      const monthYear = `${trendYear}-${trendMonth}`;
      const monthTransactions = transactions.filter(t => t.date.startsWith(monthYear));
      const total = monthTransactions.reduce((sum, t) => sum + t.total, 0);
      monthlyTrend.push({
        month: months[date.getMonth()],
        value: total
      });
    }

    return {
      selectedYear: targetYear,
      selectedMonth: targetMonth,
      monthlyExpense,
      totalItems,
      totalTransactions: totalTransactionsCount,
      selectedMonthTransactionCount: targetMonthTransactions.length,
      lowStockItems: lowStockItems.length,
      lowStockItemName: lowStockItem?.name || '',
      lowStockItemQty: lowStockItem?.stock || 0,
      divisionExpenses,
      categoryConsumption,
      monthlyTrend
    };
  }
}

module.exports = new DashboardService();
