async function loadCars() {
  const res = await fetch('./cars.json');
  const cars = await res.json();

  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  grid.innerHTML = cars.map(car => `
    <div class="car-card">
      <div class="car-img" style="background-image:url('${car.image}')">
        <span class="badge">${car.tag}</span>
      </div>

      <div class="car-body">
        <h3>${car.title}</h3>

        <div class="car-meta">
          <span>${car.mileage}</span>
          <span>${car.spec}</span>
          <span>${car.location}</span>
        </div>

        <div class="car-price">${car.price}</div>

        <div class="car-actions">
          <a class="btn primary" href="valuation.html">Apply Finance</a>
          <a class="btn outline" target="_blank"
            href="https://wa.me/971544417665?text=${encodeURIComponent(`Hi CARFIN, I want this car: ${car.title}`)}">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadBanks() {
  const res = await fetch('./banks.json');
  const banks = await res.json();

  const row = document.getElementById('banksRow');
  if (!row) return;

  row.innerHTML = banks.map(b => `
    <span class="bank-badge">${b.name}</span>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadCars();
  loadBanks();
});
