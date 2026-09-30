/* =================================================
   AUDIOTOOLS.AI - SHARED DB & HOME CONTROLLER
================================================= */

// Shared IndexedDB Storage for Cross-Page File Transfer
window.AudioStore = {
  DB_NAME: "AudioToolsDB",
  STORE_NAME: "temp_files",

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e);
    });
  },

  async savePendingFile(file, targetTool) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        store.put({ file: file, tool: targetTool, timestamp: Date.now() }, "pending_file");
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e);
      });
    } catch (err) {
      console.error("IndexedDB save error:", err);
    }
  },

  async getAndClearPendingFile(expectedTool) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get("pending_file");
        req.onsuccess = () => {
          const data = req.result;
          if (data && (!expectedTool || data.tool === expectedTool)) {
            store.delete("pending_file");
            resolve(data.file);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      console.error("IndexedDB retrieve error:", err);
      return null;
    }
  }
};

// Global aliases
function savePendingFile(file, targetTool) {
  return window.AudioStore.savePendingFile(file, targetTool);
}
function getAndClearPendingFile(expectedTool) {
  return window.AudioStore.getAndClearPendingFile(expectedTool);
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. THEME TOGGLE (LIGHT / DARK)
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("audiotools-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    updateThemeIcon(true);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("audiotools-theme", isDark ? "dark" : "light");
      updateThemeIcon(isDark);
    });
  }

  function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    if (isDark) {
      themeToggle.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    } else {
      themeToggle.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }
  }

  // 2. VOCAL CARD INTERACTIONS (DROP & BROWSE WITH PERSISTENCE)
  const vocalDropZone = document.getElementById("vocalDropZone");
  const vocalFileInput = document.getElementById("vocalFileInput");
  const vocalBtn = document.getElementById("vocalBtn");

  if (vocalDropZone && vocalFileInput) {
    vocalDropZone.addEventListener("click", () => {
      vocalFileInput.click();
    });

    if (vocalBtn) {
      vocalBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        vocalFileInput.click();
      });
    }

    // Drag and Drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach(ev =>
      vocalDropZone.addEventListener(ev, e => e.preventDefault())
    );

    vocalDropZone.addEventListener("dragover", () => vocalDropZone.classList.add("drag-active"));
    vocalDropZone.addEventListener("dragleave", () => vocalDropZone.classList.remove("drag-active"));

    vocalDropZone.addEventListener("drop", async (e) => {
      vocalDropZone.classList.remove("drag-active");
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        await savePendingFile(e.dataTransfer.files[0], "vocal");
        window.location.href = "/vocal-remover";
      }
    });

    vocalFileInput.addEventListener("change", async () => {
      if (vocalFileInput.files && vocalFileInput.files.length) {
        await savePendingFile(vocalFileInput.files[0], "vocal");
        window.location.href = "/vocal-remover";
      }
    });
  }

  // 3. STEM CARD INTERACTIONS (DROP & BROWSE WITH PERSISTENCE)
  const stemDropZone = document.getElementById("stemDropZone");
  const stemFileInput = document.getElementById("stemFileInput");
  const stemBtn = document.getElementById("stemBtn");

  if (stemDropZone && stemFileInput) {
    stemDropZone.addEventListener("click", () => {
      stemFileInput.click();
    });

    if (stemBtn) {
      stemBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        stemFileInput.click();
      });
    }

    // Drag and Drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach(ev =>
      stemDropZone.addEventListener(ev, e => e.preventDefault())
    );

    stemDropZone.addEventListener("dragover", () => stemDropZone.classList.add("drag-active"));
    stemDropZone.addEventListener("dragleave", () => stemDropZone.classList.remove("drag-active"));

    stemDropZone.addEventListener("drop", async (e) => {
      stemDropZone.classList.remove("drag-active");
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        await savePendingFile(e.dataTransfer.files[0], "stem");
        window.location.href = "/splitter";
      }
    });

    stemFileInput.addEventListener("change", async () => {
      if (stemFileInput.files && stemFileInput.files.length) {
        await savePendingFile(stemFileInput.files[0], "stem");
        window.location.href = "/splitter";
      }
    });
  }
});
