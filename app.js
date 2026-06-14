// ===== DATA (dari Firestore) =====
window.allItems = [];

// ===== PAGINATION =====
const ITEMS_PER_PAGE = 12;
let searchCurrentPage = 1;
let searchFilteredItems = [];

// ===== CATEGORY COLORS =====
const CAT_COLORS = {
  electronics: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)',
  bags:        'linear-gradient(135deg,#FFF7ED,#FED7AA)',
  documents:   'linear-gradient(135deg,#F0FDF4,#BBF7D0)',
  keys:        'linear-gradient(135deg,#FEFCE8,#FDE68A)',
  accessories: 'linear-gradient(135deg,#FAF5FF,#E9D5FF)',
  others:      'linear-gradient(135deg,#F8FAFC,#E2E8F0)',
};
const CAT_COLORS_DARK = {
  electronics: 'linear-gradient(135deg,#1C2A3F,#1A3A5C)',
  bags:        'linear-gradient(135deg,#2C1F0F,#3D2B10)',
  documents:   'linear-gradient(135deg,#0F2C1E,#123D25)',
  keys:        'linear-gradient(135deg,#2C2008,#3D2F08)',
  accessories: 'linear-gradient(135deg,#1E1730,#2A1F42)',
  others:      'linear-gradient(135deg,#1A1F2E,#21262D)',
};

function getCatColor(cat) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return (dark ? CAT_COLORS_DARK : CAT_COLORS)[cat] || (dark ? CAT_COLORS_DARK.others : CAT_COLORS.others);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initStats();
  renderGrid('homeGrid', allItems.filter(i => i.status === 'lost').slice(0, 8));
  searchFilteredItems = allItems;
  renderSearchPage();
  renderSidebarRecent();
  initStatsPage();
  initNavSearch();
});

// ===== RENDER GRID =====
function renderGrid(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">🔍</div><p>No matching items found</p></div>`;
    return;
  }
  el.innerHTML = items.map(item => {
    const isLost = item.status.toLowerCase() === 'lost';
    return `<div class="item-card" data-id="${item.id}" data-category="${item.category}" 
    data-status="${item.status.toLowerCase()}" data-location="${item.location.toLowerCase()}" data-name="${item.name.toLowerCase()}" 
    onclick="openModal('${item.id}')">
      <div class="item-thumb" style="background:${getCatColor(item.category)};overflow:hidden;">${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : item.emoji}</div>
      <div class="item-body">
        <div class="item-name">${item.name}</div>
        <div class="item-loc">📍 ${item.location}</div>
        <div class="item-time">🕒 ${item.time}</div>
        <span class="badge badge-${isLost ? 'lost' : 'returned'}">${isLost ? '🔴 Unclaimed' : '✅ Claimed'}</span>
      </div>
    </div>`;
  }).join('');
}

// ===== HOME STATS =====
function initStats() {
  const lost     = allItems.filter(i => i.status.toLowerCase() === 'lost').length;
  const returned = allItems.filter(i => i.status.toLowerCase() !== 'lost').length;
  const rate     = Math.round((returned / allItems.length) * 100);
  animateNum('statTotal', allItems.length);
  animateNum('statLost', lost);
  animateNum('statReturned', returned);
  document.getElementById('statRate').textContent = rate + '%';
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 30);
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(iv);
  }, 40);
}

