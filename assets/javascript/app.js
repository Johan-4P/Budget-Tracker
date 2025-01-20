document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    const expenseList = JSON.parse(localStorage.getItem("expenseList")) || [];
    const categoryInput = document.getElementById("category");
    const incomeInput = document.getElementById("income");
    const expenseInput = document.getElementById("expense");
    const dateInput = document.getElementById("date");
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

    const pieCtx = document.getElementById("incomeExpenseChart").getContext("2d");
    const incomeExpenseChart = new Chart(pieCtx, {
        type: "pie",
        data: { labels: ["Income", "Expenses"], datasets: [{ data: [0, 0], backgroundColor: ["#28a745", "#dc3545"] }] },
    });

    const barCtx = document.getElementById("expenseBarChart").getContext("2d");
    const expenseBarChart = new Chart(barCtx, {
        type: "bar",
        data: { labels: [], datasets: [{ label: "Expenses by Category", data: [], backgroundColor: ["#007bff", "#ffc107", "#17a2b8", "#6c757d"] }] },
    });

    function updateCharts() {
        incomeExpenseChart.data.datasets[0].data = [totalIncome, totalExpenses];
        incomeExpenseChart.update();

        expenseBarChart.data.labels = Object.keys(expenseCategories);
        expenseBarChart.data.datasets[0].data = Object.values(expenseCategories);
        expenseBarChart.update();
    }

    function updateTotals() {
        const balance = totalIncome - totalExpenses;
    
        totalIncomeDisplay.innerText = `Total Income: ${totalIncome.toFixed(2)}`;
        totalExpensesDisplay.innerText = `Total Expenses: ${totalExpenses.toFixed(2)}`;
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

    function saveExpensesToLocalStorage() {
        localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
        localStorage.setItem("expenseList", JSON.stringify(expenseList));
    }

    function addExpenseToTable(category, amount, date) {
        const newRow = document.createElement("tr");
        const index = expenseList.length - 1;

        newRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${date}</td>
            <td><button class="delete-expense" data-index="${index}">Delete</button></td>
        `;

        newRow.querySelector(".delete-expense").addEventListener("click", () => {
            deleteExpense(index);
        });

        expenseTableBody.appendChild(newRow);
    }

    function deleteExpense(index) {
        const { category, amount } = expenseList[index];
        totalExpenses -= amount;
        expenseCategories[category] -= amount;

        if (expenseCategories[category] <= 0) {
            delete expenseCategories[category];
        }

        expenseList.splice(index, 1);
        saveExpensesToLocalStorage();

        expenseTableBody.innerHTML = "";
        expenseList.forEach((expense, i) => {
            addExpenseToTable(expense.category, expense.amount, expense.date);
            const lastRow = expenseTableBody.lastElementChild;
            lastRow.querySelector(".delete-expense").setAttribute("data-index", i);
        });

        updateCharts();
        updateTotals();
    }

    function loadStoredData() {
        expenseList.forEach(({ category, amount, date }) => {
            addExpenseToTable(category, amount, date);
        });
    }

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

            expenseList.push({ category, amount: expense, date });
            addExpenseToTable(category, expense, date);
        }

        updateCharts();
        updateTotals();
        saveExpensesToLocalStorage();

        categoryInput.value = "";
        incomeInput.value = "";
        expenseInput.value = "";
        dateInput.value = "";
    });

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

    const expenseCategories = (() => {
        try {
            return JSON.parse(localStorage.getItem("expenseCategories")) || {};
        } catch {
            return {};
        }
    })();

    loadStoredData();
});
