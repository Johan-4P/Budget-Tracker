document.addEventListener("DOMContentLoaded", () => {
    let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    const expenseList = JSON.parse(localStorage.getItem("expenseList")) || [];
    const expenseCategories = (() => {
        try {
            return JSON.parse(localStorage.getItem("expenseCategories")) || {};
        } catch {
            return {};
        }
    })();

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

    let pieChartInstance, barChartInstance;

    // Update totals
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

    // Save expenses to localStorage
    function saveExpensesToLocalStorage() {
        localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
        localStorage.setItem("expenseList", JSON.stringify(expenseList));
    }

    // Add expenses to table
    function addExpenseToTable(category, amount, date) {
        const newRow = document.createElement("tr");
        const index = expenseList.length - 1;

        newRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${date}</td>
            <td><button class="delete-expense" data-index="${index}">Delete</button></td>
        `;

        newRow.querySelector(".delete-expense").addEventListener("click", (event) => {
            const rowIndex = parseInt(event.target.getAttribute("data-index"), 10);
            deleteExpense(rowIndex);
        });

        expenseTableBody.appendChild(newRow);
    }

    // Delete expenses
    function deleteExpense(index) {
        const { category, amount } = expenseList[index];
        totalExpenses -= Math.abs(amount);
        expenseCategories[category] -= Math.abs(amount);

        if (expenseCategories[category] <= 0) {
            delete expenseCategories[category];
        }

        expenseList.splice(index, 1);
        saveExpensesToLocalStorage();

        renderExpenseTable();
        updateCharts();
        updateTotals();
    }

    function renderExpenseTable() {
        expenseTableBody.innerHTML = "";
        expenseList.forEach((expense, i) => {
            addExpenseToTable(expense.category, expense.amount, expense.date);
            const lastRow = expenseTableBody.lastElementChild;
            lastRow.querySelector(".delete-expense").setAttribute("data-index", i);
        });
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
    

// Load stored data
function loadStoredData() {
    expenseList.forEach(({ category, amount, date }) => {
        addExpenseToTable(category, amount, date);
        if (amount > 0) totalIncome += amount;
        else totalExpenses += Math.abs(amount);
    });
    updateCharts(); // Ensure charts are updated after loading data
}

// Add data
addDataButton.addEventListener("click", () => {
    const category = categoryInput.value.trim();
    const income = parseFloat(incomeInput.value) || 0;
    const expense = parseFloat(expenseInput.value) || 0;
    const date = dateInput.value;

    if (!category || (!income && !expense) || !date) {
        alert("Please fill in all fields.");
        return;
    }

    if (income > 0) {
        totalIncome += income;
        expenseList.push({ category, amount: income, date }); 
    } else if (expense > 0) {
        totalExpenses += expense;
        if (!expenseCategories[category]) {
            expenseCategories[category] = 0;
        }
        expenseCategories[category] += expense;
        expenseList.push({ category, amount: -expense, date });
    } else {
        alert("Please enter a valid income or expense.");
        return;
    }

    addExpenseToTable(category, income > 0 ? income : -expense, date);
    updateCharts();
    updateTotals();
    saveExpensesToLocalStorage();

    categoryInput.value = "";
    incomeInput.value = "";
    expenseInput.value = "";
    dateInput.value = "";
});


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

    loadStoredData();
    updateTotals();
    updateCharts(); // Ensure charts are updated after DOM content is loaded
});
