const inputField = document.getElementById('input-temp');
const fromUnitField = document.getElementById('input-unit');
const toUnitField = document.getElementById('output-unit');
const outputField = document.getElementById('output-temp');
const form = document.getElementById('converter');
const swapBtn = document.getElementById('swap-btn');

function convertTemp(value, fromUnit, toUnit) {
  if (fromUnit === 'c') {
    if (toUnit === 'f') return value * 9 / 5 + 32;
    if (toUnit === 'k') return value + 273.15;
    return value;
  }
  if (fromUnit === 'f') {
    if (toUnit === 'c') return (value - 32) * 5 / 9;
    if (toUnit === 'k') return (value + 459.67) * 5 / 9;
    return value;
  }
  if (fromUnit === 'k') {
    if (toUnit === 'c') return value - 273.15;
    if (toUnit === 'f') return value * 9 / 5 - 459.67;
    return value;
  }
  throw new Error('Invalid unit');
}

function getUnitSymbol(unit) {
  const symbols = { c: '°C', f: '°F', k: 'K' };
  return symbols[unit] || '';
}

function updateConversion() {
  const inputTemp = parseFloat(inputField.value);
  if (isNaN(inputTemp)) {
    outputField.textContent = '-- ' + getUnitSymbol(toUnitField.value);
    return;
  }

  const fromUnit = fromUnitField.value;
  const toUnit = toUnitField.value;
  const outputTemp = convertTemp(inputTemp, fromUnit, toUnit);
  outputField.textContent = (Math.round(outputTemp * 100) / 100) + ' ' + getUnitSymbol(toUnit);
}

form.addEventListener('input', updateConversion);

swapBtn.addEventListener('click', () => {
  const temp = fromUnitField.value;
  fromUnitField.value = toUnitField.value;
  toUnitField.value = temp;
  updateConversion();
});

// Initial conversion
updateConversion();