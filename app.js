// Initialize app
function init() {
    // Load data from storage
    const hasData = API.loadData();

    // If no data exists, initialize with sample data
    if (!hasData) {
        API.initializeSampleData();
    }

    // Set up navigation
    setupNavigation();

    // Set up month selector
    setupMonthSelector();

    // Initial render
    UI.updateMonthDisplay();
    UI.render();
}

// Setup tab navigation
function setupNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Update current page
            const page = button.dataset.page;
            State.setCurrentPage(page);

            // Render new page
            UI.render();
        });
    });
}

// Setup month selector
function setupMonthSelector() {
    const prevButton = document.getElementById('prev-month');
    const nextButton = document.getElementById('next-month');

    prevButton.addEventListener('click', () => {
        State.prevMonth();
        UI.updateMonthDisplay();
        UI.render();
        API.saveData();
    });

    nextButton.addEventListener('click', () => {
        State.nextMonth();
        UI.updateMonthDisplay();
        UI.render();
        API.saveData();
    });
}

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    API.saveData();
});

// Start the app
init();
