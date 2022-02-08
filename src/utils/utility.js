export const compactNumber = (value) => {
  const suffixes = ['', 'k', 'm', 'b', 't'];

  const suffixNum = Math.floor(('' + value).length / 4);

  let shortValue = parseFloat(
    (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(
      3,
    ),
  );
  if (shortValue % 1 !== 0) {
    shortValue = shortValue.toFixed(2);
  }

  return shortValue + suffixes[suffixNum];
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export function formatRupiah(number) {
  if (isNaN(parseInt(number))) return '';
  return new Intl.NumberFormat('id-ID', {
    maximumSignificantDigits: 5,
    style: 'currency',
    currency: 'IDR',
  }).format(number);
}

export const sumPrice = (items) => {
  return items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
};

export const sumTax = (value) => {
  return value * 0.1;
};

export const sumGrandTotal = (sumTotal) => {
  return parseFloat(sumTotal) + parseFloat(sumTotal * 0.1);
};

export const subTotal = (order_items) => {
  let subTotal = order_items
    .map((item) => item.qty * item.price)
    .reduce((acc, curr) => acc + curr, 0);

  return subTotal;
};

export const formatDate = (date) => {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  let current_datetime = new Date(date);
  let formatted_date =
    current_datetime.getDate() +
    '-' +
    months[current_datetime.getMonth()] +
    '-' +
    current_datetime.getFullYear();
  return formatted_date;
};

export const protectPage = (user) => {
  if (user.role !== 'admin') {
    if (user.role === 'waiter' || user.role === 'kitchen') {
      window.location = '/orders';
    }
    if (user.role === 'cashier') {
      window.location = '/payments';
    }
  }
  return;
};
