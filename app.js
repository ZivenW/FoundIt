// ===== DATA =====
const ITEMS = [
  {id:1,name:"AirPods Pro",category:"electronics",location:"Library",status:"lost",time:"2 hours ago",date:"2024-06-03",emoji:"🎧",description:"AirPods Pro with a dark blue silicone case. Last seen on a table on the 2nd floor."},
  {id:2,name:"Black Leather Wallet",category:"bags",location:"Canteen",status:"lost",time:"5 hours ago",date:"2024-06-03",emoji:"👛",description:"Black leather wallet, Braun Buffel brand. Contains student ID and several important cards."},
  {id:3,name:"Student ID Card",category:"documents",location:"LAB",status:"Returned",time:"1 day ago",date:"2024-06-02",emoji:"🪪",description:"Student ID card under the name Budi Santoso, found in Computer Lab 3."},
  {id:4,name:"Water Bottle",category:"others",location:"Others",status:"lost",time:"2 days ago",date:"2024-06-01",emoji:"🍶",description:"Black Corkcicle tumbler, 16oz. Lost near the motorcycle parking area."},
  {id:5,name:"Car Keys",category:"keys",location:"Library",status:"Returned",time:"2 days ago",date:"2024-06-01",emoji:"🔑",description:"Toyota car key with a small bear keychain, found in the library lobby."},
  {id:6,name:"Laptop Asus ROG",category:"electronics",location:"Classroom",status:"lost",time:"3 days ago",date:"2024-05-31",emoji:"💻",description:"Black Asus ROG gaming laptop. Left behind in a 3rd floor classroom."},
  {id:7,name:"Calculus Textbook",category:"documents",location:"Library",status:"Returned",time:"4 days ago",date:"2024-05-30",emoji:"📘",description:"Calculus textbook 9th edition, found at a floor-level study table in the library."},
  {id:8,name:"Digital Watch",category:"accessories",location:"Canteen",status:"lost",time:"4 days ago",date:"2024-05-30",emoji:"⌚",description:"Silver Casio watch. Lost while washing hands at the canteen sink."},
  {id:9,name:"Backpack",category:"bags",location:"Classroom",status:"Returned",time:"1 week ago",date:"2024-05-27",emoji:"🎒",description:"Maroon Jansport backpack found left under a chair in classroom 301."},
  {id:10,name:"Smartwatch Samsung",category:"electronics",location:"Others",status:"Returned",time:"1 week ago",date:"2024-05-27",emoji:"⌚",description:"Samsung Galaxy Watch found in the campus area."},
  {id:11,name:"Geometry Set",category:"others",location:"Classroom",status:"lost",time:"1 week ago",date:"2024-05-26",emoji:"📐",description:"A set of compass and ruler tools lost in the classroom area."},
  {id:12,name:"Blue Folder",category:"documents",location:"Others",status:"Returned",time:"1 week ago",date:"2024-05-25",emoji:"📂",description:"Blue folder containing lab report assignments, found in the 1st floor corridor."},
  {id:13,name:"House Keys",category:"keys",location:"Parking Area",status:"lost",time:"1 week ago",date:"2024-05-24",emoji:"🔑",description:"House keychain with a small knitted doll, lost in the motorcycle parking area."},
  {id:14,name:"Sony Headphones",category:"electronics",location:"Library",status:"Returned",time:"1 week ago",date:"2024-05-23",emoji:"🎧",description:"Sony WH-1000XM4 headphones found in the audio discussion room."},
  {id:15,name:"Brown Satchel",category:"bags",location:"Canteen",status:"lost",time:"1 week ago",date:"2024-05-22",emoji:"💼",description:"Brown satchel bag left on a canteen table during lunch hour."},
  {id:16,name:"Lab Coat",category:"others",location:"LAB",status:"Returned",time:"2 weeks ago",date:"2024-05-21",emoji:"🥼",description:"White lab coat with name embroidery, found in the Basic Chemistry Lab."},
  {id:17,name:"Flash Drive 64GB",category:"electronics",location:"Library",status:"lost",time:"2 weeks ago",date:"2024-05-20",emoji:"💾",description:"Red SanDisk USB drive lost after using a public computer."},
  {id:18,name:"Casio Calculator",category:"electronics",location:"Classroom",status:"Returned",time:"2 weeks ago",date:"2024-05-19",emoji:"🧮",description:"Casio fx-991EX calculator found in a desk drawer in classroom D302."},
  {id:19,name:"Kindle E-reader",category:"electronics",location:"Library",status:"lost",time:"2 weeks ago",date:"2024-05-18",emoji:"📖",description:"Kindle Paperwhite with a gray case, lost in the sofa area."},
  {id:20,name:"Mechanical Pencil",category:"others",location:"LAB",status:"Returned",time:"2 weeks ago",date:"2024-05-17",emoji:"✏️",description:"Rotring 600 mechanical pencil found in the Technical Drawing Lab."},
  {id:21,name:"Umbrella Black",category:"others",location:"Canteen",status:"lost",time:"2 weeks ago",date:"2024-05-16",emoji:"☂️",description:"Black folding umbrella lost when left at the umbrella stand in front of the canteen."},
  {id:22,name:"Bike Lock Key",category:"keys",location:"Parking Area",status:"Returned",time:"2 weeks ago",date:"2024-05-15",emoji:"🔑",description:"Bicycle padlock key found on the ground in the bicycle parking area."},
  {id:23,name:"Student Card",category:"documents",location:"Others",status:"lost",time:"3 weeks ago",date:"2024-05-14",emoji:"🪪",description:"Engineering faculty student ID card lost in the campus area."},
  {id:24,name:"Water Flask",category:"others",location:"Others",status:"Returned",time:"3 weeks ago",date:"2024-05-13",emoji:"🍶",description:"Yellow Hydro Flask found near the canteen area."},
  {id:25,name:"Gym Bag Blue",category:"bags",location:"Others",status:"lost",time:"3 weeks ago",date:"2024-05-12",emoji:"🎒",description:"Blue Adidas sports bag lost in the campus area."},
  {id:26,name:"Wireless Mouse",category:"electronics",location:"LAB",status:"Returned",time:"3 weeks ago",date:"2024-05-11",emoji:"🖱️",description:"Logitech Pebble mouse found in the Multimedia Lab."},
  {id:27,name:"Charging Cable",category:"electronics",location:"Canteen",status:"lost",time:"3 weeks ago",date:"2024-05-10",emoji:"🔌",description:"Anker USB-C charging cable lost near an outlet in the canteen."},
  {id:28,name:"Silver Earring",category:"accessories",location:"Library",status:"Returned",time:"3 weeks ago",date:"2024-05-09",emoji:"👂",description:"One silver earring found under the carpet in the reading area."},
  {id:29,name:"Sunglasses",category:"accessories",location:"Others",status:"lost",time:"4 weeks ago",date:"2024-05-08",emoji:"🕶️",description:"Black Ray-Ban sunglasses lost in the garden in front of the rector's building."},
  {id:30,name:"Thesis Draft",category:"documents",location:"Others",status:"Returned",time:"4 weeks ago",date:"2024-05-07",emoji:"📄",description:"A bundle of thesis draft papers found at the campus bus stop."},
  {id:31,name:"Keycard",category:"keys",location:"Others",status:"lost",time:"4 weeks ago",date:"2024-05-06",emoji:"💳",description:"Robotics lab access card lost. Please report immediately if found."},
  {id:32,name:"Camera Mirrorless",category:"electronics",location:"Others",status:"Returned",time:"4 weeks ago",date:"2024-05-05",emoji:"📷",description:"Fujifilm X-T30 mirrorless camera found in the gazebo area."},
  {id:33,name:"Scarf Red",category:"accessories",location:"Canteen",status:"lost",time:"1 month ago",date:"2024-05-04",emoji:"🧣",description:"Red knitted scarf lost near the coffee stand."},
  {id:34,name:"Hard Drive",category:"electronics",location:"Library",status:"Returned",time:"1 month ago",date:"2024-05-03",emoji:"🗄️",description:"WD 1TB external hard drive found near the printer."},
  {id:35,name:"Pencil Case",category:"bags",location:"Classroom",status:"lost",time:"1 month ago",date:"2024-05-02",emoji:"✏️",description:"Floral-patterned pencil case lost in classroom 404."},
  {id:36,name:"Hand Sanitizer",category:"others",location:"Others",status:"Returned",time:"1 month ago",date:"2024-05-01",emoji:"🧴",description:"Large hand sanitizer bottle found in the auditorium area."},
  {id:37,name:"Notebook A5",category:"documents",location:"Library",status:"lost",time:"1 month ago",date:"2024-04-30",emoji:"📓",description:"Black Moleskine notebook lost, contains important lecture notes."},
  {id:38,name:"iPad Pro",category:"electronics",location:"Classroom",status:"Returned",time:"1 month ago",date:"2024-04-29",emoji:"📱",description:"iPad Pro 11 inch found left behind in the classroom lobby area."},
  {id:39,name:"Tan Wallet",category:"bags",location:"Parking Area",status:"lost",time:"1 month ago",date:"2024-04-28",emoji:"👛",description:"Small tan wallet lost near the north gate parking area."},
  {id:40,name:"Sports Cap",category:"accessories",location:"Others",status:"Returned",time:"1 month ago",date:"2024-04-27",emoji:"🧢",description:"Blue New Era cap found in the parking area."}
];

