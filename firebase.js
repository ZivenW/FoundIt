// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, orderBy, query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2Rrybe71YfR4uzmU1QLAPDrvA9_txLN4",
  authDomain: "lostnfound-67b99.firebaseapp.com",
  projectId: "lostnfound-67b99",
  storageBucket: "lostnfound-67b99.firebasestorage.app",
  messagingSenderId: "1060796180291",
  appId: "1:1060796180291:web:172d0953f09d373d9331f6",
  measurementId: "G-29H8BFG7YC"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ===== EMOJI MAP =====
const EMOJI_MAP = {
  electronics: "💻", bags: "🎒", documents: "📄",
  keys: "🔑", accessories: "👓", others: "📦"
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 3600)    return Math.floor(diff / 60)   + " minutes ago";
  if (diff < 86400)   return Math.floor(diff / 3600) + " hours ago";
  if (diff < 604800)  return Math.floor(diff / 86400) + " days ago";
  return Math.floor(diff / 604800) + " weeks ago";
}

function refreshUI() {
  window.renderGrid("homeGrid",   window.allItems.filter(i => i.status === "lost").slice(0, 8));
  window.renderGrid("searchGrid", window.allItems);
  window.renderSidebarRecent();
  window.initStats();
  window.initStatsPage();
  window.applyFilters();
}

// ===== LOAD REALTIME DARI FIRESTORE =====
document.addEventListener("DOMContentLoaded", () => {
  // Tunggu sebentar agar app.js selesai expose semua fungsi
  setTimeout(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
      // Hapus item lama yang dari Firestore
      window.allItems = window.allItems.filter(i => !i.fromFirestore);

      snapshot.forEach(doc => {
        const d = doc.data();
        const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        window.allItems.unshift({          // unshift = tambah di depan (paling baru)
          id:            "fb_" + doc.id,
          name:          d.item || "Unknown Item",
          category:      d.category || "others",
          location:      d.location || "Unknown",
          status:        d.status || "lost",
          time:          timeAgo(createdAt),
          date:          createdAt.toISOString().split("T")[0],
          emoji:         EMOJI_MAP[d.category] || "📦",
          description:   d.desc || "-",
          reporterName:  d.name  || "",
          reporterPhone: d.phone || "",
          fromFirestore: true,
        });
      });

      refreshUI();
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });
  }, 100);
});

// ===== SUBMIT REPORT =====
window.submitReport = async function () {
  const item     = document.getElementById("rItem").value.trim();
  const category = document.getElementById("rCategory").value;
  const location = document.getElementById("rLocation").value;
  const desc     = document.getElementById("rDesc").value.trim();
  const name     = document.getElementById("rName").value.trim();
  const phone    = document.getElementById("rPhone").value.trim();

  if (!item || !category || !location || !name || !phone) {
    window.showToast("Lengkapi semua field terlebih dahulu!", "error");
    return;
  }

  try {
    await addDoc(collection(db, "reports"), {
      item, category, location, desc, name, phone,
      status:    "lost",
      createdAt: new Date()
    });
    window.showToast("Report berhasil dikirim! ✅", "success");

    ["rItem","rCategory","rLocation","rDesc","rName","rPhone"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const preview = document.getElementById("imgPreview");
    if (preview) { preview.src = ""; preview.style.display = "none"; }

  } catch (error) {
    console.error("Firebase error:", error);
    window.showToast("Gagal menyimpan data ❌", "error");
  }
};
