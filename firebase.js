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
  if (diff < 3600)   return Math.floor(diff / 60) + " minutes ago";
  if (diff < 86400)  return Math.floor(diff / 3600) + " hours ago";
  if (diff < 604800) return Math.floor(diff / 86400) + " days ago";
  return Math.floor(diff / 604800) + " weeks ago";
}

// ===== KOMPRES GAMBAR → base64 (max 300x300, quality 0.7) =====
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

// ===== LOAD REPORTS DARI FIRESTORE (realtime) =====
document.addEventListener("DOMContentLoaded", () => {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const firestoreItems = [];

    snapshot.forEach(doc => {
      const d = doc.data();
      const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
      firestoreItems.push({
        id:            "fb_" + doc.id,
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

    // Kompres gambar jadi base64 kalau ada
    let imageUrl = null;
    if (file) {
      imageUrl = await compressImage(file);
    }

    await addDoc(collection(db, "reports"), {
      item, category, location, desc, name, phone,
      imageUrl,
      status:    "lost",
      createdAt: new Date()
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
