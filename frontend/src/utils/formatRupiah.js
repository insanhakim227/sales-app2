export function formatRupiah(value) {
  if (value === null || value === undefined) return 'Rp 0';
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return String(value);
  return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(number));
}

export default formatRupiah;
