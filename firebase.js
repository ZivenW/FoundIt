// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, orderBy, query,
  doc, updateDoc, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2Rrybe71YfR4uzmU1QLAPDrvA9_txLN4",
  authDomain: "lostnfound-67b99.firebaseapp.com",
  projectId: "lostnfound-67b99",
  storageBucket: "lostnfound-67b99.firebasestorage.app",
  messagingSenderId: "1060796180291",
  appId: "1:1060796180291:web:172d0953f09d373d9331f6",
  measurementId: "G-29H8BFG7YC"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ===== EMOJI MAP =====
const EMOJI_MAP = {
  electronics: "💻", bags: "🎒", documents: "📄",
  keys: "🔑", accessories: "👓", others: "📦"
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 3600)   return Math.floor(diff / 60) + " minutes ago";
  if (diff < 86400)  return Math.floor(diff / 3600) + " hours ago";
  if (diff < 604800) return Math.floor(diff / 86400) + " days ago";
  return Math.floor(diff / 604800) + " weeks ago";
}

// ===== KOMPRES GAMBAR =====
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
        else       { if (h > MAX) { w = w * MAX / h; h = MAX; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ===== AUTH STATE LISTENER =====
onAuthStateChanged(auth, (user) => {
  const authBtn      = document.getElementById("authNavBtn");
  const userName     = document.getElementById("authUserName");
  const navMyReports = document.getElementById("nav-myreports");
  const mnavMyRep    = document.getElementById("mnav-myreports");

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    if (authBtn)      { authBtn.textContent = "Logout"; authBtn.onclick = doLogout; }
    if (userName)     { userName.textContent = "👤 " + name; userName.style.display = "block"; }
    if (navMyReports) navMyReports.style.display = "block";
    if (mnavMyRep)    mnavMyRep.style.display    = "block";
  } else {
    if (authBtn)      { authBtn.textContent = "Login"; authBtn.onclick = window.toggleAuthModal; }
    if (userName)     userName.style.display = "none";
    if (navMyReports) navMyReports.style.display = "none";
    if (mnavMyRep)    mnavMyRep.style.display    = "none";
  }
  window._currentUser = user;
});

// ===== LOAD REPORTS DARI FIRESTORE (realtime) =====
document.addEventListener("DOMContentLoaded", () => {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const firestoreItems = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
      firestoreItems.push({
        id:            "fb_" + docSnap.id,
        firestoreId:   docSnap.id,
        name:          d.item || "Unknown Item",
        category:      d.category || "others",
        location:      d.location || "Unknown",
        status:        d.status || "lost",
        time:          timeAgo(createdAt),
        date:          createdAt.toISOString().split("T")[0],
        emoji:         EMOJI_MAP[d.category] || "📦",
        imageUrl:      d.imageUrl || null,
        description:   d.desc || "-",
        reporterName:  d.name  || "",
        reporterPhone: d.phone || "",
        reporterUid:   d.reporterUid || null,
        fromFirestore: true,
      });
    });

    const localItems = window.allItems.filter(i => !i.fromFirestore);
    window.allItems = [...firestoreItems, ...localItems];

    window.renderGrid("homeGrid", window.allItems.filter(i => i.status === "lost").slice(0, 8));
    window.renderGrid("searchGrid", window.allItems);
    window.renderSidebarRecent();
    window.initStats();
    window.initStatsPage();
    window.applyFilters();
  });
});

