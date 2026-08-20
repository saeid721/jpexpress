(function () {
  const tabs = document.querySelectorAll('.tool-tab');
  const panes = document.querySelectorAll('.tool-pane');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.toggle('active', item === tab));
    panes.forEach(pane => pane.classList.toggle('active', pane.id === tab.dataset.tool + 'Tool'));
  }));

  const rates = {
    usa: { courier: [25, 9.5, '3-5 days'], air: [45, 6.8, '5-10 days'], sea: [65, 1.6, '25-40 days'] },
    uk: { courier: [20, 8, '3-5 days'], air: [40, 6, '5-9 days'], sea: [60, 1.5, '25-38 days'] },
    canada: { courier: [28, 10, '4-6 days'], air: [48, 7, '6-10 days'], sea: [68, 1.7, '28-42 days'] },
    australia: { courier: [30, 11, '5-7 days'], air: [52, 7.5, '7-12 days'], sea: [72, 1.8, '30-45 days'] },
    germany: { courier: [22, 8.5, '3-5 days'], air: [42, 6.2, '5-9 days'], sea: [62, 1.5, '25-38 days'] },
    uae: { courier: [15, 6.5, '2-3 days'], air: [34, 5.5, '3-7 days'], sea: [54, 1.3, '18-28 days'] },
    japan: { courier: [24, 9, '3-5 days'], air: [44, 6.5, '5-9 days'], sea: [64, 1.6, '25-40 days'] },
    singapore: { courier: [17, 7, '2-4 days'], air: [36, 5.8, '4-8 days'], sea: [56, 1.4, '18-30 days'] }
  };
  const rateForm = document.getElementById('pricingRateForm');
  rateForm.addEventListener('submit', event => {
    event.preventDefault();
    const destination = document.getElementById('priceDestination').value;
    const method = document.getElementById('priceMethod').value;
    const weight = Math.max(parseFloat(document.getElementById('priceWeight').value) || 0.5, 0.5);
    const selected = rates[destination][method];
    const low = Math.round(selected[0] + weight * selected[1]);
    const high = Math.round(low * 1.18);
    document.getElementById('rateResult').innerHTML = '<span class="result-accent">INDICATIVE ESTIMATE</span><br><strong>$' + low + ' - $' + high + ' USD</strong> &nbsp; | &nbsp; ' + selected[2] + '<br>Based on ' + weight.toFixed(1) + ' kg chargeable weight. Final rate is confirmed after shipment review.';
  });
  document.getElementById('transitForm').addEventListener('submit', event => {
    event.preventDefault();
    const service = document.getElementById('transitService').value;
    const windows = { 'International Courier': '3-7 business days', 'Air Freight': '5-12 business days', 'Sea Freight': '18-45 business days' };
    document.getElementById('transitResult').innerHTML = '<span class="result-accent">USUAL DELIVERY WINDOW</span><br><strong>' + windows[service] + '</strong><br>Customs clearance, remote areas and peak seasons may affect transit time.';
  });
  document.getElementById('volumeForm').addEventListener('submit', event => {
    event.preventDefault();
    const length = parseFloat(document.getElementById('boxLength').value) || 0;
    const width = parseFloat(document.getElementById('boxWidth').value) || 0;
    const height = parseFloat(document.getElementById('boxHeight').value) || 0;
    const volume = (length * width * height) / 5000;
    document.getElementById('volumeResult').innerHTML = '<span class="result-accent">VOLUMETRIC WEIGHT</span><br><strong>' + volume.toFixed(2) + ' kg</strong><br>Formula: ' + length + ' x ' + width + ' x ' + height + ' / 5000.';
  });
})();
