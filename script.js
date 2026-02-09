async function loadBanks() {
  const res = await fetch('./banks.json');
  const banks = await res.json();

  const row = document.getElementById('banksRow');
  if (!row) return;

  row.innerHTML = banks.map(bank => `
    <div class="bank-item" title="${bank.name}">
      <img src="${bank.logo}" alt="${bank.name}" loading="lazy" />
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadCars();
  loadBanks();
});


