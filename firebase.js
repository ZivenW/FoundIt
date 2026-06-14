// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, orderBy, query,
  doc, updateDoc, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail
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

// ===== PENDING CLAIMS BADGE =====
async function updateClaimsBadge(user) {
  const badge = document.getElementById('myReportsBadge');
  if (!badge || !user) return;
  try {
    const rSnap = await getDocs(query(collection(db, "reports"), where("reporterUid", "==", user.uid)));
    if (rSnap.empty) { badge.style.display = 'none'; return; }
    let pendingCount = 0;
    for (const rDoc of rSnap.docs) {
      const cSnap = await getDocs(query(collection(db, "claims"), where("reportId", "==", rDoc.id), where("status", "==", "pending")));
      pendingCount += cSnap.size;
    }
    if (pendingCount > 0) {
      badge.textContent = pendingCount > 9 ? '9+' : pendingCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch(e) { badge.style.display = 'none'; }
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
    updateClaimsBadge(user);
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
        reporterPhone:     d.phone || "",
        reporterEmail:     d.reporterEmail || null,
        reporterLine:      d.lineId || null,
        reporterInstagram: d.instagram || null,
        reporterTelegram:  d.telegram || null,
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
    window.showToast("Please login first to report an item! 🔐", "error");
    setTimeout(() => window.toggleAuthModal(), 600);
    return;
  }
  const item      = document.getElementById("rItem").value.trim();
  const category  = document.getElementById("rCategory").value;
  const location  = document.getElementById("rLocation").value;
  const desc      = document.getElementById("rDesc").value.trim();
  const name      = document.getElementById("rName").value.trim();
  const rawPhone62 = document.getElementById("rPhone").value.trim().replace(/[^0-9]/g, "");
  const phone      = rawPhone62 ? "62" + (rawPhone62.startsWith("62") ? rawPhone62.slice(2) : rawPhone62.startsWith("0") ? rawPhone62.slice(1) : rawPhone62) : "";
  const fileInput  = document.getElementById("imgInput");
  const file       = fileInput?.files[0] || null;
  const lineId     = document.getElementById("rLine")?.value.trim() || null;
  const instagram  = document.getElementById("rInstagram")?.value.trim() || null;
  const telegram   = document.getElementById("rTelegram")?.value.trim() || null;

  if (!item || !category || !location || !name || !phone) {
    window.showToast("Please fill in all required fields!", "error");
    return;
  }

  try {
    window.showToast("Saving your report...", "");

    let imageUrl = null;
    if (file) imageUrl = await compressImage(file);

    await addDoc(collection(db, "reports"), {
      item, category, location, desc, name, phone, imageUrl,
      reporterUid:   auth.currentUser?.uid || null,
      reporterEmail: auth.currentUser?.email || null,
      lineId, instagram, telegram,
      status:        "lost",
      createdAt:   new Date()
    });

    window.showToast("Report submitted successfully! ✅", "success");
    ["rItem","rCategory","rLocation","rDesc","rName","rPhone"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    if (fileInput) fileInput.value = "";
    ["rLine","rInstagram","rTelegram"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const preview = document.getElementById("imgPreview");
    if (preview) { preview.src = ""; preview.style.display = "none"; }

  } catch (error) {
    console.error("Firebase error:", error);
    window.showToast("Failed to save data ❌", "error");
  }
};

// ===== SUBMIT CLAIM =====
window.doSubmitClaim = async function(reportId, firestoreId, reporterPhone, reporterName, itemName) {
  const claimerName  = document.getElementById("claimName").value.trim();
  const rawClaimWA   = document.getElementById("claimWA").value.trim().replace(/[^0-9]/g, "");
  const claimerWA    = rawClaimWA ? "62" + (rawClaimWA.startsWith("62") ? rawClaimWA.slice(2) : rawClaimWA.startsWith("0") ? rawClaimWA.slice(1) : rawClaimWA) : "";
  const claimerEmail = document.getElementById("claimEmail").value.trim();
  const claimerProof = document.getElementById("claimProof").value.trim();

  if (!claimerName || !claimerWA || !claimerEmail || !claimerProof) {
    window.showToast("Please fill in all claim fields!", "error");
    return;
  }

  // Prevent self-claiming
  const currentItem = window._currentModalItem;
  if (currentItem?.reporterUid && auth.currentUser?.uid === currentItem.reporterUid) {
    window.showToast("You cannot claim your own report! 🚫", "error");
    return;
  }

  try {
    window.showToast("Submitting claim...", "");

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
    const claimerMajor = document.getElementById("claimMajor")?.value || "";
    const claimMsg = "Hi " + reporterName + "!\n\n" +
      "My name is " + claimerName + (claimerMajor ? " (" + claimerMajor + " - BINUS Medan)" : "") + ".\n" +
      "I think you found my " + itemName + "!\n\n" +
      "Proof of Ownership:\n\"" + claimerProof + "\"\n\n" +
      "You can reach me at:\n" +
      "WhatsApp: " + claimerWA + "\n" +
      "Email: " + claimerEmail + "\n\n" +
      "Thank you so much! I hope we can arrange the return.";
    const waUrl    = "https://wa.me/" + waPhone + "?text=" + encodeURIComponent(claimMsg);
    const emailUrl = "mailto:" + (reporterPhone.includes("@") ? reporterPhone : "") + 
                     "?subject=" + encodeURIComponent("Claim for: " + itemName + " | FoundIt BINUS") +
                     "&body=" + encodeURIComponent(claimMsg);

    // Store contact data for channel picker
    window._claimContactData = { waUrl, emailUrl: emailUrl || null, message: claimMsg };

    // Show channel picker instead of auto-opening WA
    const formBtns    = document.getElementById("claimFormBtns");
    const successStep = document.getElementById("claimSuccessStep");
    if (formBtns)    formBtns.style.display    = "none";
    if (successStep) successStep.style.display = "block";
    window.showToast("Claim submitted! ✅", "success");

  } catch (error) {
    console.error("Claim error:", error);
    window.showToast("Failed to submit claim ❌", "error");
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
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--text3);">
          <div style="font-size:52px;margin-bottom:16px;">📭</div>
          <div style="font-size:17px;font-weight:700;color:var(--text2);margin-bottom:8px;">No reports yet</div>
          <div style="font-size:13px;margin-bottom:24px;">You haven't reported any found items yet.<br>Help someone get their belongings back!</div>
          <button onclick="showPage('report')" style="padding:11px 28px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;">📋 Report a Found Item</button>
        </div>`;
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
        ? '<div style="color:var(--text3);font-size:13px;padding:10px 0;">No claims yet.</div>'
        : claims.map(c => `
          <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-top:10px;border-left:3px solid ${c.status === 'accepted' ? 'var(--green)' : 'var(--primary)'};">
            <div style="font-weight:700;font-size:14px;color:var(--text);">${c.claimerName} ${c.status === 'accepted' ? '<span style="color:var(--green);font-size:12px;">✅ Accepted</span>' : '<span style="color:var(--primary);font-size:12px;">⏳ Pending</span>'}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px;">📱 ${c.claimerWA} &nbsp;|&nbsp; 📧 ${c.claimerEmail}</div>
            <div style="font-size:13px;color:var(--text2);margin-top:8px;font-style:italic;">"${c.claimerProof}"</div>
            ${c.status !== 'accepted' ? `
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button onclick="window.acceptClaim('${c.id}','${docSnap.id}','${c.claimerWA}','${c.claimerName}')" style="width:100%;padding:9px;background:var(--green);color:#fff;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:6px;">✅ Verify & Mark as Claimed</button>
              <div style="display:flex;gap:6px;">
                <a href="https://wa.me/${(r2=>(r2.startsWith('0')?'62'+r2.slice(1):r2))(c.claimerWA.replace(/\D/g,''))}?text=${encodeURIComponent('Hi '+c.claimerName+', I can confirm that the item '+r.item+' is yours. Please contact me to arrange pickup!')}" target="_blank" style="flex:1;padding:8px;background:#25D366;color:#fff;border-radius:8px;font-weight:600;font-size:12px;text-decoration:none;text-align:center;">📱 WhatsApp</a>
                <a href="mailto:${c.claimerEmail}?subject=${encodeURIComponent('Re: Claim for '+r.item+' | FoundIt BINUS')}&body=${encodeURIComponent('Hi '+c.claimerName+',\n\nI can confirm the item '+r.item+' belongs to you. Please contact me to arrange the return.\n\nBest,\n'+r.name)}" style="flex:1;padding:8px;background:var(--primary);color:#fff;border-radius:8px;font-weight:600;font-size:12px;text-decoration:none;text-align:center;">📧 Email</a>
              </div>
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
          <div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:4px;">📥 Claims Received (${claims.length})</div>
          ${claimsHtml}
        </div>`;
    }).join('');

  } catch (error) {
    console.error(error);
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red);">Failed to load data. Please make sure you are logged in.</div>';
  }
};

