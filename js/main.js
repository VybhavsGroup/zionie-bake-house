/* Zionie Bake House — shared behavior */
(function () {
  'use strict';

  // WhatsApp business number (country code, no "+")
  var WHATSAPP_NUMBER = '917708915271';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Sticky header ----- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Mobile nav ----- */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----- Scroll reveal (opacity/transform only) ----- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----- Stagger helper: children of [data-stagger] get incremental delays ----- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--reveal-delay', (i * step) + 'ms');
    });
  });

  /* ----- Toast ----- */
  var toastEl;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () { toastEl.classList.add('visible'); });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 4200);
  }

  /* ----- Form validation + WhatsApp handoff ----- */
  function validateForm(form) {
    var valid = true;
    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, select, textarea');
      if (!input) return;
      var bad = input.hasAttribute('required') && !input.value.trim();
      if (!bad && input.type === 'email' && input.value && !/^\S+@\S+\.\S+$/.test(input.value)) bad = true;
      field.classList.toggle('invalid', bad);
      if (bad && valid) { input.focus(); valid = false; }
      else if (bad) valid = false;
    });
    return valid;
  }

  /* Note: form.elements[name] collides with built-in collection methods
     (e.g. a field named "item" returns HTMLCollection.item), so query by attribute. */
  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function openWhatsApp(message) {
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
  }

  function setSubmitting(form, submitting) {
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = submitting;
  }

  /* Order form (contact page) */
  var orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(orderForm)) return;
      setSubmitting(orderForm, true);

      var lines = [
        'Hello Zionie Bake House! I would like to place an order.',
        '',
        'Name: ' + fieldValue(orderForm, 'name'),
        'Phone: ' + fieldValue(orderForm, 'phone'),
        'Item: ' + fieldValue(orderForm, 'item'),
        'Quantity: ' + fieldValue(orderForm, 'quantity'),
        'Needed by: ' + fieldValue(orderForm, 'date'),
        'Fulfilment: ' + fieldValue(orderForm, 'fulfilment')
      ];
      var notes = fieldValue(orderForm, 'notes');
      if (notes) lines.push('Notes: ' + notes);

      openWhatsApp(lines.join('\n'));

      var success = orderForm.parentElement.querySelector('.form-success');
      if (success) success.classList.add('visible');
      showToast('Opening WhatsApp with your order details…');
      setTimeout(function () { setSubmitting(orderForm, false); }, 1200);
    });
  }

  /* Class enrollment form */
  var enrollForm = document.getElementById('enroll-form');
  if (enrollForm) {
    enrollForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(enrollForm)) return;
      setSubmitting(enrollForm, true);

      var lines = [
        'Hello Zionie Bake House! I would like to reserve a spot in a class.',
        '',
        'Name: ' + fieldValue(enrollForm, 'name'),
        'Email: ' + fieldValue(enrollForm, 'email'),
        'Phone: ' + fieldValue(enrollForm, 'phone'),
        'Class: ' + fieldValue(enrollForm, 'class'),
        'Guests: ' + fieldValue(enrollForm, 'guests')
      ];
      var questions = fieldValue(enrollForm, 'questions');
      if (questions) lines.push('Questions: ' + questions);

      openWhatsApp(lines.join('\n'));

      var success = enrollForm.parentElement.querySelector('.form-success');
      if (success) success.classList.add('visible');
      showToast('Opening WhatsApp to confirm your reservation…');
      setTimeout(function () { setSubmitting(enrollForm, false); }, 1200);
    });

    /* Pre-select class when arriving via "Reserve" buttons (?class=...) */
    var params = new URLSearchParams(window.location.search);
    var preselect = params.get('class');
    var classSelect = enrollForm.querySelector('[name="class"]');
    if (preselect && classSelect) {
      classSelect.value = preselect;
    }
  }

  /* ----- Menu filter ----- */
  var filterRow = document.querySelector('.filter-row');
  if (filterRow) {
    filterRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterRow.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var cat = btn.getAttribute('data-filter');
      document.querySelectorAll('.menu-item').forEach(function (item) {
        var show = cat === 'all' || item.getAttribute('data-category') === cat;
        item.classList.toggle('hidden', !show);
      });
    });
  }

  /* ----- Gallery lightbox ----- */
  var galleryLinks = document.querySelectorAll('.gallery-link');
  if (galleryLinks.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Enlarged photo');
    var lbImg = document.createElement('img');
    lb.appendChild(lbImg);
    document.body.appendChild(lb);

    function closeLightbox() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    galleryLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var thumb = a.querySelector('img');
        lbImg.src = thumb ? thumb.src : a.getAttribute('href');
        lbImg.alt = thumb ? thumb.alt : '';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ----- Footer year ----- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