window.allItems = [...ITEMS];

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
  renderGrid('searchGrid', allItems);
  renderSidebarRecent();
  initStatsPage();
  initNavSearch();
});

// ===== RENDER GRID =====
function renderGrid(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">🔍</div><p>Tidak ada item yang cocok</p></div>`;
    return;
  }
  el.innerHTML = items.map(item => {
    const isLost = item.status.toLowerCase() === 'lost';
    const thumbInner = item.imageUrl
      ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
      : item.emoji;
    return `<div class="item-card" data-id="${item.id}" data-category="${item.category}" 
    data-status="${item.status.toLowerCase()}" data-location="${item.location.toLowerCase()}" data-name="${item.name.toLowerCase()}" 
    style="cursor:pointer;">
      <div class="item-thumb" style="background:${getCatColor(item.category)};overflow:hidden;">${thumbInner}</div>
      <div class="item-body">
        <div class="item-name">${item.name}</div>
        <div class="item-loc">📍 ${item.location}</div>
        <div class="item-time">🕒 ${item.time}</div>
        <span class="badge badge-${isLost ? 'lost' : 'returned'}">${isLost ? '🔴 Unclaimed' : '✅ Claimed'}</span>
      </div>
    </div>`;
  }).join('');
}

// ===== CARD CLICK — event delegation =====
document.addEventListener('click', function(e) {
  const card = e.target.closest('.item-card');
  if (!card) return;
  const id = card.dataset.id;
  if (id) openModal(id);
});

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
function applyFilters() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const checkedFilters = { status: [], category: [], location: [] };
  document.querySelectorAll('.filter-panel input:checked').forEach(cb => {
    const type = cb.getAttribute('data-filter');
    if (type) checkedFilters[type].push(cb.value.toLowerCase());
  });
  const cards = document.querySelectorAll('#searchGrid .item-card');
  let visible = 0;
  cards.forEach(card => {
    const name   = card.dataset.name || '';
    const cat    = card.dataset.category || '';
    const status = card.dataset.status || '';
    const loc    = card.dataset.location || '';
    const mQ   = !q || name.includes(q) || loc.includes(q);
    const mSt  = !checkedFilters.status.length   || checkedFilters.status.includes(status);
    const mCat = !checkedFilters.category.length || checkedFilters.category.includes(cat);
    const mLoc = !checkedFilters.location.length || checkedFilters.location.some(l => loc.includes(l));
    const show = mQ && mSt && mCat && mLoc;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const meta = document.getElementById('resultMeta');
  if (meta) meta.textContent = `Menampilkan ${visible} item`;
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
  const cards = document.querySelectorAll('#searchGrid .item-card');
  let visible = 0;
  cards.forEach(card => {
    const cat    = card.dataset.category;
    const status = card.dataset.status;
    const show   = !type || cat === type || status === type;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const meta = document.getElementById('resultMeta');
  if (meta) meta.textContent = `Menampilkan ${visible} item`;
}

// ===== SORT =====
function sortItems() {
  const val  = document.getElementById('sortSelect').value;
  const grid = document.getElementById('searchGrid');
  const cards = [...grid.querySelectorAll('.item-card')];
  cards.sort((a, b) => {
    if (val === 'newest')   return b.dataset.id - a.dataset.id;
    if (val === 'oldest')   return a.dataset.id - b.dataset.id;
    if (val === 'name')     return (a.dataset.name || '').localeCompare(b.dataset.name || '');
    if (val === 'category') return (a.dataset.category || '').localeCompare(b.dataset.category || '');
    return 0;
  });
  cards.forEach(c => grid.appendChild(c));
}

// ===== MODAL =====
function openModal(id) {
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) return;
  const isLost = item.status.toLowerCase() === 'lost';
  document.getElementById('modalTitle').textContent  = item.name;
  if (item.imageUrl) {
    document.getElementById('modalThumb').innerHTML = '<img src="' + item.imageUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">';
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
  const rawPhone = (item.reporterPhone || '628123456789').replace(/\D/g, '');
  const waPhone  = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
  const waMsg    = 'Halo, saya kehilangan ' + item.name + '. Saya melihat laporan Anda di FindIt BINUS dan sepertinya itu milik saya. Boleh saya mengambilnya?';
  document.getElementById('modalWa').href = 'https://wa.me/' + waPhone + '?text=' + encodeURIComponent(waMsg);
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
  const preview = document.getElementById('imgPreview');
  preview.src   = URL.createObjectURL(file);
  preview.style.display = 'block';
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
  renderGrid('searchGrid', allItems);
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

// ===== EXPOSE FUNCTIONS TO WINDOW (needed by firebase.js module) =====
window.renderGrid        = renderGrid;
window.initStats         = initStats;
window.initStatsPage     = initStatsPage;
window.renderSidebarRecent = renderSidebarRecent;
window.applyFilters      = applyFilters;
window.animateStatsCharts = animateStatsCharts;
window.showToast         = showToast;
window.openModal         = openModal;