// ===== SUBMIT REPORT =====
window.submitReport = async function () {
  if (!auth.currentUser) {
    window.showToast("Login dulu untuk melaporkan barang! 🔐", "error");
    setTimeout(() => window.toggleAuthModal(), 600);
    return;
  }
  const item      = document.getElementById("rItem").value.trim();
  const category  = document.getElementById("rCategory").value;
  const location  = document.getElementById("rLocation").value;
  const desc      = document.getElementById("rDesc").value.trim();
  const name      = document.getElementById("rName").value.trim();
  const phone     = document.getElementById("rPhone").value.trim();
  const fileInput = document.getElementById("imgInput");
  const file      = fileInput?.files[0] || null;

  if (!item || !category || !location || !name || !phone) {
    window.showToast("Lengkapi semua field terlebih dahulu!", "error");
    return;
  }

  try {
    window.showToast("Menyimpan laporan...", "");

    let imageUrl = null;
    if (file) imageUrl = await compressImage(file);

    await addDoc(collection(db, "reports"), {
      item, category, location, desc, name, phone, imageUrl,
      reporterUid: auth.currentUser?.uid || null,
      status:      "lost",
      createdAt:   new Date()
    });

    window.showToast("Report berhasil dikirim! ✅", "success");
    ["rItem","rCategory","rLocation","rDesc","rName","rPhone"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    if (fileInput) fileInput.value = "";
    const preview = document.getElementById("imgPreview");
    if (preview) { preview.src = ""; preview.style.display = "none"; }

  } catch (error) {
    console.error("Firebase error:", error);
    window.showToast("Gagal menyimpan data ❌", "error");
  }
};

// ===== SUBMIT CLAIM =====
window.doSubmitClaim = async function(reportId, firestoreId, reporterPhone, reporterName, itemName) {
  const claimerName  = document.getElementById("claimName").value.trim();
  const claimerWA    = document.getElementById("claimWA").value.trim();
  const claimerEmail = document.getElementById("claimEmail").value.trim();
  const claimerProof = document.getElementById("claimProof").value.trim();

  if (!claimerName || !claimerWA || !claimerEmail || !claimerProof) {
    window.showToast("Lengkapi semua field klaim!", "error");
    return;
  }

  try {
    window.showToast("Mengirim klaim...", "");

    await addDoc(collection(db, "claims"), {
      reportId:      firestoreId,
      itemName,
      claimerName, claimerWA, claimerEmail, claimerProof,
      reporterPhone,
      reporterName,
      claimerUid:    auth.currentUser?.uid || null,
      status:        "pending",
      createdAt:     new Date()
    });

    // WA notification ke finder
    const rawPhone = (reporterPhone || "").replace(/\D/g, "");
    const waPhone  = rawPhone.startsWith("0") ? "62" + rawPhone.slice(1) : rawPhone;
    const waMsg    = `Halo ${reporterName}, ada yang mengklaim barang "${itemName}" yang kamu laporkan di FindIt BINUS!\n\nNama: ${claimerName}\nWA: ${claimerWA}\nEmail: ${claimerEmail}\nBukti: ${claimerProof}\n\nLogin ke FindIt untuk verifikasi klaim ini.`;
    const waUrl    = "https://wa.me/" + waPhone + "?text=" + encodeURIComponent(waMsg);

    window.showToast("Klaim berhasil dikirim! Penemu akan menghubungimu ✅", "success");
    window.closeClaimModalDirect();

    // Buka WA ke finder
    setTimeout(() => window.open(waUrl, "_blank"), 800);

  } catch (error) {
    console.error("Claim error:", error);
    window.showToast("Gagal mengirim klaim ❌", "error");
  }
};

// ===== LOAD MY REPORTS =====
window.loadMyReports = async function() {
  const user = auth.currentUser;
  if (!user) {
    document.getElementById("myReportsList").innerHTML =
      '<div style="text-align:center;padding:40px;color:var(--text3);">Login dulu untuk melihat laporan kamu.</div>';
    return;
  }

  const container = document.getElementById("myReportsList");
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);">Loading...</div>';

  try {
    // Get my reports
    // Query tanpa orderBy biar ga butuh composite index
    const rQuery = query(collection(db, "reports"), where("reporterUid", "==", user.uid));
    const rSnap  = await getDocs(rQuery);

    // Sort client-side by createdAt desc
    const sortedDocs = [...rSnap.docs].sort((a, b) => {
      const ta = a.data().createdAt?.toDate?.() || new Date(0);
      const tb = b.data().createdAt?.toDate?.() || new Date(0);
      return tb - ta;
    });

    if (rSnap.empty) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);">Kamu belum pernah melaporkan barang. <b style="color:var(--primary);cursor:pointer;" onclick="showPage(\'report\')">Report sekarang →</b></div>';
      return;
    }

    // Get claims for my reports
    const myReportIds = sortedDocs.map(d => d.id);
    let claimsMap = {};

    for (const rid of myReportIds) {
      const cQuery = query(collection(db, "claims"), where("reportId", "==", rid));
      const cSnap  = await getDocs(cQuery);
      claimsMap[rid] = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Render
    container.innerHTML = sortedDocs.map(docSnap => {
      const r      = docSnap.data();
      const claims = claimsMap[docSnap.id] || [];
      const emoji  = EMOJI_MAP[r.category] || "📦";
      const status = r.status === "lost" ? "🔴 Unclaimed" : "✅ Claimed";
      const claimsHtml = claims.length === 0
        ? '<div style="color:var(--text3);font-size:13px;padding:10px 0;">Belum ada yang mengklaim.</div>'
        : claims.map(c => `
          <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-top:10px;border-left:3px solid ${c.status === 'accepted' ? 'var(--green)' : 'var(--primary)'};">
            <div style="font-weight:700;font-size:14px;color:var(--text);">${c.claimerName} ${c.status === 'accepted' ? '<span style="color:var(--green);font-size:12px;">✅ Diterima</span>' : '<span style="color:var(--primary);font-size:12px;">⏳ Pending</span>'}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px;">📱 ${c.claimerWA} &nbsp;|&nbsp; 📧 ${c.claimerEmail}</div>
            <div style="font-size:13px;color:var(--text2);margin-top:8px;font-style:italic;">"${c.claimerProof}"</div>
            ${c.status !== 'accepted' ? `
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button onclick="window.acceptClaim('${c.id}','${docSnap.id}','${c.claimerWA}','${c.claimerName}')" style="flex:1;padding:8px;background:var(--green);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">✅ Verifikasi & Claimed</button>
              <a href="https://wa.me/${c.claimerWA.replace(/\D/g,'')}?text=${encodeURIComponent('Halo '+c.claimerName+', kami konfirmasi bahwa barang '+r.item+' memang milik kamu. Silakan hubungi kami untuk pengambilan!')}" target="_blank" style="flex:1;padding:8px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;text-decoration:none;text-align:center;">📱 Chat via WA</a>
            </div>` : ''}
          </div>`).join('');

      return `
        <div style="background:var(--surface);border-radius:14px;border:1px solid var(--border);padding:16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:48px;height:48px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">${emoji}</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:15px;color:var(--text);">${r.item}</div>
              <div style="font-size:12px;color:var(--text3);">📍 ${r.location} &nbsp;|&nbsp; ${status}</div>
            </div>
            ${r.status === 'lost' ? '' : '<span style="background:#D1FAE5;color:#065F46;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;">Claimed</span>'}
          </div>
          <div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:4px;">📥 Klaim Masuk (${claims.length})</div>
          ${claimsHtml}
        </div>`;
    }).join('');

  } catch (error) {
    console.error(error);
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red);">Gagal memuat data. Pastikan kamu sudah login.</div>';
  }
};

