document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const preloader = document.getElementById('preloader');
  let animationsInitialized = false;

  setTimeout(() => {
    if (preloader) preloader.classList.add('hidden');
    if (!animationsInitialized) {
      animationsInitialized = true;
      initAnimations();
    }
  }, 1200);

  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      if (!animationsInitialized) {
        animationsInitialized = true;
        initAnimations();
      }
    }
  }, 3000);

  function initCursor() {
    if (window.innerWidth < 768) return;

    const cursor = document.getElementById('cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!cursor || !dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;

      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    const interactives = document.querySelectorAll('a, button, .magnetic, .tilt-card, input, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
      });
    });
  }

  function initMagnetic() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = parseFloat(el.dataset.strength) || 30;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - centerX) * strength / 100;
        const offsetY = (e.clientY - centerY) * strength / 100;

        gsap.to(el, {
          x: offsetX,
          y: offsetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  function initTilt() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll('.tilt-card').forEach(card => {
      const shine = card.querySelector('.card-shine');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 10,
          rotateX: -y * 10,
          transformPerspective: 800,
          duration: 0.3,
          ease: 'power2.out'
        });

        if (shine) {
          gsap.to(shine, {
            background: `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.15), transparent 60%)`,
            opacity: 1,
            duration: 0.3
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });

        if (shine) {
          gsap.to(shine, { opacity: 0, duration: 0.4 });
        }
      });
    });
  }

  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02;

        if (this.x < 0 || this.x > w) this.speedX *= -1;
        if (this.y < 0 || this.y > h) this.speedY *= -1;
      }
      draw() {
        const alpha = this.opacity + Math.sin(this.pulse) * 0.1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${Math.max(0, alpha)})`;
        ctx.fill();
      }
    }

    const count = Math.min(60, Math.floor((w * h) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, 0.06)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      requestAnimationFrame(animate);
    }

    animate();
  }

  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    });
  }

  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
          if (self.direction === 1 && window.scrollY > 80) {
            navbar.classList.add('scrolled');
          } else if (window.scrollY <= 80) {
            navbar.classList.remove('scrolled');
          }
        }
      });
    }

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
      });

      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 80 },
            duration: 1.2,
            ease: 'power3.inOut'
          });
        }
      });
    });
  }

  function initRevealAnimations() {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      const delay = parseFloat(el.dataset.delay) || 0;

      gsap.set(el, {
        opacity: 0,
        x: el.classList.contains('reveal-left') ? -60 : el.classList.contains('reveal-right') ? 60 : 0,
        y: el.classList.contains('reveal-up') ? 60 : 0,
        scale: el.classList.contains('reveal-scale') ? 0.9 : 1
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1,
            delay: delay,
            ease: 'expo.out'
          });
        }
      });
    });
  }

  function initTextReveal() {
    document.querySelectorAll('.line-inner').forEach(el => {
      gsap.set(el, { y: '110%', opacity: 0 });

      ScrollTrigger.create({
        trigger: el.closest('.line-wrap') || el.parentElement,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            y: '0%',
            opacity: 1,
            duration: 1.2,
            ease: 'expo.out'
          });
        }
      });
    });
  }

  function initParallax() {
    document.querySelectorAll('.parallax-img').forEach(img => {
      const speed = parseFloat(img.dataset.speed) || 0.5;
      gsap.to(img, {
        yPercent: -15 * speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('section') || img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    document.querySelectorAll('.hero-blob').forEach(blob => {
      gsap.to(blob, {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: blob.closest('section') || blob.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    document.querySelectorAll('.cta-bg-text').forEach(txt => {
      gsap.to(txt, {
        x: 100,
        ease: 'none',
        scrollTrigger: {
          trigger: txt.closest('section') || txt.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }

  function initCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.floor(obj.val);
            }
          });
        }
      });
    });

    document.querySelectorAll('.badge-number[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.floor(obj.val);
            }
          });
        }
      });
    });
  }

  function initMarqueeDuplicate() {
    document.querySelectorAll('.marquee-content').forEach(content => {
      const children = Array.from(content.children);
      children.forEach(child => {
        const clone = child.cloneNode(true);
        content.appendChild(clone);
      });
    });
  }

  function initTestimonialMarquee() {
    document.querySelectorAll('.testimonial-marquee-track').forEach(track => {
      const children = Array.from(track.children);
      children.forEach(child => {
        const clone = child.cloneNode(true);
        track.appendChild(clone);
      });
    });
  }

  function initFormInteractions() {
    document.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('focus', () => {
        gsap.to(field, { scale: 1.01, duration: 0.3, ease: 'power2.out' });
      });
      field.addEventListener('blur', () => {
        gsap.to(field, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        const originalText = btn.innerHTML;
        btn.innerHTML = 'Mengirim...';
        btn.disabled = true;

        gsap.to(btn, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            const name = form.querySelector('[name="name"]')?.value || '';
            const phone = form.querySelector('[name="phone"]')?.value || '';
            const service = form.querySelector('[name="service"]')?.value || '';
            const message = form.querySelector('[name="message"]')?.value || '';

            const waText = encodeURIComponent(
              `Halo NM Jaya Teknik!\n\nNama: ${name}\nTelepon: ${phone}\nLayanan: ${service}\nPesan: ${message}`
            );
            const waUrl = `https://wa.me/6281234567890?text=${waText}`;

            window.open(waUrl, '_blank');

            btn.innerHTML = originalText;
            btn.disabled = false;
            form.reset();
          }
        });
      });
    }
  }

  function initHoverEffects() {
    document.querySelectorAll('.card, .service-card, .project-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          boxShadow: '0 25px 60px rgba(245, 158, 11, 0.15), 0 10px 30px rgba(0,0,0,0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  function initAnimations() {
    initCursor();
    initMagnetic();
    initTilt();
    initParticles();
    initScrollProgress();
    initNavbar();
    initSmoothScroll();
    initRevealAnimations();
    initTextReveal();
    initParallax();
    initCounters();
    initMarqueeDuplicate();
    initTestimonialMarquee();
    initFormInteractions();
    initHoverEffects();
    ScrollTrigger.refresh();
  }

  if (preloader && preloader.classList.contains('hidden') && !animationsInitialized) {
    animationsInitialized = true;
    initAnimations();
  }
});