/* ============================================================
   GOLF CART DEALER TEMPLATE — MAIN JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     MOBILE NAV TOGGLE
  ---------------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const mainNav = document.querySelector('.main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }

  /* ----------------------------------------------------------
     INVENTORY CAROUSEL (homepage)
     Shows 3 cards at a time, slides by 1
  ---------------------------------------------------------- */
  const carousel = document.querySelector('.inventory-carousel');
  if (carousel) {
    const grid = carousel.querySelector('.inventory-grid');
    const cards = Array.from(grid.querySelectorAll('.cart-card'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    const visibleCount = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    let currentIndex = 0;

    function updateCarousel() {
      const visible = visibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      currentIndex = Math.min(currentIndex, maxIndex);

      cards.forEach((card, i) => {
        card.style.display = (i >= currentIndex && i < currentIndex + visible) ? 'block' : 'none';
      });

      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentIndex = Math.max(0, currentIndex - 1);
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        const maxIndex = Math.max(0, cards.length - visibleCount());
        currentIndex = Math.min(maxIndex, currentIndex + 1);
        updateCarousel();
      });
    }

    updateCarousel();
    window.addEventListener('resize', updateCarousel);
  }

  /* ----------------------------------------------------------
     REVIEWS SLIDER
  ---------------------------------------------------------- */
  const reviewsSection = document.querySelector('.reviews-section');
  if (reviewsSection) {
    const reviewCards = Array.from(reviewsSection.querySelectorAll('.review-card'));
    const dots = Array.from(reviewsSection.querySelectorAll('.review-dot'));
    const prevReview = reviewsSection.querySelector('.review-nav.prev');
    const nextReview = reviewsSection.querySelector('.review-nav.next');

    const visibleReviews = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    let reviewIndex = 0;

    function updateReviews() {
      const visible = visibleReviews();
      const maxIndex = Math.max(0, reviewCards.length - visible);
      reviewIndex = Math.min(reviewIndex, maxIndex);

      reviewCards.forEach((card, i) => {
        card.style.display = (i >= reviewIndex && i < reviewIndex + visible) ? 'block' : 'none';
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === reviewIndex);
      });
    }

    if (prevReview) {
      prevReview.addEventListener('click', function () {
        reviewIndex = Math.max(0, reviewIndex - 1);
        updateReviews();
      });
    }

    if (nextReview) {
      nextReview.addEventListener('click', function () {
        const maxIndex = Math.max(0, reviewCards.length - visibleReviews());
        reviewIndex = Math.min(maxIndex, reviewIndex + 1);
        updateReviews();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', function () {
        reviewIndex = i;
        updateReviews();
      });
    });

    updateReviews();
    window.addEventListener('resize', updateReviews);
  }

  /* ----------------------------------------------------------
     PRODUCT PAGE — IMAGE GALLERY
  ---------------------------------------------------------- */
  const gallery = document.querySelector('.product-gallery');
  if (gallery) {
    const mainImg = gallery.querySelector('.gallery-main img');
    const thumbs = Array.from(gallery.querySelectorAll('.gallery-thumb'));

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const src = thumb.querySelector('img').src;
        mainImg.src = src;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    if (thumbs.length > 0) thumbs[0].classList.add('active');
  }

  /* ----------------------------------------------------------
     SMOOTH SCROLL for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------
     STICKY HEADER — add shadow on scroll
  ---------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

});
