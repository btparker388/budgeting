const API = (function() {
    const STORAGE_KEY = 'budget-app-data';

    // Load data from localStorage
    function loadData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.budgets) State.state.budgets = parsed.budgets;
                if (parsed.transactions) State.state.transactions = parsed.transactions;
                return true;
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        return false;
    }

    // Save data to localStorage
    function saveData() {
        try {
            const data = {
                budgets: State.state.budgets,
                transactions: State.state.transactions
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Initialize with sample data if needed
    function initializeSampleData() {
        const monthKey = State.getMonthKey();

        // Sample budget
        State.updateBudget(monthKey, {
            income: 5000,
            expenses: {
                'Mortgage': 1200,
                'Utilities': 150,
                'Car Payment': 350,
                'Insurance': 200,
                'Subscriptions': 50,
                'Tithing': 500
            }
        });

        // Sample transactions
        const sampleTransactions = [
            { date: '2026-02-01', description: 'Grocery Store', amount: -125.50, category: 'Other', account: 'Chase Visa' },
            { date: '2026-02-02', description: 'Gas Station', amount: -45.00, category: 'Other', account: 'Chase Visa' },
            { date: '2026-02-03', description: 'Netflix', amount: -15.99, category: 'Subscriptions', account: 'Synovus' },
            { date: '2026-02-05', description: 'Mortgage Payment', amount: -1200.00, category: 'Mortgage', account: 'Synovus' },
            { date: '2026-02-06', description: 'Electric Bill', amount: -89.50, category: 'Utilities', account: 'Synovus' },
            { date: '2026-02-07', description: 'Restaurant', amount: -67.25, category: 'Other', account: 'Chase Visa' },
            { date: '2026-02-08', description: 'Amazon', amount: -134.99, category: 'Other', account: 'Chase Visa' },
            { date: '2026-02-10', description: 'Gas Station', amount: -42.00, category: 'Other', account: 'Chase Visa' },
            { date: '2026-02-11', description: 'Grocery Store', amount: -156.75, category: 'Other', account: 'Chase Visa' },
        ];

        sampleTransactions.forEach(transaction => {
            State.addTransaction(monthKey, transaction);
        });

        saveData();
    }

    // Public API
    return {
        loadData,
        saveData,
        initializeSampleData
    };
})();