// ===== SIDEBAR RECENT =====
function renderSidebarRecent() {
  const el = document.getElementById('sidebarRecent');
  if (!el) return;
  el.innerHTML = allItems.slice(0, 4).map(item => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="openModal('${item.id}')">
      <span style="font-size:22px;">${item.emoji}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
        <div style="font-size:11px;color:var(--text3);">${item.location} · ${item.time}</div>
      </div>
      <span class="badge badge-${item.status.toLowerCase() === 'lost' ? 'lost' : 'returned'}" style="font-size:9px;">${item.status.toLowerCase() === 'lost' ? '🔴' : '✅'}</span>
    </div>
  `).join('');
}

// ===== PAGE NAVIGATION =====
function showPage(name) {
  if (name === 'myreports' && typeof window.loadMyReports === 'function') {
    setTimeout(window.loadMyReports, 100);
  }
  if (name === 'report' && !window._currentUser) {
    showToast("Please login first to report an item! 🔐", "error");
    setTimeout(() => toggleAuthModal(), 600);
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + name);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.id === 'nav-' + name || b.id === 'mnav-' + name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'stats') setTimeout(animateStatsCharts, 300);
}

// ===== SEARCH FILTERS =====
function applyFilters(resetPage = true) {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const checkedFilters = { status: [], category: [], location: [] };
  document.querySelectorAll('.filter-panel input:checked').forEach(cb => {
    const type = cb.getAttribute('data-filter');
    if (type) checkedFilters[type].push(cb.value.toLowerCase());
  });

  // Filter data-level
  searchFilteredItems = allItems.filter(item => {
    const name   = (item.name || '').toLowerCase();
    const cat    = (item.category || '').toLowerCase();
    const status = (item.status || '').toLowerCase();
    const loc    = (item.location || '').toLowerCase();
    const mQ   = !q || name.includes(q) || loc.includes(q);
    const mSt  = !checkedFilters.status.length   || checkedFilters.status.includes(status);
    const mCat = !checkedFilters.category.length || checkedFilters.category.includes(cat);
    const mLoc = !checkedFilters.location.length || checkedFilters.location.some(l => loc.includes(l));
    return mQ && mSt && mCat && mLoc;
  });

  if (resetPage) searchCurrentPage = 1;
  renderSearchPage();
}

function renderSearchPage() {
  const total = searchFilteredItems.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (searchCurrentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = searchFilteredItems.slice(start, start + ITEMS_PER_PAGE);

  renderGrid('searchGrid', pageItems);

  const meta = document.getElementById('resultMeta');
  if (meta) meta.textContent = `Showing ${total} item${total !== 1 ? 's' : ''}`;

  // Render pagination
  const paginationEl = document.getElementById('searchPagination');
  if (!paginationEl) return;

  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

  let btns = '';
  // Prev
  btns += `<button class="page-btn" onclick="goToPage(${searchCurrentPage - 1})" ${searchCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;
  // Pages
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= searchCurrentPage - 2 && i <= searchCurrentPage + 2)) {
      btns += `<button class="page-btn ${i === searchCurrentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === searchCurrentPage - 3 || i === searchCurrentPage + 3) {
      btns += `<span style="padding:0 4px;color:var(--text3);">…</span>`;
    }
  }
  // Next
  btns += `<button class="page-btn" onclick="goToPage(${searchCurrentPage + 1})" ${searchCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;

  paginationEl.innerHTML = btns;
}

function goToPage(page) {
  const totalPages = Math.ceil(searchFilteredItems.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  searchCurrentPage = page;
  renderSearchPage();
  // Scroll to top of grid
  document.getElementById('searchGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('change', e => {
  if (e.target.closest('.filter-panel')) applyFilters();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-panel input').forEach(cb => cb.checked = false);
    applyFilters();
    showToast('Filters cleared', 'success');
  });
});

// ===== CHIPS =====
function quickChip(el, type) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  // Clear other filters and apply chip as filter
  document.querySelectorAll('.filter-panel input').forEach(cb => {
    const ftype = cb.getAttribute('data-filter');
    cb.checked = type && (ftype === 'category' || ftype === 'status') && cb.value.toLowerCase() === type;
  });
  applyFilters(true);
}

// ===== SORT =====
function sortItems() {
  const val = document.getElementById('sortSelect').value;
  searchFilteredItems.sort((a, b) => {
    if (val === 'newest')   return new Date(b.date) - new Date(a.date) || String(b.id).localeCompare(String(a.id));
    if (val === 'oldest')   return new Date(a.date) - new Date(b.date) || String(a.id).localeCompare(String(b.id));
    if (val === 'name')     return (a.name || '').localeCompare(b.name || '');
    if (val === 'category') return (a.category || '').localeCompare(b.category || '');
    return 0;
  });
  searchCurrentPage = 1;
  renderSearchPage();
}

