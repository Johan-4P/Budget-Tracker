/* global Chart, Swal */ // Add Swal to global declarations
// jshint esversion: 6
// jshint esversion: 10
document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    const budgetGoals = JSON.parse(localStorage.getItem("budgetGoals")) || {};
    const expenseList = JSON.parse(localStorage.getItem("expenseList")) || [];
    const expenseCategories = (() => {
        try {
            return JSON.parse(localStorage.getItem("expenseCategories")) || {};
        } catch {
            return {};
        }
    })();
    // Input section
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const dateInput = document.getElementById("date");
    const categoryInput = document.getElementById("category");
    const addDataButton = document.getElementById("add-data");

    //summary section
    const totalIncomeDisplay = document.getElementById("total-income");
    const totalExpensesDisplay = document.getElementById("total-expenses");
    const balanceDisplay = document.getElementById("balance");

    // savings section
    const updateSavingsButton = document.getElementById("update-savings");
    const saveBudgetButton = document.getElementById("save-budget");
    const savingsGoalText = document.getElementById("savings-goal-text");
    const savingsProgressText = document.getElementById("savings-progress-text");

    // Table section
    const expenseTableBody = document.getElementById("expense-table").querySelector("tbody");

    // Budget goals section
    const budgetGoalsList = document.getElementById("budget-goals-list");
    const budgetCategoryInput = document.getElementById("budget-category");
    const budgetCategoryOtherInput = document.getElementById("budget-category-other");

    // Chart section
    let pieChartInstance, barChartInstance;

    // Reset section
    const resetButton = document.getElementById("reset");




    // Show/hide "Other" category input for budget goals
    budgetCategoryInput.addEventListener("change", () => {
        if (budgetCategoryInput.value === "other") {
            budgetCategoryOtherInput.style.display = "block";
        } else {
            budgetCategoryOtherInput.style.display = "none";
        }
    });

    // Update totals
    function updateTotals() {
        const balance = totalIncome - totalExpenses;

        totalIncomeDisplay.innerText = `Total Income: ${totalIncome.toFixed(2)}`;
        totalExpensesDisplay.innerText = `Total Expenses: -${totalExpenses.toFixed(2)}`;
        balanceDisplay.innerText = `Balance: ${balance.toFixed(2)}`;

        if (savingsGoal > 0) {
            const progress = (balance / savingsGoal) * 100;
            savingsGoalText.innerText = `Savings Goal: ${savingsGoal.toFixed(2)}`;
            savingsProgressText.innerText = `Savings Progress: ${progress.toFixed(2)}%`;
        } else {
            savingsGoalText.innerText = "Savings Goal: 0";
            savingsProgressText.innerText = "Savings Progress: 0%";
        }

        localStorage.setItem("totalIncome", totalIncome);
        localStorage.setItem("totalExpenses", totalExpenses);
    }

    // Save budget goal with validation
    function saveBudgetGoal() {
        const form = document.getElementById('budget-goals-form');
        const categoryOther = document.getElementById('budget-category-other');

        // Enable validation on category-other only when it's visible
        if (budgetCategoryInput.value === 'other') {
            categoryOther.setAttribute('required', '');
        } else {
            categoryOther.removeAttribute('required');
        }

        // Add Bootstrap validation classes
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            return; // Stop if form is invalid
        }

        let category = budgetCategoryInput.value;
        const amount = parseFloat(document.getElementById("budget-amount").value) || 0;

        if (category === "select" || amount <= 0) {
            return;
        }

        if (category === "other") {
            category = categoryOther.value.trim();
            if (!category) return;
        }

        budgetGoals[category] = amount;
        localStorage.setItem("budgetGoals", JSON.stringify(budgetGoals));
        displayBudgetGoals();

        // Clear input fields
        budgetCategoryInput.value = "select";
        document.getElementById("budget-amount").value = "";
        categoryOther.value = "";
        categoryOther.style.display = "none";

        // Reset validation state
        form.classList.remove('was-validated');
    }

    // Display budget goals
    function displayBudgetGoals() {
        budgetGoalsList.innerHTML = '';

        for (const [category, amount] of Object.entries(budgetGoals)) {
            const spent = expenseCategories[category] || 0;
            const remaining = amount - spent;
            const progress = (spent / amount) * 100;
            const progressColor = remaining < 0 ? 'danger' : progress > 90 ? 'warning' : 'success';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Category">${category}</td>
                <td data-label="Budget">${amount.toFixed(2)}</td>
                <td data-label="Spent">${spent.toFixed(2)}</td>
                <td data-label="Remaining">${remaining.toFixed(2)}</td>
                <td data-label="Progress" class="progress-cell">
                    <div class="progress">
                        <div class="progress-bar bg-${progressColor}" 
                             role="progressbar" 
                             style="width: ${Math.min(progress, 100)}%" 
                             aria-valuenow="${Math.min(progress, 100)}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${progress.toFixed(1)}%
                        </div>
                    </div>
                </td>
                <td data-label="Actions">
                    <button class="edit-goal btn btn-sm btn-primary" data-category="${category}">Edit</button>
                    <button class="delete-goal btn btn-sm btn-danger" data-category="${category}">Delete</button>
                </td>
            `;

            // Add event listeners
            row.querySelector(".edit-goal").addEventListener("click", handleEditGoal);
            row.querySelector(".delete-goal").addEventListener("click", handleDeleteGoal);

            budgetGoalsList.appendChild(row);
        }
    }

    // Event handler functions moved outside the loop
    function handleEditGoal(event) {
        const category = event.target.getAttribute("data-category");
        editBudgetGoal(category);
    }

    function handleDeleteGoal(event) {
        const category = event.target.getAttribute("data-category");
        deleteBudgetGoal(category);
    }

    // Edit budget goal
    function editBudgetGoal(category) {
        Swal.fire({
            title: 'Edit Budget Goal',
            html: `You're about to edit the budget goal for <strong>${category}</strong>.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Continue'
        }).then((result) => {
            if (result.isConfirmed) {
                const amount = budgetGoals[category];
                document.getElementById("budget-category").value = category;
                document.getElementById("budget-amount").value = amount;
                document.getElementById("budget-category-other").style.display =
                    category === "other" ? "block" : "none";

                document.getElementById("budget-goals").scrollIntoView({
                    behavior: "smooth"
                });

                Swal.fire(
                    'Ready to Edit!',
                    'You can now modify the budget goal details above.',
                    'info'
                );
            }
        });
    }

    // Delete budget goal
    function deleteBudgetGoal(category) {
        Swal.fire({
            title: 'Delete Budget Goal',
            html: `Are you sure you want to delete the budget goal for <strong>${category}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                delete budgetGoals[category];
                localStorage.setItem("budgetGoals", JSON.stringify(budgetGoals));
                displayBudgetGoals();

                Swal.fire(
                    'Deleted!',
                    `Budget goal for ${category} has been removed.`,
                    'success'
                );
            }
        });
    }

    // Add expenses to table
    function addExpenseToTable(category, amount, date, index) {
        const newRow = document.createElement("tr");
        const typeClass = amount > 0 ? "income" : "expense";

        newRow.classList.add(typeClass);
        newRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${date}</td>
            <td>
                <button class="edit-expense btn btn-sm btn-primary" data-index="${index}">Edit</button>
                <button class="delete-expense btn btn-sm btn-danger" data-index="${index}">Delete</button>
            </td>
        `;

        newRow.querySelector(".edit-expense").addEventListener("click", (event) => {
            const rowIndex = parseInt(event.target.getAttribute("data-index"), 10);
            editExpense(rowIndex);
        });

        newRow.querySelector(".delete-expense").addEventListener("click", (event) => {
            const rowIndex = parseInt(event.target.getAttribute("data-index"), 10);
            deleteExpense(rowIndex);
        });

        expenseTableBody.appendChild(newRow);
    }

    // Edit expense
    function editExpense(index) {
        Swal.fire({
            title: 'Edit Transaction',
            text: "You're about to edit this transaction. Continue?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, edit it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const {
                    category,
                    amount,
                    date
                } = expenseList[index];
                categoryInput.value = category;
                amountInput.value = Math.abs(amount);
                dateInput.value = date;
                typeInput.value = amount > 0 ? "income" : "expense";

                // Remove the expense from the list temporarily
                deleteExpense(index, false);

                document.getElementById("budget-form").scrollIntoView({
                    behavior: "smooth"
                });

                Swal.fire(
                    'Ready to Edit!',
                    'You can now modify the transaction details above.',
                    'info'
                );
            }
        });
    }

    // Delete expenses
    function deleteExpense(index, update = true) {
        if (expenseList[index]) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to delete this transaction?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const {
                        category,
                        amount
                    } = expenseList[index];

                    if (amount > 0) {
                        totalIncome -= amount;
                    } else {
                        totalExpenses -= Math.abs(amount);
                        expenseCategories[category] -= Math.abs(amount);

                        if (expenseCategories[category] <= 0) {
                            delete expenseCategories[category];
                        }
                    }

                    expenseList.splice(index, 1);
                    saveExpensesToLocalStorage();

                    if (update) {
                        renderExpenseTable();
                        updateCharts();
                        updateTotals();
                    }

                    Swal.fire(
                        'Deleted!',
                        'Your transaction has been deleted.',
                        'success'
                    );
                }
            });
        }
    }

    function renderExpenseTable() {
        expenseTableBody.innerHTML = "";
        expenseList.forEach((expense, i) => {
            addExpenseToTable(expense.category, expense.amount, expense.date, i);
        });
    }

    // Add data with form validation
    addDataButton.addEventListener("click", () => {
        const form = document.getElementById('budget-form');
        const categoryOther = document.getElementById('category-other');

        // Enable validation on category-other only when it's visible
        if (categoryInput.value === 'other') {
            categoryOther.setAttribute('required', '');
        } else {
            categoryOther.removeAttribute('required');
        }

        // Add Bootstrap validation classes
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            return; // Stop if form is invalid
        }

        let category = categoryInput.value;
        const otherInput = document.getElementById("category-other");

        if (category === "other") {
            category = otherInput.value.trim();
            if (!category) return;
        }

        const amount = parseFloat(amountInput.value) || 0;
        const type = typeInput.value;
        const date = dateInput.value;

        if (!category || !amount || !date) return;

        if (type === "expense") {
            // Calculate the new total after adding this expense
            const newTotal = (expenseCategories[category] || 0) + amount;

            // Check budget before adding expense
            if (budgetGoals[category]) {
                const budgetLimit = budgetGoals[category];

                if (newTotal > budgetLimit) {
                    Swal.fire({
                        title: 'Budget Exceeded!',
                        html: `
                            <div style="text-align: left;">
                                <p>Category: ${category}</p>
                                <p>Budget Limit: ${budgetLimit.toFixed(2)}</p>
                                <p>Current Spent: ${(expenseCategories[category] || 0).toFixed(2)}</p>
                                <p>This Expense: ${amount.toFixed(2)}</p>
                                <p>Will Exceed By: ${(newTotal - budgetLimit).toFixed(2)}</p>
                            </div>
                        `,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Add Anyway',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Add the expense if user confirms
                            addExpense(category, amount, date);
                        }
                    });
                    return; // Stop here and wait for user decision
                } else if (newTotal > budgetLimit * 0.9) { // Warning at 90% of budget
                    Swal.fire({
                        title: 'Budget Warning!',
                        html: `
                            <div style="text-align: left;">
                                <p>Category: ${category}</p>
                                <p>Budget Limit: ${budgetLimit.toFixed(2)}</p>
                                <p>Will Be Spent: ${newTotal.toFixed(2)}</p>
                                <p>Remaining After: ${(budgetLimit - newTotal).toFixed(2)}</p>
                            </div>
                        `,
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'Add Expense',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Add the expense if user confirms
                            addExpense(category, amount, date);
                        }
                    });
                    return; // Stop here and wait for user decision
                }
            }
            // If no budget or under 90%, add expense directly
            addExpense(category, amount, date);
        } else {
            // Handle income directly
            totalIncome += amount;
            expenseList.push({
                category,
                amount,
                date
            });
            addExpenseToTable(category, amount, date, expenseList.length - 1);
            updateData();
        }
    });

    // Add helper function to handle expense addition
    function addExpense(category, amount, date) {
        totalExpenses += amount;
        if (!expenseCategories[category]) {
            expenseCategories[category] = 0;
        }
        expenseCategories[category] += amount;
        expenseList.push({
            category,
            amount: -amount,
            date
        });

        addExpenseToTable(category, -amount, date, expenseList.length - 1);
        updateData();
    }

    // Add helper function to update everything
    function updateData() {
        updateCharts();
        updateTotals();
        saveExpensesToLocalStorage();
        displayBudgetGoals();

        // Clear form
        amountInput.value = "";
        dateInput.value = "";
        typeInput.value = "income";
        categoryInput.value = "select";
        document.getElementById("category-other").value = "";
        document.getElementById("category-other").style.display = "none";

        // Reset form validation state
        document.getElementById('budget-form').classList.remove('was-validated');
    }

    // Show/hide "Other" category input
    categoryInput.addEventListener("change", () => {
        const otherInput = document.getElementById("category-other");
        if (categoryInput.value === "other") {
            otherInput.style.display = "block";
        } else {
            otherInput.style.display = "none";
        }
    });

    // Save expenses to localStorage
    function saveExpensesToLocalStorage() {
        localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
        localStorage.setItem("expenseList", JSON.stringify(expenseList));
    }

    // Update savings with separate validation
    updateSavingsButton.addEventListener("click", () => {
        const savingsForm = document.getElementById('savings-form');
        const savingsGoalInput = document.getElementById("savingsGoal");

        // Add Bootstrap validation classes
        savingsForm.classList.add('was-validated');

        if (!savingsForm.checkValidity() || parseFloat(savingsGoalInput.value) <= 0) {
            return;
        }

        savingsGoal = parseFloat(savingsGoalInput.value);
        savingsGoalInput.value = "";
        savingsGoalText.innerText = `Savings Goal: ${savingsGoal.toFixed(2)}`;
        localStorage.setItem("savingsGoal", savingsGoal);
        updateTotals();

        // Reset validation state
        savingsForm.classList.remove('was-validated');
    });

    // Restore data
    resetButton.addEventListener("click", () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to reset all data?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                totalIncome = 0;
                totalExpenses = 0;
                savingsGoal = 0;
                expenseList.length = 0;
                Object.keys(expenseCategories).forEach((key) => delete expenseCategories[key]);
                Object.keys(budgetGoals).forEach((key) => delete budgetGoals[key]);

                localStorage.clear();
                renderExpenseTable();
                updateCharts();
                updateTotals();
                savingsGoalText.innerText = "Savings Goal: $0";
                savingsProgressText.innerText = "Savings Progress: 0%";
                displayBudgetGoals();

                Swal.fire(
                    'Reset Complete!',
                    'Your data has been reset successfully.',
                    'success'
                );
            }
        });
    });

    // Load stored data
    function loadStoredData() {
        expenseList.forEach(({
            category,
            amount,
            date
        }, index) => {
            addExpenseToTable(category, amount, date, index);
        });

        totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
        totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;

        updateCharts();
        updateTotals();
    }

    // Update charts
    function updateCharts() {
        const income = expenseList
            .filter(item => item.amount > 0)
            .reduce((sum, item) => sum + item.amount, 0);

        const expenses = expenseList
            .filter(item => item.amount < 0)
            .reduce((sum, item) => sum + Math.abs(item.amount), 0);

        updateBarChart(income, expenses);
        updatePieChart(expenseCategories);
    }

    function updatePieChart(categories) {
        const canvas = document.getElementById('pieChart');

        if (pieChartInstance) pieChartInstance.destroy();
        const ctx = canvas.getContext('2d');
        pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#F44336']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function updateBarChart(income, expenses) {
        const canvas = document.getElementById('barChart');

        if (barChartInstance) barChartInstance.destroy();
        const ctx = canvas.getContext('2d');
        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income & Expenses'],
                datasets: [{
                        label: 'Income',
                        data: [income],
                        backgroundColor: '#4CAF50'
                    },
                    {
                        label: 'Expenses',
                        data: [expenses],
                        backgroundColor: '#F44336'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Add event listener for saving budget goals
    saveBudgetButton.addEventListener("click", saveBudgetGoal);

    loadStoredData();
    updateTotals();
    displayBudgetGoals();
});

// Make togglePopup globally available since it's used in HTML
window.togglePopup = function (element) {
    const popupText = element.querySelector('.popuptext');
    popupText.classList.toggle('show');
};

// Fix missing myFunction reference used in HTML
window.myFunction = function () {
    // Using the same functionality as togglePopup for consistency
    const popupText = event.currentTarget.querySelector('.popuptext');
    popupText.classList.toggle('show');
};