export function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getUnitLabel(unitType) {
  const map = {
    UNIT: 'unidad',
    KG: 'kg',
    BUNDLE: 'atado',
  };

  return map[unitType] || unitType;
}
