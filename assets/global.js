// Global theme JavaScript
class Theme {
  constructor() {
    this.init();
  }

  init() {
    this.initMobileMenu();
    this.initCartFunctionality();
    this.initProductForms();
    this.initQuantityInputs();
  }

  initMobileMenu() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const mobileMenu = document.querySelector('.header__mobile-menu');
    
    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  initCartFunctionality() {
    // Add to cart forms
    document.addEventListener('submit', (e) => {
      if (e.target.matches('[action*="/cart/add"]')) {
        e.preventDefault();
        this.addToCart(e.target);
      }
    });
  }

  async addToCart(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Update button state
    submitButton.disabled = true;
    submitButton.textContent = 'Adding...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const item = await response.json();
        this.showCartNotification(item);
        this.updateCartCount();
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart. Please try again.');
    } finally {
      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  showCartNotification(item) {
    // Simple notification - can be enhanced
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="cart-notification__content">
        <p>${item.product_title} was added to your cart!</p>
        <a href="/cart" class="btn btn--secondary btn--small">View Cart</a>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: '9999',
      maxWidth: '300px'
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCounts = document.querySelectorAll('.header__cart-count');
      cartCounts.forEach(count => {
        count.textContent = cart.item_count;
        count.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  initProductForms() {
    // Variant selection
    document.addEventListener('change', (e) => {
      if (e.target.matches('.variant-select')) {
        this.updateVariant(e.target);
      }
    });
  }

  updateVariant(select) {
    const form = select.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const options = [];
    
    // Collect all option values
    form.querySelectorAll('.variant-select').forEach(select => {
      options.push(select.value);
    });

    // Find matching variant
    if (window.productVariants) {
      const variant = window.productVariants.find(v => {
        return options.every((option, index) => {
          return v.options[index] === option;
        });
      });

      if (variant) {
        // Update hidden variant ID
        const variantInput = form.querySelector('input[name="id"]');
        if (variantInput) {
          variantInput.value = variant.id;
        }

        // Update price
        const priceElement = form.querySelector('.product-form__submit');
        if (priceElement && variant.price) {
          const price = window.theme.formatMoney ? 
            window.theme.formatMoney(variant.price) : 
            `$${(variant.price / 100).toFixed(2)}`;
          priceElement.textContent = `Add to Cart - ${price}`;
        }

        // Update availability
        const submitButton = form.querySelector('.product-form__submit');
        if (submitButton) {
          if (variant.available) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.textContent.replace('Sold Out', 'Add to Cart');
          } else {
            submitButton.disabled = true;
            submitButton.textContent = 'Sold Out';
          }
        }
      }
    }
  }

  initQuantityInputs() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.quantity-btn--plus')) {
        this.updateQuantity(e.target, 1);
      } else if (e.target.matches('.quantity-btn--minus')) {
        this.updateQuantity(e.target, -1);
      }
    });
  }

  updateQuantity(button, change) {
    const input = button.parentNode.querySelector('.quantity-field');
    if (!input) return;

    const currentValue = parseInt(input.value) || 1;
    const newValue = Math.max(1, currentValue + change);
    input.value = newValue;

    // Trigger change event
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Theme();
});

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCounts = document.querySelectorAll('.header__cart-count');
      cartCounts.forEach(count => {
        count.textContent = cart.item_count;
        count.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    })
    .catch(error => console.error('Error loading cart:', error));
});