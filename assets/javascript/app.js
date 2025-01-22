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

    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const dateInput = document.getElementById("date");
    const categoryInput = document.getElementById("category");
    const addDataButton = document.getElementById("add-data");
    const savingsGoalInput = document.getElementById("savingsGoal");
    const updateSavingsButton = document.getElementById("update-savings");
    const resetButton = document.getElementById("reset");
    const expenseTableBody = document.getElementById("expense-table").querySelector("tbody");
    const totalIncomeDisplay = document.getElementById("total-income");
    const totalExpensesDisplay = document.getElementById("total-expenses");
    const balanceDisplay = document.getElementById("balance");
    const savingsGoalText = document.getElementById("savings-goal-text");
    const savingsProgressText = document.getElementById("savings-progress-text");
    const budgetGoalsList = document.getElementById("budget-goals-list");
    const saveBudgetButton = document.getElementById("save-budget");

    let pieChartInstance, barChartInstance;

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

    // Save budget goal
    function saveBudgetGoal() {
        const category = document.getElementById("budget-category").value;
        const amount = parseFloat(document.getElementById("budget-amount").value) || 0;

        if (!category || amount <= 0) {
            alert("Please select a category and enter a valid amount.");
            return;
        }

        budgetGoals[category] = amount;
        localStorage.setItem("budgetGoals", JSON.stringify(budgetGoals));
        displayBudgetGoals();
        alert(`Budget goal for ${category} set to ${amount.toFixed(2)}.`);
    }

    // Display budget goals
    function displayBudgetGoals() {
        budgetGoalsList.innerHTML = ""; // Clear existing list

        for (const [category, amount] of Object.entries(budgetGoals)) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${category}: ${amount.toFixed(2)}
                <button class="edit-goal" data-category="${category}">Edit</button>
                <button class="delete-goal" data-category="${category}">Delete</button>
            `;

            listItem.querySelector(".edit-goal").addEventListener("click", (event) => {
                const category = event.target.getAttribute("data-category");
                editBudgetGoal(category);
            });

            listItem.querySelector(".delete-goal").addEventListener("click", (event) => {
                const category = event.target.getAttribute("data-category");
                deleteBudgetGoal(category);
            });

            budgetGoalsList.appendChild(listItem);
        }
    }

    // Edit budget goal
    function editBudgetGoal(category) {
        const amount = budgetGoals[category];
        document.getElementById("budget-category").value = category;
        document.getElementById("budget-amount").value = amount;
    }

    // Delete budget goal
    function deleteBudgetGoal(category) {
        if (confirm(`Are you sure you want to delete the budget goal for ${category}?`)) {
            delete budgetGoals[category];
            localStorage.setItem("budgetGoals", JSON.stringify(budgetGoals));
            displayBudgetGoals();
        }
    }

    // Add expenses to table
    function addExpenseToTable(category, amount, date, index) {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${date}</td>
            <td>
                <button class="edit-expense" data-index="${index}">Edit</button>
                <button class="delete-expense" data-index="${index}">Delete</button>
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
        const { category, amount, date } = expenseList[index];
        categoryInput.value = category;
        amountInput.value = Math.abs(amount);
        dateInput.value = date;
        typeInput.value = amount > 0 ? "income" : "expense";

        // Remove the expense from the list temporarily
        deleteExpense(index, false);
    }

    // Delete expenses
    function deleteExpense(index, update = true) {
        if (expenseList[index]) {
            const { category, amount } = expenseList[index];

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
        }
    }

    function renderExpenseTable() {
        expenseTableBody.innerHTML = "";
        expenseList.forEach((expense, i) => {
            addExpenseToTable(expense.category, expense.amount, expense.date, i);
        });
    }

    // Add data
    addDataButton.addEventListener("click", () => {
        let category = categoryInput.value;
        const otherInput = document.getElementById("category-other");

        if (category === "other") {
            category = otherInput.value.trim();
            if (!category) {
                alert("Please enter a category.");
                return;
            }
        }

        const amount = parseFloat(amountInput.value) || 0;
        const type = typeInput.value;
        const date = dateInput.value;

        if (!category || !amount || !date) {
            alert("Please fill in all fields.");
            return;
        }

        if (type === "income") {
            totalIncome += amount;
            expenseList.push({ category, amount, date });
        } else if (type === "expense") {
            totalExpenses += amount;
            if (!expenseCategories[category]) {
                expenseCategories[category] = 0;
            }
            expenseCategories[category] += amount;
            expenseList.push({ category, amount: -amount, date });
        }

        addExpenseToTable(category, type === "income" ? amount : -amount, date, expenseList.length - 1);
        updateCharts();
        updateTotals();
        saveExpensesToLocalStorage();

        if (type === "expense" && budgetGoals[category]) {
            const spent = expenseCategories[category] || 0;
            const remainingBudget = budgetGoals[category] - spent - amount;

            if (remainingBudget < 0) {
                alert(`Warning: You have exceeded your budget goal for ${category} by ${Math.abs(remainingBudget).toFixed(2)}!`);
            }
        }

        amountInput.value = "";
        dateInput.value = "";
        typeInput.value = "income";
        categoryInput.value = "select";
        otherInput.value = "";
        otherInput.style.display = "none";
    });

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

    // Update savings
    updateSavingsButton.addEventListener("click", () => {
        savingsGoal = parseFloat(savingsGoalInput.value) || 0;

        if (savingsGoal <= 0) {
            alert("Please enter a valid savings goal.");
            return;
        }

        savingsGoalInput.value = "";
        savingsGoalText.innerText = `Savings Goal: $${savingsGoal.toFixed(2)}`;
        localStorage.setItem("savingsGoal", savingsGoal);
        updateTotals();
    });

    // Restore data
    resetButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all data?")) {
            totalIncome = 0;
            totalExpenses = 0;
            savingsGoal = 0;
            expenseList.length = 0;
            Object.keys(expenseCategories).forEach((key) => delete expenseCategories[key]);

            localStorage.clear();
            renderExpenseTable();
            updateCharts();
            updateTotals();
            savingsGoalText.innerText = "Savings Goal: $0";
            savingsProgressText.innerText = "Savings Progress: 0%";
        }
    });

    // Load stored data
    function loadStoredData() {
        expenseList.forEach(({ category, amount, date }, index) => {
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
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Income and Expenses',
                    data: [income, expenses],
                    backgroundColor: ['#4CAF50', '#F44336']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Add event listener for saving budget goals
    saveBudgetButton.addEventListener("click", saveBudgetGoal);

    loadStoredData();
    updateTotals();
    displayBudgetGoals();
});
