document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.header');
  const carousel = document.querySelector('#heroSlider');

  // Function to update header background
  function updateHeaderBg() {
    const activeSlide = document.querySelector('.carousel-item.active');
    const newBg = activeSlide.getAttribute('data-bg');

    header.style.backgroundImage = `
      linear-gradient(
        to right bottom,
        rgba(85, 197, 122, 0.8),
        rgba(40, 180, 133, 0.7),
        rgba(126, 213, 111, 0.6)
      ),
      url(${newBg})
    `;
  }

  // Set background on initial load
  updateHeaderBg();

  // Update background whenever slide changes
  carousel.addEventListener('slid.bs.carousel', updateHeaderBg);
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const flashMessage = document.getElementById('flashMessage');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let isValid = true;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');

    // Reset errors
    [nameError, emailError, subjectError, messageError].forEach((err) => {
      err.textContent = '';
      err.classList.remove('visible');
    });

    // Validate name
    if (name === '') {
      isValid = false;
      nameError.textContent = 'Full name is required';
      nameError.classList.add('visible');
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      isValid = false;
      emailError.textContent = 'Enter a valid email';
      emailError.classList.add('visible');
    }

    // Validate subject
    if (subject === '') {
      isValid = false;
      subjectError.textContent = 'Subject is required';
      subjectError.classList.add('visible');
    }

    // Validate message
    if (message === '') {
      isValid = false;
      messageError.textContent = 'Message cannot be empty';
      messageError.classList.add('visible');
    }

    // Success
    if (isValid) {
      flashMessage.innerHTML =
        '<div class="alert alert-success mt-3">✅ Thank you for contacting MorishCart! Will get back to you shortly.</div>';

      form.reset();

      setTimeout(() => {
        flashMessage.innerHTML = '';
      }, 3000);
    }
  });
});

// Back to Top Button Logic
const toTopBtn = document.getElementById('toTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 350) {
    toTopBtn.classList.add('show');
  } else {
    toTopBtn.classList.remove('show');
  }
});

// Smooth Scroll to Top
toTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach(alert => {
      alert.classList.remove("show"); // fade out
      setTimeout(() => alert.remove(), 500);
    });
  }, 4000);
});


// Update the current year
document.getElementById('current-year').textContent = new Date().getFullYear();
