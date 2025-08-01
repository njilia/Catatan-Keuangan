const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const balanceEl = document.getElementById('balance');
const tableBody = document.querySelector('#data-table tbody');
const form = document.getElementById('form-entry');

let entries = JSON.parse(localStorage.getItem('entries')) || [];
let chart;

function saveData() {
  localStorage.setItem('entries', JSON.stringify(entries));
}

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(num);
}

function updateSummary() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  entries.forEach(e => {
    incomeTotal += e.income;
    expenseTotal += e.expense;
  });

  incomeEl.textContent = formatRupiah(incomeTotal);
  expenseEl.textContent = formatRupiah(expenseTotal);
  balanceEl.textContent = formatRupiah(incomeTotal - expenseTotal);
}

function renderTable() {
  tableBody.innerHTML = '';
  entries.forEach((e, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${e.date}</td>
      <td>${e.income ? formatRupiah(e.income) : '-'}</td>
      <td>${e.expense ? formatRupiah(e.expense) : '-'}</td>
      <td>${e.category || '-'}</td>
      <td><button onclick="deleteEntry(${i})">🗑️</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function renderChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  const categoryTotals = {};

  entries.forEach(e => {
    if (e.expense && e.category) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.expense;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = labels.map(() =>
    '#' + Math.floor(Math.random() * 16777215).toString(16)
  );

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pengeluaran per Kategori',
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Pengeluaran Berdasarkan Kategori'
        }
      }
    }
  });
}


function deleteEntry(index) {
  entries.splice(index, 1);
  saveData();
  refresh();
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const income = parseInt(document.getElementById('income-amount').value) || 0;
  const expense = parseInt(document.getElementById('expense-amount').value) || 0;
  const category = document.getElementById('expense-category').value.trim();

  if (!date || (income === 0 && expense === 0)) return;

  entries.push({ date, income, expense, category });
  saveData();
  form.reset();
  refresh();
});

function refresh() {
  updateSummary();
  renderTable();
  renderChart();
}

refresh();
