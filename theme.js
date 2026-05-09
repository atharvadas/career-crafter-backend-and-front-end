/**
 * ═══════════════════════════════════════════════════════
 *   CAREER CRAFTER — MASTER THEME JS
 *   Drop into every page before </body>:
 *   <script src="theme.js"></script>
 * ═══════════════════════════════════════════════════════
 */

/* ── 1. NAV scroll shadow ── */
const mainNav = document.getElementById('mainNav');
if (mainNav) {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ── 2. Hamburger mobile menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
}
function closeMenu() {
  if (hamburger)  hamburger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

/* ── 3. Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 4. FAQ accordion ── */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── 5. Tab switching ── */
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  if (panel) panel.classList.add('active');
  // find the button that triggered this tab
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${name}'`)) {
      b.classList.add('active');
    }
  });
}

/* ── 6. Toast notification ── */
function showToast(msg, type = 'default') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');

  // colour variants
  toast.style.borderColor = type === 'error'   ? 'rgba(239,68,68,0.5)' :
                             type === 'success' ? 'var(--accent)'       :
                                                  'var(--border)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ── 7. Modal helpers ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const el = id ? document.getElementById(id) : document.querySelector('.modal-overlay.show');
  if (el) {
    el.classList.remove('show');
    document.body.style.overflow = '';
  }
}
// Close any modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── 8. Confirm logout ── */
function confirmLogout() { openModal('logoutModal'); }
function closeLogout()   { closeModal('logoutModal'); }
function doLogout() {
  localStorage.removeItem('cc_loggedIn');
  localStorage.removeItem('cc_username');
  localStorage.removeItem('cc_current_user');
  localStorage.removeItem('cc_role');
  window.location.href = 'login.html';
}

/* ── 9. Auth guard (call on dashboard pages) ── */
function requireAuth(expectedRole) {
  if (!localStorage.getItem('cc_loggedIn')) {
    window.location.replace('login.html');
    return false;
  }
  if (expectedRole) {
    const role = localStorage.getItem('cc_role') || 'student';
    if (role !== expectedRole) {
      const routes = {
        student:    'dashboard.html',
        counsellor: 'dashboard-counsellor.html',
        college:    'dashboard-college.html',
        parent:     'dashboard-parent.html',
      };
      window.location.replace(routes[role] || 'dashboard.html');
      return false;
    }
  }
  return true;
}

/* ── 10. Role router (used in dashboard.html) ── */
function routeByRole() {
  if (!localStorage.getItem('cc_loggedIn')) {
    window.location.replace('login.html');
    return;
  }
  const role = localStorage.getItem('cc_role') || 'student';
  const routes = {
    counsellor: 'dashboard-counsellor.html',
    college:    'dashboard-college.html',
    parent:     'dashboard-parent.html',
  };
  if (routes[role]) window.location.replace(routes[role]);
}

/* ── 11. Get started redirect (if already logged in) ── */
document.querySelectorAll('a[href="choose-role.html"]').forEach(btn => {
  btn.addEventListener('click', e => {
    if (localStorage.getItem('cc_loggedIn')) {
      e.preventDefault();
      const role = localStorage.getItem('cc_role') || 'student';
      const routes = {
        student:    'dashboard.html',
        counsellor: 'dashboard-counsellor.html',
        college:    'dashboard-college.html',
        parent:     'dashboard-parent.html',
      };
      window.location.href = routes[role] || 'dashboard.html';
    }
  });
});

/* ── 12. Set nav welcome name ── */
const nameEl = document.getElementById('userName') || document.getElementById('counsellorName') || document.getElementById('contactName') || document.getElementById('parentName');
if (nameEl) {
  nameEl.textContent = localStorage.getItem('cc_username') || 'User';
}

/* ── 13. Format date helper ── */
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

/* ── 14. Per-user storage key ── */
function getUserKey(prefix) {
  const email = localStorage.getItem('cc_current_user') || 'guest';
  return `${prefix}_${email}`;
}
