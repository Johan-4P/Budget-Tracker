let totalIncome = 0;
let totalExpenses = 0;

// Elements from the DOM
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const addDataButton = document.getElementById("add-data");
const savingsGoal = document.getElementById("savingsGoal");
const currencySelect = document.getElementById("currency-select");

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

// Update chart function
function updateChart() {
    incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
    incomeExpenseChart.update();
}
function updateTotals() {
    const balance = totalIncome - totalExpenses;

    document.getElementById("income").innerText = `Total Income: ${totalIncome.toFixed(2)}`;
    document.getElementById("expense").innerText = `Total Expenses: ${totalExpenses.toFixed(2)}`;
    document.getElementById("balance").innerText = `Balance: ${balance.toFixed(2)}`;

    if (savingsGoal > 0) {
        const progress = (balance / savingsGoal) * 100;
        document.getElementById("savings").innerText = `Savings Progress: ${progress.toFixed(2)}`;
    }
}