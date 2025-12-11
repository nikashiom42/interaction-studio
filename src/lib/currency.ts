// Georgia-focused currency formatting
export const CURRENCY_SYMBOL = '₾';
export const CURRENCY_CODE = 'GEL';

export const formatPrice = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
};

export const formatPriceWithUnit = (amount: number, unit: string): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}/${unit}`;
};
