export const UNITS = {
  g: { category: 'weight', rate: 1, standard: 'g' },
  kg: { category: 'weight', rate: 1000, standard: 'g' },
  mL: { category: 'liquid', rate: 1, standard: 'mL' },
  L: { category: 'liquid', rate: 1000, standard: 'mL' },
  unit: { category: 'count', rate: 1, standard: 'unit' }
};

/**
 * Converts a value from one unit to another.
 * Throws an error if units belong to different categories.
 */
export function convert(value, fromUnit, toUnit) {
  const fromInfo = UNITS[fromUnit];
  const toInfo = UNITS[toUnit];

  if (!fromInfo) {
    throw new Error(`Invalid source unit: ${fromUnit}`);
  }
  if (!toInfo) {
    throw new Error(`Invalid target unit: ${toUnit}`);
  }
  if (fromInfo.category !== toInfo.category) {
    throw new Error(`Invalid conversion: cannot convert from ${fromInfo.category} (${fromUnit}) to ${toInfo.category} (${toUnit})`);
  }

  // Convert to standard base unit first
  const valueInBase = value * fromInfo.rate;
  // Convert from standard base unit to target unit
  return valueInBase / toInfo.rate;
}

/**
 * Normalizes product inputs to internal standard units (g, mL, unit).
 */
export function normalizeProduct(baseUnit, pricePerUnit, stockQuantity = 0) {
  const unitInfo = UNITS[baseUnit];
  if (!unitInfo) {
    throw new Error(`Unsupported base unit: ${baseUnit}`);
  }

  const standardUnit = unitInfo.standard;
  const rate = unitInfo.rate;

  return {
    baseUnit: standardUnit,
    pricePerUnit: pricePerUnit / rate,
    stockQuantity: stockQuantity * rate
  };
}
