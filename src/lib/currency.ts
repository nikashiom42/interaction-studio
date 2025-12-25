// Euro currency formatting
export const CURRENCY_SYMBOL = '€';
export const CURRENCY_CODE = 'EUR';

export const formatPrice = (amount: number): string => {
  return `€${amount.toLocaleString('en-EU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatPriceWithUnit = (amount: number, unit: string): string => {
  return `€${amount.toLocaleString('en-EU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/${unit}`;
};