// ===== MODAL =====
function openModal(id) {
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) return;
  window._currentModalItem = item;
  const isLost = item.status.toLowerCase() === 'lost';
  document.getElementById('modalTitle').textContent  = item.name;
  if (item.imageUrl) {
    document.getElementById('modalThumb').innerHTML = `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;cursor:pointer;" onclick="openLightbox('${item.imageUrl}')" title="Click to view full size">`;
  } else {
    document.getElementById('modalThumb').textContent = item.emoji;
  }
  document.getElementById('modalThumb').style.background = getCatColor(item.category);
  document.getElementById('modalBadge').innerHTML    = `<span class="badge badge-${isLost ? 'lost' : 'returned'}">${isLost ? '🔴 Unclaimed' : '✅ Claimed'}</span>`;
  document.getElementById('modalLoc').textContent    = item.location;
  document.getElementById('modalCat').textContent    = item.category.charAt(0).toUpperCase() + item.category.slice(1);
  document.getElementById('modalDate').textContent   = item.date;
  document.getElementById('modalTime').textContent   = item.time;
  document.getElementById('modalDesc').textContent   = item.description;
  // Format nomor: hilangkan karakter non-digit, ganti awalan 0 dengan 62
  // WhatsApp contact
  const rawPhone   = (item.reporterPhone || '').replace(/\D/g, '');
  const waPhone    = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
  const contactMsg = 'Hi, I lost my ' + item.name + '. I saw your report on FoundIt BINUS and I believe it might be mine. Could we arrange the return?';
  const waEl = document.getElementById('modalWa');
  if (waEl) waEl.href = waPhone ? 'https://wa.me/' + waPhone + '?text=' + encodeURIComponent(contactMsg) : '#';

  // Email contact
  const emailEl = document.getElementById('modalEmail');
  if (emailEl) {
    const toEmail = item.reporterEmail || '';
    emailEl.href  = 'mailto:' + toEmail + '?subject=' + encodeURIComponent('Claim for: ' + item.name + ' | FoundIt BINUS') + '&body=' + encodeURIComponent(contactMsg);
  }

  // If current user is the reporter, hide contact section
  const isOwnReport = item.reporterUid && window._currentUser?.uid === item.reporterUid;
  const contactSection = document.getElementById('modalContactSection');
  if (contactSection) contactSection.style.display = isOwnReport ? 'none' : '';

  // Also hide "CONTACT FINDER" label
  const contactLabel = document.querySelector('.modal-body [style*="text-transform:uppercase"]');
  if (contactLabel) contactLabel.style.display = isOwnReport ? 'none' : '';

  // Show/hide own report notice
  let ownNotice = document.getElementById('ownReportNotice');
  if (!ownNotice) {
    ownNotice = document.createElement('div');
    ownNotice.id = 'ownReportNotice';
    ownNotice.style.cssText = 'background:var(--primary-light);color:var(--primary);padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;margin-bottom:8px;';
    ownNotice.textContent = '📋 This is your report. You can manage it in My Reports.';
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) modalBody.appendChild(ownNotice);
  }
  ownNotice.style.display = isOwnReport ? 'block' : 'none';

  document.getElementById('itemModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('itemModal')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('itemModal').classList.remove('open');
  document.body.style.overflow = '';
}

function claimItem() {
  closeModalDirect();
  showToast('Claim submitted! Our team will reach out to you.', 'success');
}

// ===== REPORT =====
function previewImg(input) {
  const file = input.files[0];
  if (!file) return;
  const preview  = document.getElementById('imgPreview');
  const removeBtn = document.getElementById('removePhotoBtn');
  const zone     = preview.closest('.upload-zone');
  preview.src    = URL.createObjectURL(file);
  preview.style.display = 'block';
  if (removeBtn) removeBtn.style.display = 'flex';
  if (zone) zone.querySelectorAll('.upload-ico, p').forEach(el => el.style.display = 'none');
}

