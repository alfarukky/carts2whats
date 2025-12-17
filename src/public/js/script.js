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
    event.preventDefault();

    flashMessage.innerHTML =
      '<div class="alert alert-success mt-3">✅ Thank you for contacting MorishCart! We’ll get back to you shortly.</div>';

    form.reset();

    setTimeout(() => {
      flashMessage.innerHTML = "";
    }, 3000);
  });
});

/* ===============================
   FOOTER YEAR
================================ */
const yearEl = document.getElementById("current-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
