document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    const expenseCategories = {};

    // Correctly selecting elements
    const categoryInput = document.getElementById("category");
    const incomeInput = document.getElementById("income");
    const expenseInput = document.getElementById("expense");
    const dateInput = document.getElementById("date");
    const addDataButton = document.getElementById("add-data");

    const totalIncomeDisplay = document.getElementById("total-income");
    const totalExpensesDisplay = document.getElementById("total-expenses");
    const balanceDisplay = document.getElementById("balance");

    // Pie Chart for Income vs. Expenses
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

    // Bar Chart for Expense Categories
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
    }

    // Event Listener for Adding Data
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

        updateCharts();
        updateTotals();

        categoryInput.value = "";
        incomeInput.value = "";
        expenseInput.value = "";
        dateInput.value = "";
    });
});