function removePhoto(e) {
  e.stopPropagation();
  const preview   = document.getElementById('imgPreview');
  const removeBtn = document.getElementById('removePhotoBtn');
  const fileInput = document.getElementById('imgInput');
  const zone      = preview?.closest('.upload-zone');
  if (preview)   { preview.src = ''; preview.style.display = 'none'; }
  if (removeBtn) removeBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
  if (zone) zone.querySelectorAll('.upload-ico, p').forEach(el => el.style.display = '');
}

function cancelReport() {
  if (!confirm('Clear all fields and cancel this report?')) return;
  ['rName','rPhone','rItem','rDesc','rLine','rInstagram','rTelegram'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const rCat = document.getElementById('rCategory');
  const rLoc = document.getElementById('rLocation');
  if (rCat) rCat.selectedIndex = 0;
  if (rLoc) rLoc.selectedIndex = 0;
  removePhoto({ stopPropagation: () => {} });
  showToast('Report cancelled.', '');
}

// submitReport is defined in firebase.js as window.submitReport

// ===== STATS PAGE =====
function initStatsPage() {
  const lost     = allItems.filter(i => i.status.toLowerCase() === 'lost').length;
  const returned = allItems.length - lost;
  const rate     = Math.round((returned / allItems.length) * 100);
  ['s2Total','s2Lost','s2Ret','s2Rate'].forEach((elId, i) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = [allItems.length, lost, returned, rate + '%'][i];
  });

  // Location list for map
  const locCounts = {};
  allItems.forEach(i => { locCounts[i.location] = (locCounts[i.location] || 0) + 1; });
  const maxLoc = Math.max(...Object.values(locCounts));
  const locEl  = document.getElementById('mapLocList');
  if (locEl) {
    locEl.innerHTML = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).map(([loc, cnt]) => `
      <div class="map-loc-item" onclick="filterByLocation('${loc}')">
        <div class="mli-name">${loc}</div>
        <div class="mli-count">${cnt} item</div>
        <div class="mli-bar"><div class="mli-bar-fill" style="width:${(cnt / maxLoc * 100).toFixed(0)}%"></div></div>
      </div>
    `).join('');
  }
}

function filterByLocation(loc) {
  showPage('search');
  document.getElementById('searchInput').value = loc;
  applyFilters();
}

function animateStatsCharts() {
  // Category bar
  const catCounts = {};
  allItems.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const catColors = { electronics:'#3B82F6', bags:'#F59E0B', documents:'#10B981', keys:'#EF4444', accessories:'#8B5CF6', others:'#6B7280' };
  const maxCat = Math.max(...Object.values(catCounts));
  const catEl  = document.getElementById('catBarChart');
  if (catEl) {
    catEl.innerHTML = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, cnt]) => `
      <div class="bar-item">
        <div class="bar-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:0;background:${catColors[cat] || '#6B7280'}" data-target="${(cnt / maxCat * 100).toFixed(0)}"></div></div>
        <div class="bar-val">${cnt}</div>
      </div>
    `).join('');
    setTimeout(() => {
      catEl.querySelectorAll('.bar-fill').forEach(bar => { bar.style.width = bar.dataset.target + '%'; });
    }, 100);
  }

  // Location bar
  const locCounts = {};
  allItems.forEach(i => { locCounts[i.location] = (locCounts[i.location] || 0) + 1; });
  const maxLoc = Math.max(...Object.values(locCounts));
  const locEl  = document.getElementById('locBarChart');
  if (locEl) {
    locEl.innerHTML = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([loc, cnt]) => `
      <div class="bar-item">
        <div class="bar-label" style="font-size:11.5px;">${loc.length > 12 ? loc.slice(0, 11) + '…' : loc}</div>
        <div class="bar-track"><div class="bar-fill" style="width:0;background:var(--primary)" data-target="${(cnt / maxLoc * 100).toFixed(0)}"></div></div>
        <div class="bar-val">${cnt}</div>
      </div>
    `).join('');
    setTimeout(() => {
      locEl.querySelectorAll('.bar-fill').forEach(bar => { bar.style.width = bar.dataset.target + '%'; });
    }, 100);
  }

  // Donut chart
  const lost     = allItems.filter(i => i.status.toLowerCase() === 'lost').length;
  const returned = allItems.length - lost;
  const circ     = 2 * Math.PI * 54; // ~339.3
  const lostOffset = circ - (lost / allItems.length) * circ;
  const retOffset  = circ - (returned / allItems.length) * circ;
  const retRotate  = (lost / allItems.length) * 360;
  const donutLost  = document.getElementById('donutLost');
  const donutRet   = document.getElementById('donutRet');
  if (donutLost) donutLost.style.strokeDashoffset = lostOffset;
  if (donutRet) {
    donutRet.setAttribute('transform', `rotate(${-90 + retRotate} 70 70)`);
    setTimeout(() => { donutRet.style.strokeDashoffset = retOffset; }, 150);
  }
  const legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = `
      <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div> Unclaimed <span class="legend-pct">${lost} (${Math.round(lost / allItems.length * 100)}%)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div> Claimed <span class="legend-pct">${returned} (${Math.round(returned / allItems.length * 100)}%)</span></div>
    `;
  }

  // Timeline
  const tlEl = document.getElementById('timelineList');
  if (tlEl) {
    tlEl.innerHTML = allItems.slice(0, 8).map((item, i) => {
      const isLost = item.status.toLowerCase() === 'lost';
      return `<div class="tl-item">
        <div class="tl-line">
          <div class="tl-dot" style="background:${isLost ? 'var(--red)' : 'var(--green)'}"></div>
          ${i < 7 ? '<div class="tl-connector"></div>' : ''}
        </div>
        <div class="tl-body">
          <div class="tl-title">${item.emoji} ${item.name}</div>
          <div class="tl-sub">${item.location} · ${item.time} · <span style="color:${isLost ? 'var(--red)' : 'var(--green)'};font-weight:600;">${isLost ? 'Unclaimed' : 'Claimed'}</span></div>
        </div>
      </div>`;
    }).join('');
  }
}

