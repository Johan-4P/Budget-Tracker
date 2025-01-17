let totalIncome = 0;
let totalExpenses = 0;
let savingsGoalValue = 0;

// Elements from the DOM
const incomeInput = document.getElementById("income");
const expenseInput = document.getElementById("expense");
const addDataButton = document.getElementById("add-data");
const savingsGoalInput = document.getElementById("savingsGoal");
const currencySelect = document.getElementById("currency-select");

// Elements for totals display
const totalIncomeDisplay = document.getElementById("total-income");
const totalExpensesDisplay = document.getElementById("total-expenses");
const balanceDisplay = document.getElementById("balance");
const savingsProgressDisplay = document.getElementById("savings-progress");

// Charts
const ctx = document.getElementById("incomeExpenseChart").getContext("2d");
const incomeExpenseChart = new Chart(ctx, {
    type: "pie",
    data: {
        labels: ["Income", "Expense"],
        datasets: [{
            data: [0, 0],
            backgroundColor: ["#28a745", "#dc3545"],
        }]
    },
});

    // Bar Chart for Expense Categories
    const barCtx = document.getElementById("expenseBarChart").getContext("2d");
    const expenseBarChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: Object.keys(expenseCategories),
            datasets: [
                {
                    label: "Expenses by Category",
                    data: Object.values(expenseCategories),
                    backgroundColor: ["#007bff", "#ffc107", "#17a2b8", "#6c757d"],
                },
            ],
        },
    });

// Update chart function
function updateChart() {
    incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
    incomeExpenseChart.update();
}
        // Update Bar Chart
        expenseBarChart.data.datasets[0].data = Object.values(expenseCategories);
        expenseBarChart.update();


function updateTotals() {
    const balance = totalIncome - totalExpenses;

    totalIncomeDisplay.innerText = `Total Income: ${totalIncome.toFixed(2)}`;
    totalExpensesDisplay.innerText = `Total Expenses: ${totalExpenses.toFixed(2)}`;
    balanceDisplay.innerText = `Balance: ${balance.toFixed(2)}`;

    if (savingsGoalValue > 0) {
        const progress = (balance / savingsGoalValue) * 100;
        savingsProgressDisplay.innerText = `Savings Progress: ${progress.toFixed(2)}`;
    }
}

// Event listener for adding data

addDataButton.addEventListener("click", () => {
    const income = parseFloat(incomeInput.value) || 0;
    const expense = parseFloat(expenseInput.value) || 0;
    const category = categorySelect.value;

    totalIncome += income;
    totalExpenses += expense 

    if (expense > 0) {
        expenseCategories[category] += expense;
    }

    updateChart();
    updateTotals();

    // Clear inputs
    incomeInput.value = "";
    expenseInput.value = "";
});

// Event listener for savings goal
document.getElementById("savingsGoal").addEventListener("click", () => {
    savingsGoalValue = parseFloat(savingsGoalInput.value) || 0;
    updateTotals();
});