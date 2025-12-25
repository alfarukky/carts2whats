/* ===============================
   CART CONFIG
================================ */
const CART_KEY = "morishcart_cart";
const WHATSAPP_NUMBER = "2348174352137";
const INSTAGRAM_USERNAME = "go3we_tech";
const CART_EXPIRY_HOURS = 48; // 2 days

/* ===============================
   IMAGE OPTIMIZATION
================================ */
// Load full image on click for better mobile experience (removed thumbnail logic)
document.addEventListener("click", function (e) {
  // Removed progressive loading since we're not using thumbnails
});

/* ===============================
   STORAGE HELPERS
================================ */
function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  if (!cart) return [];

  const parsed = JSON.parse(cart);
  const now = Date.now();
  const expiryTime = CART_EXPIRY_HOURS * 60 * 60 * 1000;

  // Filter out expired items
  const validItems = parsed.filter((item) => {
    return item.addedAt && now - item.addedAt < expiryTime;
  });

  // Show friendly message if items were removed
  if (validItems.length !== parsed.length && parsed.length > 0) {
    showCartExpiryMessage();
  }

  // Save cleaned cart if items were removed
  if (validItems.length !== parsed.length) {
    localStorage.setItem(CART_KEY, JSON.stringify(validItems));
  }

  return validItems;
}

function showCartExpiryMessage() {
  // Create and show a temporary notification
  const notification = document.createElement('div');
  notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
  notification.innerHTML = `
    <small>Some items in your cart expired and were removed to ensure current pricing.</small>
    <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getItemAge(addedAt) {
  if (!addedAt) return '';
  
  const now = Date.now();
  const hoursDiff = Math.floor((now - addedAt) / (1000 * 60 * 60));
  
  if (hoursDiff < 1) return 'Added just now';
  if (hoursDiff < 24) return 'Added today';
  if (hoursDiff < 48) return 'Added yesterday';
  return 'Added recently';
}

/* ===============================
   CART OPERATIONS
================================ */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
    existing.addedAt = Date.now(); // Update timestamp
  } else {
    cart.push({ ...product, quantity: 1, addedAt: Date.now() });
  }

  saveCart(cart);
  updateCartBadge();
  showCartAnimation();
}

function updateQuantity(id, newQuantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);

  if (item && newQuantity > 0) {
    item.quantity = newQuantity;
    saveCart(cart);
    updateCartBadge();
    renderCart();
  }
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    renderCart();
  }
}

/* ===============================
   CART METRICS
================================ */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/* ===============================
   CART UI
================================ */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}

function showCartAnimation() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.style.transform = "scale(1.3)";
    badge.style.transition = "transform 0.2s";
    setTimeout(() => {
      badge.style.transform = "scale(1)";
    }, 200);
  }
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  if (!itemsEl || !totalEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="text-center py-5">
        <i class="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
        <h6>Your cart is empty</h6>
        <p class="text-muted small">Add some products to get started</p>
        <button class="btn btn-outline-success" data-bs-dismiss="offcanvas">
          Continue Shopping
        </button>
      </div>
    `;
    totalEl.textContent = "$0.00";
    return;
  }

  const cartCount = getCartCount();

  itemsEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <h6 class="mb-0">Cart Items</h6>
        <span class="badge bg-success ms-2">${cartCount} items</span>
      </div>
      <button onclick="clearCart()" class="btn btn-sm btn-outline-danger">
        <i class="fa fa-trash me-1"></i>Clear All
      </button>
    </div>
    ${cart
      .map(
        (item) => `
      <div class="cart-item mb-3 border-bottom pb-3">
        <div class="d-flex align-items-center mb-2">
          <img src="${item.image}" class="cart-item-image rounded me-3" />
          <div class="flex-grow-1">
            <h6 class="mb-1 text-truncate cart-item-name">${item.name}</h6>
            <small class="text-muted">$${item.price} each</small>
            <div><small class="text-muted">${getItemAge(item.addedAt)}</small></div>
          </div>
          <button onclick="removeFromCart('${item.id}')" 
                  class="btn btn-sm btn-outline-danger cart-remove-btn">×</button>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group cart-quantity-controls" role="group">
            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" 
                    class="btn btn-outline-secondary cart-qty-btn" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <button class="btn btn-outline-secondary cart-qty-display" disabled>${item.quantity}</button>
            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" 
                    class="btn btn-outline-secondary cart-qty-btn">+</button>
          </div>
          <strong class="text-success cart-item-total">$${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      </div>
    `,
      )
      .join("")}
  `;

  totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
}

/* ===============================
   WHATSAPP CHECKOUT
================================ */
async function createOrderVerification(totalAmount) {
  try {
    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ totalAmount }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to create order");
    }

    return data;
  } catch (error) {
    console.error("Error creating order verification:", error);
    throw error;
  }
}

async function buildWhatsAppMessage() {
  const cart = getCart();

  if (!cart || cart.length === 0) {
    alert("Your cart is empty");
    return null;
  }

  const total = getCartTotal();

  try {
    // Create order verification record with final total and coupon data
    const finalTotal = appliedCoupon ? total - appliedCoupon.discount : total;
    
    const orderPayload = {
      totalAmount: finalTotal
    };
    
    // Add coupon data if applied
    if (appliedCoupon) {
      orderPayload.couponCode = appliedCoupon.code;
      orderPayload.discountAmount = appliedCoupon.discount;
    }
    
    const response = await fetch('/api/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });
    
    const orderData = await response.json();
    
    if (!orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    const date = new Date().toLocaleDateString();

    let message = `🛒 MorishCart Order\n`;
    message += `Order ID: ${orderData.orderId}\n`;
    message += `Date: ${date}\n\n`;
    message += `*ITEMS:*\n`;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name} × ${item.quantity} — $${itemTotal.toFixed(2)}\n`;
    });

    message += `\n----------------------\n`;
    message += `Subtotal: $${total.toFixed(2)}\n`;
    
    if (appliedCoupon) {
      message += `Coupon: ${appliedCoupon.code} (-$${appliedCoupon.discount.toFixed(2)})\n`;
      message += `*TOTAL: $${finalTotal.toFixed(2)}*\n`;
    } else {
      message += `*TOTAL: $${total.toFixed(2)}*\n`;
    }
    
    message += `🔐 Code: ${orderData.verificationCode}\n`;
    message += `----------------------\n\n`;
    message += `Delivery Required: Yes / No\n`;
    message += `Payment Method: Cash / Transfer\n\n`;
    message += `Please confirm availability.`;

    return encodeURIComponent(message);
  } catch (error) {
    alert("Error creating order. Please try again.");
    return null;
  }
}

document.getElementById("buyNowBtn")?.addEventListener("click", async () => {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  window.location.href = "/api/checkout";
});

document.getElementById("instagramBtn")?.addEventListener("click", () => {
  window.open(`https://instagram.com/${INSTAGRAM_USERNAME}`, "_blank");
});

/* ===============================
   INITIAL LOAD
================================ */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
