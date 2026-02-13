// State management
const State = (function() {
    const state = {
    currentMonth: new Date(2026, 1), // February 2026
    currentPage: 'overview',
    budgets: {}, // { 'YYYY-MM': { income: 0, expenses: { category: amount } } }
    transactions: {}, // { 'YYYY-MM': [{ id, date, description, amount, category, account }] }
};

    // Get month key in YYYY-MM format
    function getMonthKey(date = state.currentMonth) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
    }

    // Get formatted month string
    function getMonthString(date = state.currentMonth) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Navigation
    function getCurrentPage() {
    return state.currentPage;
    }

    function setCurrentPage(page) {
    state.currentPage = page;
    }

    // Month navigation
    function getCurrentMonth() {
    return new Date(state.currentMonth);
    }

    function nextMonth() {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1);
    return getCurrentMonth();
    }

    function prevMonth() {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1);
    return getCurrentMonth();
    }

    // Budget operations
    function getBudget(monthKey = getMonthKey()) {
    if (!state.budgets[monthKey]) {
        state.budgets[monthKey] = {
            income: 0,
            expenses: {}
        };
    }
    return state.budgets[monthKey];
    }

    function updateBudget(monthKey, budgetData) {
    state.budgets[monthKey] = budgetData;
    }

    function addExpenseCategory(monthKey, category, amount) {
    const budget = getBudget(monthKey);
    budget.expenses[category] = amount;
    }

    function removeExpenseCategory(monthKey, category) {
    const budget = getBudget(monthKey);
    delete budget.expenses[category];
    }

    // Transaction operations
    function getTransactions(monthKey = getMonthKey()) {
    if (!state.transactions[monthKey]) {
        state.transactions[monthKey] = [];
    }
    return state.transactions[monthKey];
    }

    function addTransaction(monthKey, transaction) {
    const transactions = getTransactions(monthKey);
    transactions.push({
        id: Date.now() + Math.random(),
        ...transaction
    });
    }

    function updateTransaction(monthKey, transactionId, updates) {
    const transactions = getTransactions(monthKey);
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        Object.assign(transaction, updates);
    }
    }

    function getTransactionsByAccount(monthKey = getMonthKey()) {
    const transactions = getTransactions(monthKey);
    const byAccount = {};

    transactions.forEach(transaction => {
        if (!byAccount[transaction.account]) {
            byAccount[transaction.account] = [];
        }
        byAccount[transaction.account].push(transaction);
    });

    return byAccount;
    }

    // Calculations
    function calculateOtherBudget(monthKey = getMonthKey()) {
    const budget = getBudget(monthKey);
    const totalExpenses = Object.values(budget.expenses).reduce((sum, amount) => sum + amount, 0);
    return budget.income - totalExpenses;
    }

    function calculateSpentByCategory(monthKey = getMonthKey()) {
    const transactions = getTransactions(monthKey);
    const budget = getBudget(monthKey);
    const spent = {};

    // Initialize with budget categories
    Object.keys(budget.expenses).forEach(category => {
        spent[category] = 0;
    });

    // Initialize "Other"
    spent['Other'] = 0;

    // Sum transactions by category
    transactions.forEach(transaction => {
        if (transaction.amount < 0) { // Only count expenses
            const category = transaction.category || 'Other';
            if (!spent[category]) {
                spent[category] = 0;
            }
            spent[category] += Math.abs(transaction.amount);
        }
    });

    return spent;
    }

    function calculateTotalSpent(monthKey = getMonthKey()) {
    const transactions = getTransactions(monthKey);
    return transactions.reduce((sum, t) => {
        return t.amount < 0 ? sum + Math.abs(t.amount) : sum;
    }, 0);
    }

    function calculatePacing(monthKey = getMonthKey()) {
    const budget = getBudget(monthKey);
    const otherBudget = calculateOtherBudget(monthKey);
    const spent = calculateSpentByCategory(monthKey);
    const otherSpent = spent['Other'] || 0;

    // Calculate what day of the month we're on
    const now = new Date();
    const monthDate = state.currentMonth;

    let dayOfMonth, daysInMonth;

    if (now.getMonth() === monthDate.getMonth() && now.getFullYear() === monthDate.getFullYear()) {
        // Current month - use actual day
        dayOfMonth = now.getDate();
        daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    } else {
        // Past or future month - assume end of month
        daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        dayOfMonth = daysInMonth;
    }

    const percentOfMonth = (dayOfMonth / daysInMonth) * 100;
    const percentOfBudget = otherBudget > 0 ? (otherSpent / otherBudget) * 100 : 0;

    return {
        percentOfMonth,
        percentOfBudget,
        dayOfMonth,
        daysInMonth,
        otherBudget,
        otherSpent
        };
    }

    // Public API
    return {
        state,
        getMonthKey,
        getMonthString,
        getCurrentPage,
        setCurrentPage,
        getCurrentMonth,
        nextMonth,
        prevMonth,
        getBudget,
        updateBudget,
        addExpenseCategory,
        removeExpenseCategory,
        getTransactions,
        addTransaction,
        updateTransaction,
        getTransactionsByAccount,
        calculateOtherBudget,
        calculateSpentByCategory,
        calculateTotalSpent,
        calculatePacing
    };
})();