// ===== NAVBAR LIVE SEARCH =====
function initNavSearch() {
  const input    = document.getElementById('navSearchInput');
  const dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { dropdown.classList.remove('open'); return; }
    const results = allItems.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    ).slice(0, 6);

    if (!results.length) {
      dropdown.innerHTML = `<div class="sd-empty">Tidak ada hasil untuk "${input.value}"</div>`;
    } else {
      dropdown.innerHTML = results.map(item => {
        const isLost = item.status.toLowerCase() === 'lost';
        return `<div class="sd-item" onclick="onNavSearchPick('${item.id}')">
          <div class="sd-emoji">${item.emoji}</div>
          <div class="sd-info">
            <div class="sd-name">${item.name}</div>
            <div class="sd-meta">📍 ${item.location} · ${item.time}</div>
          </div>
          <span class="sd-badge ${isLost ? 'lost' : 'returned'}">${isLost ? 'Unclaimed' : 'Claimed'}</span>
        </div>`;
      }).join('');
    }
    dropdown.classList.add('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#navSearchWrap')) dropdown.classList.remove('open');
  });
}

function onNavSearchPick(id) {
  document.getElementById('searchDropdown').classList.remove('open');
  document.getElementById('navSearchInput').value = '';
  openModal(id);
}

// ===== DARK MODE =====
function toggleDark() {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('darkToggle').textContent = isDark ? '🌙' : '☀️';
  // Re-render cards to update gradients
  renderGrid('homeGrid', allItems.filter(i => i.status === 'lost').slice(0, 8));
  searchFilteredItems = allItems;
  renderSearchPage();
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'toast' + (type ? ' ' + type : '') + ' show';
  setTimeout(() => { t.className = 'toast' + (type ? ' ' + type : ''); }, 3000);
}

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});


