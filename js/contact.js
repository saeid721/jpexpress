(() => {
  const form = document.getElementById('contactPageForm');
  const success = document.getElementById('contactSuccess');
  if (!form || !success) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      form.querySelector(':invalid').focus();
      return;
    }
    success.classList.add('visible');
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();
