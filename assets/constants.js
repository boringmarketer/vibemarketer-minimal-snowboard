// Shopify theme constants
window.theme = window.theme || {};

// Cart functionality
window.theme.cart = {
  get: function() {
    return fetch(window.Shopify.routes.root + 'cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
  },
  
  add: function(items) {
    return fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(items)
    }).then(response => response.json());
  },
  
  change: function(line, quantity) {
    return fetch(window.Shopify.routes.root + 'cart/change.js', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        line: line,
        quantity: quantity
      })
    }).then(response => response.json());
  },
  
  clear: function() {
    return fetch(window.Shopify.routes.root + 'cart/clear.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
  }
};

// Format money
window.theme.formatMoney = function(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || window.theme.moneyFormat);

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision || 2;
    thousands = thousands || ',';
    decimal = decimal || '.';

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    var centsAmount = parts[1] ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

// Media queries
window.theme.mediaQueries = {
  mobile: '(max-width: 749px)',
  tablet: '(min-width: 750px) and (max-width: 989px)', 
  desktop: '(min-width: 990px)'
};

// Check if mobile
window.theme.isMobile = function() {
  return window.matchMedia(window.theme.mediaQueries.mobile).matches;
};

// Debounce function
window.theme.debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Initialize theme
document.addEventListener('DOMContentLoaded', function() {
  // Set money format from Shopify
  if (window.Shopify && window.Shopify.currency) {
    window.theme.moneyFormat = window.Shopify.currency.active || '${{amount}}';
  }
});