// ===== ACCEPT CLAIM =====
window.acceptClaim = async function(claimId, reportId, claimerWA, claimerName) {
  try {
    await updateDoc(doc(db, "claims", claimId), { status: "accepted" });
    await updateDoc(doc(db, "reports", reportId), { status: "returned" });
    window.showToast("Klaim diterima! Status diupdate ke Claimed ✅", "success");
    window.loadMyReports(); // Refresh
  } catch (error) {
    console.error(error);
    window.showToast("Gagal update status ❌", "error");
  }
};

// ===== AUTH FUNCTIONS =====
window.doLogin = async function() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("authError");
  errEl.style.display = "none";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.closeAuthModalDirect();
    window.showToast("Login berhasil! 👋", "success");
  } catch (e) {
    errEl.textContent = "Email atau password salah.";
    errEl.style.display = "block";
  }
};

window.doRegister = async function() {
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const phone    = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const errEl    = document.getElementById("authError");
  errEl.style.display = "none";

  if (!name || !email || !phone || !password) {
    errEl.textContent = "Lengkapi semua field.";
    errEl.style.display = "block";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    window.closeAuthModalDirect();
    window.showToast("Registrasi berhasil! Selamat datang 🎉", "success");
  } catch (e) {
    errEl.textContent = e.code === "auth/email-already-in-use"
      ? "Email sudah digunakan."
      : "Registrasi gagal: " + e.message;
    errEl.style.display = "block";
  }
};

window.doLogout = async function() {
  await signOut(auth);
  window.showToast("Berhasil logout.", "");
};