// ===== ACCEPT CLAIM =====
window.acceptClaim = async function(claimId, reportId, claimerWA, claimerName) {
  try {
    await updateDoc(doc(db, "claims", claimId), { status: "accepted" });
    await updateDoc(doc(db, "reports", reportId), { status: "returned" });
    window.showToast("Claim accepted! Status updated to Claimed ✅", "success");
    window.loadMyReports(); // Refresh
  } catch (error) {
    console.error(error);
    window.showToast("Failed to update status ❌", "error");
  }
};

// ===== AUTH FUNCTIONS =====
window.doLogin = async function() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("authError");
  errEl.style.display = "none";

  if (!email || !password) {
    errEl.textContent = "Please fill in your email and password.";
    errEl.style.display = "block";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.closeAuthModalDirect();
    window.showToast("Login successful! 👋", "success");
  } catch (e) {
    let msg = "Login failed. Please try again.";
    if (e.code === "auth/user-not-found" || e.code === "auth/invalid-email") {
      msg = "❌ Email not registered. Please register first.";
      // Auto-switch to register after 1.5s
      setTimeout(() => window.switchAuthTab('register'), 1500);
    } else if (e.code === "auth/wrong-password") {
      msg = "❌ Incorrect password. Please try again.";
    } else if (e.code === "auth/invalid-credential") {
      // Firebase v9+ combines user-not-found and wrong-password
      // Try to determine which one by checking if email exists
      msg = "❌ Email not registered or incorrect password.";
    } else if (e.code === "auth/too-many-requests") {
      msg = "⚠️ Too many failed attempts. Please try again later.";
    }
    errEl.textContent = msg;
    errEl.style.display = "block";
  }
};

