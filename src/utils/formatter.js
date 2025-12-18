// File ini mungkin belum ada, Anda bisa membuatnya sebagai contoh
function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

module.exports = { formatCurrency };
