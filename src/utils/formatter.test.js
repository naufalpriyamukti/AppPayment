// Buat file ini untuk menguji formatter.js
const { formatCurrency } = require('./formatter');

describe('Currency Formatter', () => {
  test('should format a number into IDR currency format', () => {
    // Harapannya, 50000 menjadi 'Rp 50.000'
    expect(formatCurrency(50000)).toBe('Rp\u00A050.000'); // \u00A0 adalah non-breaking space
  });

  test('should handle zero correctly', () => {
    expect(formatCurrency(0)).toBe('Rp\u00A00');
  });

  test('should throw an error if input is not a number', () => {
    // Harapannya, fungsi akan melempar error jika inputnya string
    expect(() => {
      formatCurrency('bukan angka');
    }).toThrow('Amount must be a number');
  });
});
