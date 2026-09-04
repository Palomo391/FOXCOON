// =========================
// UI BEHAVIORS (robust)
// =========================

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;

  const header = document.querySelector('header');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.background = "rgba(5,8,22,0.95)";
      } else {
        header.style.background = "rgba(5,8,22,0.7)";
      }
    });
  }

  const progressBar = document.querySelector('.progress span');
  if (progressBar) {
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 85) {
        clearInterval(interval);
      } else {
        width++;
        progressBar.style.width = width + '%';
      }
    }, 30);
  }

  const buttons = document.querySelectorAll('.btn');
  if (buttons && buttons.length) {
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });
  }

  // Logo overlay handling: allow closing and remember preference
  const logoOverlay = document.getElementById('logoOverlay');
  const overlayClose = document.getElementById('overlayClose');

  const hideOverlay = () => {
    if (!logoOverlay) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    logoOverlay.style.transition = 'opacity .35s ease';
    logoOverlay.style.opacity = '0';
    setTimeout(() => { logoOverlay.style.display = 'none'; }, 360);
  };

  if (logoOverlay) {
    // Always show overlay on page load
    logoOverlay.style.display = 'flex';
    setTimeout(() => { logoOverlay.classList.add('show'); }, 40);
    setTimeout(hideOverlay, 4000);
  }

  if (overlayClose) overlayClose.addEventListener('click', hideOverlay);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideOverlay();
  });

  // --- Futuristic interactions: cursor follower & parallax ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cursor follower (lightweight, only when motion is enabled)
  try {
    if (!prefersReducedMotion) {
      const cursor = document.createElement('div');
      cursor.className = 'cursor-follower';
      document.body.appendChild(cursor);

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let curX = mouseX;
      let curY = mouseY;

      document.addEventListener('pointermove', (ev) => {
        mouseX = ev.clientX;
        mouseY = ev.clientY;
        cursor.style.opacity = '1';
      }, { passive: true });

      const animateCursor = () => {
        curX += (mouseX - curX) * 0.12;
        curY += (mouseY - curY) * 0.12;
        cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
      };
      requestAnimationFrame(animateCursor);

      const interactive = document.querySelectorAll('a, button, .btn');
      interactive.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
      });

      let fadeTimeout;
      document.addEventListener('pointermove', () => {
        cursor.style.opacity = '0.92';
        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => { cursor.style.opacity = '0.18'; }, 1200);
      }, { passive: true });
    }
  } catch (e) {}

  // Parallax background & hero tilt (single RAF loop for better FPS)
  try {
    if (!prefersReducedMotion) {
      const gridBg = document.querySelector('.grid-bg');
      const heroCard = document.querySelector('.hero-card');
      const heroContent = document.querySelector('.hero-content');

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      document.addEventListener('pointermove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      const renderParallax = () => {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        if (gridBg) {
          gridBg.style.transform = `translate3d(${currentX * 12}px, ${currentY * 12}px, 0) scale(1.01)`;
        }

        if (heroCard) {
          heroCard.style.transform = `translate3d(${ -currentX * 8 }px, ${ -currentY * 6 }px, 0) rotateX(${ -currentY * 3 }deg) rotateY(${ currentX * 3 }deg)`;
        }

        if (heroContent) {
          heroContent.style.transform = `translate3d(${ currentX * 6 }px, ${ currentY * 4 }px, 0)`;
        }

        requestAnimationFrame(renderParallax);
      };

      requestAnimationFrame(renderParallax);
    }
  } catch (e) {}

  // Reveal sections while scrolling
  try {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    reveals.forEach(el => observer.observe(el));
  } catch (e) {}

  // Save draft of the contact form so user data is not lost
  const contactForm = document.querySelector('.contact-form');
  const draftStatus = document.getElementById('draftStatus');
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (contactForm) {
    const draftKey = 'fooxcoon-contact-draft';

    const updateDraftStatus = (message) => {
      if (draftStatus) {
        draftStatus.textContent = message;
      }
    };

    const saveDraft = () => {
      const formData = {};
      contactForm.querySelectorAll('input, textarea').forEach(field => {
        const key = field.placeholder || field.name || field.id;
        if (key) {
          formData[key] = field.value;
        }
      });
      localStorage.setItem(draftKey, JSON.stringify(formData));
      updateDraftStatus('Borrador guardado correctamente.');
    };

    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const data = JSON.parse(savedDraft);
        contactForm.querySelectorAll('input, textarea').forEach(field => {
          const key = field.placeholder || field.name || field.id;
          if (key && data[key] !== undefined) {
            field.value = data[key];
          }
        });
        updateDraftStatus('Borrador restaurado automáticamente.');
      }
    } catch (e) {}

    contactForm.addEventListener('input', saveDraft);

    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        saveDraft();
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveDraft();
      localStorage.removeItem(draftKey);
      contactForm.reset();
      updateDraftStatus('Formulario enviado. El borrador se limpió.');
    });
  }
});