document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    // Expense Categories
    const expenseCategories = JSON.parse(localStorage.getItem("expenseCategories")) || {};
    const expenseList = JSON.parse(localStorage.getItem("expenseList")) || [];

    // Elements
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
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

    // Load stored totals
    //totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    //totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    //savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    // Pie Chart
    const pieCtx = document.getElementById("incomeExpenseChart").getContext("2d");
    const incomeExpenseChart = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                data: [0, 0],
                backgroundColor: ["#28a745", "#dc3545"],
            }, ],
        },
    });

    // Bar Chart
    const barCtx = document.getElementById("expenseBarChart").getContext("2d");
    const expenseBarChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Expenses by Category",
                data: [],
                backgroundColor: ["#007bff", "#ffc107", "#17a2b8", "#6c757d"],
            }, ],
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


        // Save totals to localstorage
        localStorage.setItem("totalIncome", totalIncome);
        localStorage.setItem("totalExpenses", totalExpenses);
    }

    // Save Expense list to localstorage
    function saveExpensesToLocalStorage() {
        localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
        localStorage.setItem("expenseList", JSON.stringify(expenseList));
    }

// Add Expense to Table
function addExpenseToTable(category, amount, date) {
    const newRow = document.createElement("tr"); // Declare `newRow` here, inside the function.
    newRow.innerHTML = `
        <td>${category}</td>
        <td>${amount.toFixed(2)}</td>
        <td>${date}</td>
        <td><button class="delete-expense">Delete</button></td>
    `;

    // Add delete functionality
    newRow.querySelector(".delete-expense").addEventListener("click", () => {
        totalExpenses -= amount; // Subtract expense from total
        if (expenseCategories[category]) {
            expenseCategories[category] -= amount;
            if (expenseCategories[category] <= 0) {
                delete expenseCategories[category];
            }
        }
        newRow.remove(); // Remove the row from the table
        updateCharts();
        updateTotals();
    });

    expenseTableBody.appendChild(newRow); // Append the row to the table body
}


    // Load data on page load
    function loadStoredData() {
        // Load expenses into the table
        expenseList.forEach(({
            category,
            amount,
            date
        }) => {
            addExpenseToTable(category, amount, date);
        });
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

            expenseList.push({
                category,
                amount: expense,
                date
            });
            addExpenseToTable(category, expense, date);
        }

        updateCharts();
        updateTotals();
        saveExpensesToLocalStorage();

        // Clear inputs
        categoryInput.value = "";
        incomeInput.value = "";
        expenseInput.value = "";
        dateInput.value = "";
    });

    // Event listener: Delete expense
    expenseTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-expense")) {
            const index = parseInt(e.target.getAttribute("data-index"));
            const {
                category,
                amount
            } = expenseList[index];

            // Update totals and remove from categories
            totalExpenses -= amount;
            expenseCategories[category] -= amount;

            if (expenseCategories[category] <= 0) {
                delete expenseCategories[category];
            }
            // Remove expense and update UI
            expenseList.splice(index, 1);
            saveExpensesToLocalStorage();

            expenseTableBody.innerHTML = "";
            expenseList.forEach(addExpenseToTable);
            updateCharts();
            updateTotals();
        }
    });

    // Event Listener: Update Savings Goal
    updateSavingsButton.addEventListener("click", () => {
        savingsGoal = parseFloat(savingsGoalInput.value) || 0;

        if (savingsGoal <= 0) {
            alert("Please enter a valid savings goal.");
            return;
        }

        savingsGoalText.innerText = `Savings Goal: $${savingsGoal.toFixed(2)}`;
        localStorage.setItem("savingsGoal", savingsGoal);
        updateTotals();
    });

    // Event listener: Reset data
    resetButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all data?")) {
            totalIncome = 0;
            totalExpenses = 0;
            savingsGoal = 0;
            expenseList.length = 0;
            Object.keys(expenseCategories).forEach((key) => delete expenseCategories[key]);

            localStorage.clear();
            expenseTableBody.innerHTML = "";
            updateCharts();
            updateTotals();
            savingsGoalText.innerText = "Savings Goal: $0";
            savingsProgressText.innerText = "Savings Progress: 0%";
        }
    });

    // Initialize app
    loadStoredData();
});