window.doRegister = async function() {
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const rawRegPhone = document.getElementById("regPhone").value.trim().replace(/[^0-9]/g, "");
  const phone       = rawRegPhone ? "62" + (rawRegPhone.startsWith("62") ? rawRegPhone.slice(2) : rawRegPhone.startsWith("0") ? rawRegPhone.slice(1) : rawRegPhone) : "";
  const password = document.getElementById("regPassword").value;
  const errEl    = document.getElementById("authError");
  errEl.style.display = "none";

  const passwordConfirm = document.getElementById("regPasswordConfirm")?.value || "";
  if (!name || !email || !phone || !password) {
    errEl.textContent = "Please fill in all fields.";
    errEl.style.display = "block";
    return;
  }
  if (password.length < 6) {
    errEl.textContent = "Password must be at least 6 characters.";
    errEl.style.display = "block";
    return;
  }
  if (password !== passwordConfirm) {
    errEl.textContent = "Passwords do not match.";
    errEl.style.display = "block";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Sign out immediately — user must login manually
    await signOut(auth);

    // Show success state in modal instead of closing
    const errEl2 = document.getElementById("authError");
    errEl2.style.background = "#D1FAE5";
    errEl2.style.color = "#065F46";
    errEl2.style.border = "1px solid #6EE7B7";
    errEl2.textContent = "✅ Registration successful! Please login with your new account.";
    errEl2.style.display = "block";

    // Clear register fields
    ["regName","regEmail","regPhone","regPassword"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Switch to login tab after 2s
    setTimeout(() => {
      errEl2.style.background = "";
      errEl2.style.color = "";
      errEl2.style.border = "";
      errEl2.style.display = "none";
      window.switchAuthTab("login");
    }, 2500);

  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      errEl.textContent = "❌ This email is already registered. Please login instead.";
      setTimeout(() => window.switchAuthTab("login"), 2000);
    } else {
      errEl.textContent = "Registration failed: " + e.message;
    }
    errEl.style.background = "";
    errEl.style.color = "";
    errEl.style.display = "block";
  }
};

window.doForgotPassword = async function() {
  const email = document.getElementById("forgotEmail").value.trim();
  const errEl = document.getElementById("authError");
  errEl.style.display = "none";

  if (!email) {
    errEl.textContent = "Please enter your email first.";
    errEl.style.display = "block";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    window.closeAuthModalDirect();
    window.showToast("Password reset link sent to your email! 📧", "success");
  } catch (e) {
    errEl.textContent = e.code === "auth/user-not-found"
      ? "Email not registered."
      : "Failed to send reset email.";
    errEl.style.display = "block";
  }
};

window.doLogout = async function() {
  await signOut(auth);
  window.showToast("Logged out successfully.", "");
};
