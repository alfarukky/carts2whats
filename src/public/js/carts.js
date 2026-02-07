/* ===============================
   CART CONFIG
================================ */
const CART_KEY = "morishcart_cart";
const WHATSAPP_NUMBER = "2348174352137";
const INSTAGRAM_USERNAME = "go3we_tech";
const CART_EXPIRY_HOURS = 48; // 2 days

// Global coupon variable (used in checkout.ejs)
let appliedCoupon = null;

/* ===============================
   SECURITY HELPERS
================================ */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// Show toast notification (reuses existing alert styling)
function showToast(message, type = "danger") {
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; max-width: 300px;";
  toast.innerHTML = `
    <small>${message}</small>
    <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(toast);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }
  }, 4000);
}

function showCartExpiryMessage() {
  // Create and show a temporary notification
  const notification = document.createElement("div");
  notification.className =
    "alert alert-info alert-dismissible fade show position-fixed";
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; max-width: 300px;";
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
  if (!addedAt) return "";

  const now = Date.now();
  const hoursDiff = Math.floor((now - addedAt) / (1000 * 60 * 60));

  if (hoursDiff < 1) return "Added just now";
  if (hoursDiff < 24) return "Added today";
  if (hoursDiff < 48) return "Added yesterday";
  return "Added recently";
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
        <div class="fw-bold">Your cart is empty</div>
        <p class="text-muted small">Add some products to get started</p>
        <button class="btn btn-outline-success" data-bs-dismiss="offcanvas">
          Continue Shopping
        </button>
      </div>
    `;
    totalEl.textContent = "₦0.00";
    return;
  }

  const cartCount = getCartCount();

  itemsEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <div class="fw-bold mb-0">Cart Items</div>
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
            <div class="fw-bold mb-1 text-truncate cart-item-name">${escapeHtml(item.name)}</div>
            <small class="text-muted">₦${item.price} each</small>
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
          <strong class="text-success cart-item-total">₦${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      </div>
    `,
      )
      .join("")}
  `;

  totalEl.textContent = `₦${getCartTotal().toFixed(2)}`;
}

/* ===============================
   WHATSAPP CHECKOUT
================================ */
async function buildWhatsAppMessage(openDirectly = false) {
  const cart = getCart();

  if (!cart || cart.length === 0) {
    showToast("Your cart is empty");
    return null;
  }

  try {
    // Prepare items for server validation
    const items = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    // Create order with server-side calculation
    const orderPayload = { items };

    // Add coupon data if applied
    if (appliedCoupon) {
      orderPayload.couponCode = appliedCoupon.code;
      orderPayload.discountAmount = appliedCoupon.discount;
    }

    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await response.json();

    if (!orderData.success) {
      console.error("Server error:", orderData.error);
      throw new Error(orderData.error || "Failed to create order");
    }

    // Build WhatsApp message from cart (display only)
    const date = new Date().toLocaleDateString();
    const total = getCartTotal();
    const finalTotal = appliedCoupon ? total - appliedCoupon.discount : total;

    let message = `🛒 MorishCart Order\n`;
    message += `Order ID: ${orderData.orderId}\n`;
    message += `Date: ${date}\n\n`;
    message += `*ITEMS:*\n`;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const safeName = item.name.replace(/[<>&"']/g, '');
      message += `${index + 1}. ${safeName} × ${item.quantity} — ₦${itemTotal.toFixed(2)}\n`;
    });

    message += `\n----------------------\n`;
    message += `Subtotal: ₦${total.toFixed(2)}\n`;

    if (appliedCoupon) {
      message += `Coupon: ${appliedCoupon.code} (-₦${appliedCoupon.discount.toFixed(2)})\n`;
      message += `*TOTAL: ₦${finalTotal.toFixed(2)}*\n`;
    } else {
      message += `*TOTAL: ₦${total.toFixed(2)}*\n`;
    }
    message += `📋 Ref: ${orderData.verificationCode}\n`;
    message += `----------------------\n\n`;
    message += `Delivery Required: Yes / No\n`;
    message += `Payment Method: Cash / Transfer\n\n`;
    message += `Please confirm availability.`;

    if (openDirectly) {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      
      // Phase 1: Clear cart ONLY after successful order creation
      localStorage.removeItem(CART_KEY);
      appliedCoupon = null;
      updateCartBadge();
      renderCart();
      
      return true;
    }

    return encodeURIComponent(message);
  } catch (error) {
    console.error("Detailed error:", error);
    showToast(error.message || "Error creating order. Please try again.");
    return null;
  }
}

document.getElementById("buyNowBtn")?.addEventListener("click", async () => {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your cart is empty");
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
