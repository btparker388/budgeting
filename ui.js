const UI = (function() {
    // Render Overview Page
    function renderOverview() {
        const monthKey = State.getMonthKey();
        const pacing = State.calculatePacing(monthKey);
        const spentByCategory = State.calculateSpentByCategory(monthKey);

        const isPacingHigh = pacing.percentOfBudget > pacing.percentOfMonth + 10;
        const isPacingLow = pacing.percentOfBudget < pacing.percentOfMonth - 10;

        let pacingMessage = 'On track';
        let pacingClass = 'on-track';

        if (isPacingHigh) {
            pacingMessage = 'Over budget';
            pacingClass = 'over-budget';
        } else if (isPacingLow) {
            pacingMessage = 'Under budget';
            pacingClass = 'under-budget';
        }

        const categoryRows = Object.entries(spentByCategory)
            .filter(([_, amount]) => amount > 0)
            .map(([category, amount]) => `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">$${amount.toFixed(2)}</span>
                </div>
            `).join('');

        return `
            <div class="pacing-section">
                <h2 class="pacing-title">Discretionary Pacing</h2>
                <div class="pacing-bars">
                    <div class="pacing-bar">
                        <div class="pacing-label">
                            <span>Month Progress</span>
                            <span>${pacing.percentOfMonth.toFixed(1)}% (Day ${pacing.dayOfMonth} of ${pacing.daysInMonth})</span>
                        </div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${Math.min(pacing.percentOfMonth, 100)}%"></div>
                        </div>
                    </div>
                    <div class="pacing-bar">
                        <div class="pacing-label">
                            <span>Budget Spent</span>
                            <span>${pacing.percentOfBudget.toFixed(1)}% ($${pacing.otherSpent.toFixed(2)} of $${pacing.otherBudget.toFixed(2)})</span>
                        </div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${Math.min(pacing.percentOfBudget, 100)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="pacing-summary ${pacingClass}">
                    ${pacingMessage}
                </div>
            </div>

            <div class="category-breakdown">
                <h2 class="breakdown-title">Spending by Category</h2>
                <div class="category-list">
                    ${categoryRows || '<div style="padding: 16px 0; color: #888888;">No transactions yet</div>'}
                </div>
            </div>
        `;
    }

    // Render Budget Page
    function renderBudget() {
        const monthKey = State.getMonthKey();
        const budget = State.getBudget(monthKey);
        const otherBudget = State.calculateOtherBudget(monthKey);
        const totalExpenses = Object.values(budget.expenses).reduce((sum, amount) => sum + amount, 0);

        const expenseInputs = Object.entries(budget.expenses).map(([category, amount]) => `
            <div class="form-group">
                <label>${category}</label>
                <input type="number"
                       class="expense-input"
                       data-category="${category}"
                       value="${amount}"
                       step="0.01">
            </div>
        `).join('');

        return `
            <div class="budget-form">
                <div class="form-section">
                    <h2 class="section-title">Income</h2>
                    <div class="form-group">
                        <label>Total Income</label>
                        <input type="number" id="income-input" value="${budget.income}" step="0.01">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="section-title">Planned Expenses</h2>
                    ${expenseInputs}
                    <button class="add-category-button" id="add-category">Add Category</button>
                </div>

                <div class="budget-summary">
                    <div class="summary-row">
                        <span>Income</span>
                        <span>$${budget.income.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Planned Expenses</span>
                        <span>$${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Other (Discretionary)</span>
                        <span>$${otherBudget.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Transactions Page
    function renderTransactions() {
        const monthKey = State.getMonthKey();
        const budget = State.getBudget(monthKey);
        const transactionsByAccount = State.getTransactionsByAccount(monthKey);

        const categories = ['Other', ...Object.keys(budget.expenses)];

        if (Object.keys(transactionsByAccount).length === 0) {
            return `
                <div style="padding: 32px 0; text-align: center; color: #888888;">
                    No transactions for this month
                </div>
            `;
        }

        const accountSections = Object.entries(transactionsByAccount).map(([account, transactions]) => {
            const transactionItems = transactions.map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return `
                    <div class="transaction-item">
                        <div class="transaction-header">
                            <span class="transaction-description">${transaction.description}</span>
                            <span class="transaction-date">${formattedDate}</span>
                            <span class="transaction-amount">$${Math.abs(transaction.amount).toFixed(2)}</span>
                        </div>
                        <div class="transaction-category">
                            <select class="category-select" data-transaction-id="${transaction.id}">
                                ${categories.map(cat => `
                                    <option value="${cat}" ${transaction.category === cat ? 'selected' : ''}>${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="account-section">
                    <h2 class="account-header">${account}</h2>
                    <div class="transaction-list">
                        ${transactionItems}
                    </div>
                </div>
            `;
        }).join('');

        return accountSections;
    }

    // Render current page
    function render() {
        const content = document.getElementById('content');
        const page = State.getCurrentPage();

        switch (page) {
            case 'overview':
                content.innerHTML = renderOverview();
                break;
            case 'budget':
                content.innerHTML = renderBudget();
                attachBudgetListeners();
                break;
            case 'transactions':
                content.innerHTML = renderTransactions();
                attachTransactionListeners();
                break;
        }
    }

    // Update month display
    function updateMonthDisplay() {
        document.getElementById('current-month').textContent = State.getMonthString();
    }

    // Attach budget page event listeners
    function attachBudgetListeners() {
        const monthKey = State.getMonthKey();

        // Income input
        const incomeInput = document.getElementById('income-input');
        if (incomeInput) {
            incomeInput.addEventListener('change', (e) => {
                const budget = State.getBudget(monthKey);
                budget.income = parseFloat(e.target.value) || 0;
                API.saveData();
                render();
            });
        }

        // Expense inputs
        const expenseInputs = document.querySelectorAll('.expense-input');
        expenseInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                const amount = parseFloat(e.target.value) || 0;
                State.addExpenseCategory(monthKey, category, amount);
                API.saveData();
                render();
            });
        });

        // Add category button
        const addButton = document.getElementById('add-category');
        if (addButton) {
            addButton.addEventListener('click', () => {
                const categoryName = prompt('Enter category name:');
                if (categoryName && categoryName.trim()) {
                    State.addExpenseCategory(monthKey, categoryName.trim(), 0);
                    API.saveData();
                    render();
                }
            });
        }
    }

    // Attach transaction page event listeners
    function attachTransactionListeners() {
        const monthKey = State.getMonthKey();

        const categorySelects = document.querySelectorAll('.category-select');
        categorySelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const transactionId = parseFloat(e.target.dataset.transactionId);
                const newCategory = e.target.value;
                State.updateTransaction(monthKey, transactionId, { category: newCategory });
                API.saveData();
            });
        });
    }

    // Public API
    return {
        render,
        updateMonthDisplay
    };
})();