// ===== AUTH MODAL =====
function toggleAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  if (modal.classList.contains("open")) {
    closeAuthModalDirect();
  } else {
    // Clear all auth form fields before opening
    ["loginEmail","loginPassword","regName","regEmail","regPhone",
     "regPassword","regPasswordConfirm","forgotEmail"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    // Reset to login tab
    switchAuthTab("login");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeAuthModal(e) {
  if (e.target === document.getElementById("authModal")) closeAuthModalDirect();
}

function closeAuthModalDirect() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function switchAuthTab(tab) {
  document.getElementById("formLogin").style.display    = tab === "login"    ? "block" : "none";
  document.getElementById("formRegister").style.display = tab === "register" ? "block" : "none";
  const forgotEl = document.getElementById("formForgot");
  if (forgotEl) forgotEl.style.display = tab === "forgot" ? "block" : "none";

  // Update modal title
  const titleEl = document.getElementById("authModalTitle");
  if (titleEl) {
    if (tab === "login")    titleEl.textContent = "Login to FindIt";
    if (tab === "register") titleEl.textContent = "Create an Account";
    if (tab === "forgot")   titleEl.textContent = "Reset Password";
  }

  const errEl = document.getElementById("authError");
  if (errEl) {
    errEl.style.display = "none";
    errEl.style.background = "";
    errEl.style.color = "";
    errEl.style.border = "";
  }
}

// ===== CLAIM MODAL =====
let _claimTarget = null;

function openClaimForm() {
  if (!window._currentUser) {
    closeModalDirect();
    showToast("Please login first to claim an item! 🔐", "error");
    setTimeout(() => toggleAuthModal(), 600);
    return;
  }

  const item = window._currentModalItem;
  if (!item) return;

  // Prevent finder from claiming their own report
  if (item.reporterUid && window._currentUser.uid === item.reporterUid) {
    showToast("You cannot claim an item that you reported! 🚫", "error");
    return;
  }

  _claimTarget = item;
  const modal   = document.getElementById("claimModal");
  const nameEl  = document.getElementById("claimItemName");
  if (nameEl) nameEl.textContent = "📦 " + item.name + " · " + item.location;

  // Pre-fill if logged in
  const user = window._currentUser;
  if (user) {
    const nameInput = document.getElementById("claimName");
    if (nameInput && !nameInput.value) nameInput.value = user.displayName || "";
    const emailInput = document.getElementById("claimEmail");
    if (emailInput && !emailInput.value) emailInput.value = user.email || "";
  }

  ["claimWA","claimProof"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const tnc = document.getElementById("claimTnC");
  if (tnc) tnc.checked = false;

  // Show finder's social contacts as note in claim form
  const socialsBox     = document.getElementById('claimFinderSocials');
  const socialsContent = document.getElementById('claimFinderSocialsContent');
  if (socialsBox && socialsContent && item) {
    const lines = [];
    if (item.reporterLine)      lines.push('💬 Line: ' + item.reporterLine);
    if (item.reporterInstagram) lines.push('📸 Instagram: ' + item.reporterInstagram);
    if (item.reporterTelegram)  lines.push('✈️ Telegram: ' + item.reporterTelegram);
    if (lines.length > 0) {
      socialsContent.innerHTML = lines.map(l => '<div>' + l + '</div>').join('');
      socialsBox.style.display = 'block';
    } else {
      socialsBox.style.display = 'none';
    }
  }

  if (document.getElementById('claimFormBtns'))    document.getElementById('claimFormBtns').style.display    = 'flex';
  if (document.getElementById('claimSuccessStep')) document.getElementById('claimSuccessStep').style.display = 'none';
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeClaimModal(e) {
  if (e.target === document.getElementById("claimModal")) closeClaimModalDirect();
}

function closeClaimModalDirect() {
  const modal = document.getElementById("claimModal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function submitClaimForm() {
  if (!_claimTarget) return;
  const tnc = document.getElementById("claimTnC");
  if (!tnc || !tnc.checked) {
    window.showToast("Please agree to the Terms & Conditions first! ☝️", "error");
    return;
  }
  window.doSubmitClaim(
    _claimTarget.id,
    _claimTarget.firestoreId || _claimTarget.id.replace("fb_", ""),
    _claimTarget.reporterPhone,
    _claimTarget.reporterName,
    _claimTarget.name
  );
}

// ===== SORT MY REPORTS =====
function sortMyReports() {
  if (typeof window.loadMyReports === 'function') window.loadMyReports();
}
window.sortMyReports = sortMyReports;

// ===== TOGGLE PASSWORD VISIBILITY =====
const EYE_OPEN   = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

function togglePass(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (btn) btn.innerHTML = EYE_CLOSED; // password now visible → show crossed (click to hide)
  } else {
    inp.type = 'password';
    if (btn) btn.innerHTML = EYE_OPEN;   // password now hidden → show open (click to reveal)
  }
}
window.togglePass = togglePass;

// ===== LIGHTBOX =====
function openLightbox(src) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;overflow:auto;';
    document.body.appendChild(lb);
  }

  let zoomed = false;
  lb.innerHTML = `
    <button onclick="document.getElementById('lightbox').style.display='none'" style="position:fixed;top:16px;right:16px;width:40px;height:40px;background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:50%;font-size:22px;cursor:pointer;z-index:10000;display:flex;align-items:center;justify-content:center;">✕</button>
    <img id="lbImg" src="${src}" style="max-width:92vw;max-height:92vh;object-fit:contain;border-radius:10px;box-shadow:0 0 40px rgba(0,0,0,.8);cursor:zoom-in;transition:transform .2s;" title="Click to zoom">`;

  const img = lb.querySelector('#lbImg');
  img.onclick = (e) => {
    e.stopPropagation();
    zoomed = !zoomed;
    img.style.maxWidth  = zoomed ? 'none' : '92vw';
    img.style.maxHeight = zoomed ? 'none' : '92vh';
    img.style.cursor    = zoomed ? 'zoom-out' : 'zoom-in';
    img.style.transform = zoomed ? 'scale(1.8)' : 'scale(1)';
  };
  lb.onclick = (e) => { if (e.target === lb) lb.style.display = 'none'; };
  lb.style.display = 'flex';
}
window.openLightbox  = openLightbox;
window.removePhoto   = removePhoto;
window.cancelReport  = cancelReport;

// ===== COPY FINDER CONTACT =====
function copyFinderContact() {
  const item = window._currentModalItem;
  if (!item) return;
  const parts = ['FoundIt BINUS - Found Item', 'Item: ' + item.name, 'Location: ' + item.location, 'Finder: ' + item.reporterName, 'WhatsApp: ' + item.reporterPhone];
  if (item.reporterEmail)     parts.push('Email: ' + item.reporterEmail);
  if (item.reporterLine)      parts.push('Line: ' + item.reporterLine);
  if (item.reporterInstagram) parts.push('Instagram: ' + item.reporterInstagram);
  if (item.reporterTelegram)  parts.push('Telegram: ' + item.reporterTelegram);
  navigator.clipboard.writeText(parts.join('\n')).then(() => showToast('Contact info copied!', 'success')).catch(() => showToast('Copy failed', 'error'));
}

// ===== SEND CLAIM VIA CHANNEL =====
function sendClaimVia(channel) {
  const data = window._claimContactData;
  if (!data) return;
  if (channel === 'wa') window.open(data.waUrl, '_blank');
  else if (channel === 'email' && data.emailUrl) window.open(data.emailUrl);
  else if (channel === 'copy') navigator.clipboard.writeText(data.message).then(() => showToast('Message copied!', 'success'));
}

// ===== EXPOSE FUNCTIONS TO WINDOW (needed by firebase.js module) =====
window.renderGrid        = renderGrid;
window.initStats         = initStats;
window.initStatsPage     = initStatsPage;
window.renderSidebarRecent = renderSidebarRecent;
window.applyFilters      = applyFilters;
window.goToPage          = goToPage;
window.renderSearchPage  = renderSearchPage;
window.animateStatsCharts = animateStatsCharts;
window.showToast         = showToast;
window.openModal         = openModal;
window.copyFinderContact = copyFinderContact;
window.sendClaimVia      = sendClaimVia;
window.toggleAuthModal   = toggleAuthModal;
window.closeAuthModal    = closeAuthModal;
window.closeAuthModalDirect = closeAuthModalDirect;
window.switchAuthTab     = switchAuthTab;
window.openClaimForm     = openClaimForm;
window.closeClaimModal   = closeClaimModal;
window.closeClaimModalDirect = closeClaimModalDirect;
window.submitClaimForm   = submitClaimForm;