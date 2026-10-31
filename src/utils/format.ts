export const formatINR = (val?: number | null): string => {
  if (typeof val !== 'number' || isNaN(val)) {
    return '0';
  }
  return val.toLocaleString('en-IN');
};
