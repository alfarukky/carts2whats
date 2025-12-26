/* ===============================
   FLASH MESSAGE AUTO DISMISS
================================ */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelectorAll(".alert").forEach((alert) => {
      alert.classList.remove("show");
      setTimeout(() => alert.remove(), 500);
    });
  }, 4000);
});

/* ===============================
   BACK TO TOP BUTTON
================================ */
const toTopBtn = document.getElementById("toTopBtn");

if (toTopBtn) {
  window.addEventListener("scroll", () => {
    toTopBtn.classList.toggle("show", window.scrollY > 350);
  });

  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===============================
   PRODUCT DETAILS MODAL
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const productModal = document.getElementById("productModal");
  if (!productModal) return;

  productModal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;

    document.getElementById("modalProductName").textContent =
      button.dataset.name;
    document.getElementById("modalProductCategory").textContent =
      button.dataset.category;
    document.getElementById("modalProductDescription").textContent =
      button.dataset.description || "";
    document.getElementById("modalProductPrice").textContent =
      `$${button.dataset.price}`;
    document.getElementById("modalProductImage").src = button.dataset.image;

    // Old price
    const oldPriceEl = document.getElementById("modalProductOldPrice");
    if (button.dataset.oldprice) {
      oldPriceEl.textContent = `$${button.dataset.oldprice}`;
      oldPriceEl.classList.remove("d-none");
    } else {
      oldPriceEl.classList.add("d-none");
    }

    // Video button
    const videoBtn = document.getElementById("modalVideoBtn");
    if (button.dataset.video) {
      videoBtn.href = button.dataset.video;
      videoBtn.classList.remove("d-none");
    } else {
      videoBtn.classList.add("d-none");
    }
  });
});

/* ===============================
   CONTACT FORM (OPTIONAL PAGE)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const flashMessage = document.getElementById("flashMessage");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    // Clear previous errors
    document.querySelectorAll(".error").forEach((error) => {
      error.textContent = "";
      error.classList.remove("visible");
    });

    let isValid = true;

    // Validate name
    const name = document.getElementById("name").value.trim();
    if (!name) {
      const nameError = document.getElementById("nameError");
      nameError.textContent = "Name is required";
      nameError.classList.add("visible");
      isValid = false;
    }

    // Validate email
    const email = document.getElementById("email").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      const emailError = document.getElementById("emailError");
      emailError.textContent = "Email is required";
      emailError.classList.add("visible");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      const emailError = document.getElementById("emailError");
      emailError.textContent = "Please enter a valid email";
      emailError.classList.add("visible");
      isValid = false;
    }

    // Validate subject
    const subject = document.getElementById("subject").value.trim();
    if (!subject) {
      const subjectError = document.getElementById("subjectError");
      subjectError.textContent = "Subject is required";
      subjectError.classList.add("visible");
      isValid = false;
    }

    // Validate message
    const message = document.getElementById("message").value.trim();
    if (!message) {
      const messageError = document.getElementById("messageError");
      messageError.textContent = "Message is required";
      messageError.classList.add("visible");
      isValid = false;
    }

    // If validation fails, prevent form submission
    if (!isValid) {
      event.preventDefault();
      return false;
    }

    // If validation passes, let the form submit to backend
  });
});

/* ===============================
   FOOTER YEAR
================================ */
const yearEl = document.getElementById("current-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ===============================
   ADD TO CART BUTTON HANDLER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;

    const product = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      image: btn.dataset.image,
    };

    addToCart(product);

    btn.innerHTML = "✓ Added";
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa fa-shopping-cart me-2"></i> Add to Cart';
      btn.disabled = false;
    }, 900);
  });
});

/* ===============================
   CART OFFCANVAS RENDER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cartOffcanvas = document.getElementById("cartOffcanvas");
  if (!cartOffcanvas) return;

  cartOffcanvas.addEventListener("shown.bs.offcanvas", renderCart);
});

//change coupon code to upperCase
const codeInput = document.getElementById("code");
if (codeInput) {
  codeInput.addEventListener("input", function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  });
}
