document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let savingsGoal = 0;

    // Expense Categories
    const expenseCategories = {};
    const expenseList = [];

    // Elements
    const categoryInput = document.getElementById("category");
    const incomeInput = document.getElementById("income");
    const expenseInput = document.getElementById("expense");
    const dateInput = document.getElementById("date");
    const addDataButton = document.getElementById("add-data");
    const savingsGoalInput = document.getElementById("savingsGoal");
    const updateSavingsButton = document.getElementById("update-savings");
    const expenseTableBody = document.getElementById("expense-table").querySelector("tbody")

    const totalIncomeDisplay = document.getElementById("total-income");
    const totalExpensesDisplay = document.getElementById("total-expenses");
    const balanceDisplay = document.getElementById("balance");
    const savingsGoalText = document.getElementById("savings-goal-text");
    const savingsProgressText = document.getElementById("savings-progress-text");

    // Pie Chart
    const pieCtx = document.getElementById("incomeExpenseChart").getContext("2d");
    const incomeExpenseChart = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: ["#28a745", "#dc3545"],
                },
            ],
        },
    });

    // Bar Chart
    const barCtx = document.getElementById("expenseBarChart").getContext("2d");
    const expenseBarChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Expenses by Category",
                    data: [],
                    backgroundColor: ["#007bff", "#ffc107", "#17a2b8", "#6c757d"],
                },
            ],
        },
    });

    // Update Charts
    function updateCharts() {
        incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
        incomeExpenseChart.update();

        expenseBarChart.data.labels = Object.keys(expenseCategories);
        expenseBarChart.data.datasets[0].data = Object.values(expenseCategories);
        expenseBarChart.update();
    }

    // Update Totals
    function updateTotals() {
        const balance = totalIncome - totalExpenses;

        totalIncomeDisplay.innerText = `Total Income: ${totalIncome.toFixed(2)}`;
        totalExpensesDisplay.innerText = `Total Expenses: ${totalExpenses.toFixed(2)}`;
        balanceDisplay.innerText = `Balance: ${balance.toFixed(2)}`;

        // Update Savings Progress
        if (savingsGoal > 0) {
            const progress = (balance / savingsGoal) * 100;
            savingsProgressText.innerText = `Savings Progress: ${progress.toFixed(2)}%`;
        } else {
            savingsProgressText.innerText = "Savings Progress: 0%";
        }
    }

    // Add Expense to table
    function addExpenseToTable(category, amount, date) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
        <td>${category}</td>
        <td>${amount.toFixed(2)}</td>
        <td>${date}</td>
        `;
        expenseTableBody.prepend(newRow);
        expenseTableBody.appendChild(newRow)
    }

    // Event Listener: Add Data
    addDataButton.addEventListener("click", () => {
        const category = categoryInput.value.trim();
        const income = parseFloat(incomeInput.value) || 0;
        const expense = parseFloat(expenseInput.value) || 0;
        const date = dateInput.value;

        if (!category || (!income && !expense) || !date) {
            alert("Please fill in all fields.");
            return;
        }

        totalIncome += income;
        totalExpenses += expense;

        if (expense > 0) {
            if (!expenseCategories[category]) {
                expenseCategories[category] = 0;
            }
            expenseCategories[category] += expense;
        }

        addExpenseToTable(category, expense, date);
        updateCharts();
        updateTotals();

        // Clear inputs
        categoryInput.value = "";
        incomeInput.value = "";
        expenseInput.value = "";
        dateInput.value = "";
    });

    // Event Listener: Update Savings Goal
    updateSavingsButton.addEventListener("click", () => {
        savingsGoal = parseFloat(savingsGoalInput.value) || 0;

        if (savingsGoal <= 0) {
            alert("Please enter a valid savings goal.");
            return;
        }

        savingsGoalText.innerText = `Savings Goal: $${savingsGoal.toFixed(2)}`;
        updateTotals();
    });
});
