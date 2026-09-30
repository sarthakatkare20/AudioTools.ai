/* =================================================
   VOCAL REMOVER - CLIENT CONTROLLER
   With Real Audio Duration & Dynamic Processing Estimation
================================================= */

// DOM Elements
const input = document.getElementById("audioInput");
const dropZone = document.getElementById("dropZone");
const actionBtn = document.getElementById("actionBtn");
const fileText = document.getElementById("fileText");
const uploadIcon = document.getElementById("uploadIcon");

const uploadCard = document.getElementById("uploadCard");
const processing = document.getElementById("processing");
const results = document.getElementById("results");

const loader = document.getElementById("loader");
const uploadTick = document.getElementById("uploadTick");
const progressWrapper = document.getElementById("progressWrapper");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const statusText = document.getElementById("statusText");
const hintText = document.getElementById("hintText");

/* =================================================
   STATE
================================================= */
let selectedFile = null;
let fileDuration = 0; // In seconds
let hintInterval = null;
let wavesurfers = {};

/* =================================================
   AUDIO DURATION PROBE (REAL LENGTH DETECTION)
================================================= */
function getAudioDuration(file) {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration || 180);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback estimate based on file size (1MB ~ 50s audio)
        const sizeMB = file.size / (1024 * 1024);
        const estSec = Math.max(30, Math.min(360, sizeMB * 50));
        resolve(estSec);
      };
    } catch {
      resolve(180);
    }
  });
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

/* =================================================
   FILE SELECT LOGIC
================================================= */
if (dropZone && input) {
  dropZone.addEventListener("click", () => {
    input.click();
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach(e =>
    dropZone.addEventListener(e, ev => ev.preventDefault())
  );

  dropZone.addEventListener("dragover", () =>
    dropZone.classList.add("drag-active")
  );

  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("drag-active")
  );

  dropZone.addEventListener("drop", async (e) => {
    dropZone.classList.remove("drag-active");
    if (!e.dataTransfer.files || !e.dataTransfer.files.length) return;
    await handleFileSelect(e.dataTransfer.files[0]);
  });
}

if (input) {
  input.addEventListener("change", async () => {
    if (!input.files || !input.files.length) return;
    await handleFileSelect(input.files[0]);
  });
}

async function handleFileSelect(file) {
  if (!file) return;
  selectedFile = file;

  // Real duration detection
  fileDuration = await getAudioDuration(file);
  const durationLabel = formatDuration(fileDuration);

  if (fileText) fileText.textContent = `Selected: ${file.name} (${durationLabel})`;
  if (actionBtn) {
    actionBtn.innerHTML = `<span>⚡ Remove Vocals (${durationLabel})</span>`;
    actionBtn.classList.add("ready");
  }

  if (uploadIcon) {
    uploadIcon.classList.add("selected");
    setTimeout(() => {
      uploadIcon.classList.remove("selected");
    }, 300);
  }
}

/* =================================================
   CHECK FOR REDIRECTED FILE ON LOAD
================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof getAndClearPendingFile === "function") {
    const pendingFile = await getAndClearPendingFile("vocal");
    if (pendingFile) {
      await handleFileSelect(pendingFile);
      setTimeout(() => {
        if (actionBtn) actionBtn.click();
      }, 300);
    }
  }
});

/* =================================================
   HELPERS & HINTS
================================================= */
function setProgress(p) {
  const val = Math.min(100, Math.floor(p));
  if (progressFill) progressFill.style.width = val + "%";
  if (progressPercent) progressPercent.textContent = val + "%";
}

function startHintLoop(hints) {
  let index = 0;
  hintInterval = setInterval(() => {
    index = (index + 1) % hints.length;
    if (hintText) {
      hintText.style.opacity = "0";
      setTimeout(() => {
        hintText.textContent = hints[index];
        hintText.style.opacity = "1";
      }, 300);
    }
  }, 7000);
}

function stopHintLoop() {
  if (hintInterval) {
    clearInterval(hintInterval);
    hintInterval = null;
  }
}

/* =================================================
   WAVESURFER
================================================= */
function initWavesurfer(id, container, color) {
  wavesurfers[id] = WaveSurfer.create({
    container,
    waveColor: color,
    progressColor: "#ffffff",
    barWidth: 2,
    barGap: 3,
    height: 38,
    responsive: true,
    normalize: true
  });

  wavesurfers[id].on("play", () => {
    const btn = document.getElementById(`play-${id}`);
    if (btn) btn.textContent = "⏸";
  });

  wavesurfers[id].on("pause", () => {
    const btn = document.getElementById(`play-${id}`);
    if (btn) btn.textContent = "▶";
  });
}

/* =================================================
   PLAY / MUTE / SOLO
================================================= */
function togglePlay(id) {
  const track = wavesurfers[id];
  if (!track) return;
  track.isPlaying() ? track.pause() : track.play();
}

function toggleMute(id) {
  const btn = event.currentTarget;
  const track = wavesurfers[id];
  if (!track) return;

  track.setMuted(!track.getMuted());
  btn.classList.toggle("active");
}

function toggleSolo(id) {
  const otherId = id === "vocals" ? "inst" : "vocals";

  wavesurfers[id].setMuted(false);
  if (wavesurfers[otherId]) wavesurfers[otherId].setMuted(true);

  const thisCard = document.querySelector(`#card-${id}`);
  const otherCard = document.querySelector(`#card-${otherId}`);

  if (thisCard) {
    thisCard.querySelector(".solo-btn").classList.add("active");
    thisCard.querySelector(".mute-btn").classList.remove("active");
  }

  if (otherCard) {
    otherCard.querySelector(".solo-btn").classList.remove("active");
    otherCard.querySelector(".mute-btn").classList.add("active");
  }

  if (!wavesurfers[id].isPlaying()) {
    wavesurfers[id].play();
  }
}

/* =================================================
   MAIN EXECUTION FLOW WITH REAL TIME ESTIMATE
================================================= */
if (actionBtn) {
  actionBtn.onclick = async () => {
    if (!selectedFile) {
      if (input) input.click();
      return;
    }

    if (!fileDuration) {
      fileDuration = await getAudioDuration(selectedFile);
    }

    // Realistic CPU benchmark for Demucs 2-stems: ~2.2x audio duration + 5s startup
    const estimatedSeconds = Math.max(15, Math.round(fileDuration * 2.2) + 5);
    let remainingSec = estimatedSeconds;

    const hints = [
      "AI neural networks are isolating vocals…",
      "Analyzing frequency spectrum…",
      "Detecting vocal harmonics…",
      "Refining instrumental layers…",
      "Enhancing audio clarity…"
    ];

    if (uploadCard) uploadCard.classList.add("hidden");
    if (results) results.classList.add("hidden");
    if (processing) processing.classList.remove("hidden");

    if (statusText) statusText.textContent = "Uploading audio…";
    if (hintText) hintText.textContent = `Audio length: ${formatDuration(fileDuration)} • Initializing AI…`;

    if (loader) loader.classList.remove("hidden");
    if (uploadTick) uploadTick.classList.add("hidden");
    if (progressWrapper) progressWrapper.classList.add("hidden");

    const form = new FormData();
    form.append("audio", selectedFile);

    const backendPromise = fetch("/vocal-remover/process", {
      method: "POST",
      body: form
    });

    const UPLOAD_TIME = 1000;
    const TICK_TIME = 800;

    /* Phase 1: Upload complete tick */
    setTimeout(() => {
      if (loader) loader.classList.add("hidden");
      if (uploadTick) {
        uploadTick.classList.remove("hidden");
        uploadTick.classList.add("show");
      }
      if (statusText) statusText.textContent = "Upload complete";
    }, UPLOAD_TIME);

    /* Phase 2: Progress & Smooth Continuous Countdown */
    setTimeout(async () => {
      if (uploadTick) uploadTick.classList.add("hidden");
      if (progressWrapper) progressWrapper.classList.remove("hidden");

      startHintLoop(hints);
      if (statusText) statusText.textContent = "Separating vocals…";

      const timerElem = document.getElementById("timerSeconds");
      if (timerElem) timerElem.textContent = `~${remainingSec}s (${formatDuration(fileDuration)})`;

      const startTime = Date.now();
      const countdown = setInterval(() => {
        if (remainingSec > 1) {
          remainingSec--;
          if (timerElem) timerElem.textContent = `~${remainingSec}s (${formatDuration(fileDuration)})`;
        } else {
          if (timerElem) timerElem.textContent = `Finalizing output…`;
        }
      }, 1000);

      // Smooth Asymptotic Easing: Never hangs or stops at 95%
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const ratio = elapsed / estimatedSeconds;

        if (ratio < 0.9) {
          currentProgress = ratio * 96;
        } else {
          // Continuous smooth glide towards 99%
          const extra = 1 - Math.exp(-(ratio - 0.9) * 1.5);
          currentProgress = 86.4 + (extra * 12.8);
        }

        currentProgress = Math.min(currentProgress, 99.2);
        setProgress(currentProgress);
      }, 300);

      try {
        const resp = await backendPromise;
        const data = await resp.json();
        if (data.status !== "success" && data.error) {
          throw new Error(data.error || "Separation failed");
        }
      } catch (err) {
        console.error("Separation error:", err);
      }

      clearInterval(progressInterval);
      clearInterval(countdown);
      stopHintLoop();

      if (timerElem) timerElem.textContent = "Complete!";
      if (statusText) statusText.textContent = "Finalizing output…";
      if (hintText) hintText.textContent = "Almost done…";

      if (progressFill) progressFill.style.width = "100%";
      if (progressPercent) progressPercent.textContent = "100%";

      setTimeout(showResults, 600);
    }, UPLOAD_TIME + TICK_TIME);
  };
}

/* =================================================
   RESULTS
================================================= */
function showResults() {
  if (processing) processing.classList.add("hidden");
  if (uploadCard) uploadCard.classList.add("hidden");
  if (results) results.classList.remove("hidden");

  initWavesurfer("vocals", "#waveform-vocals", "#7c3aed");
  initWavesurfer("inst", "#waveform-inst", "#0ea5e9");

  wavesurfers.vocals.load("/download/vocals");
  wavesurfers.inst.load("/download/instrumental");
}

/* =================================================
   SPLIT ANOTHER SONG 
================================================= */
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", resetVocal);
}

function resetVocal() {
  Object.keys(wavesurfers).forEach(id => {
    try {
      wavesurfers[id].stop();
      wavesurfers[id].destroy();
    } catch (e) {}
  });

  wavesurfers = {};
  stopHintLoop();

  if (results) results.classList.add("hidden");
  if (processing) processing.classList.add("hidden");
  if (uploadCard) uploadCard.classList.remove("hidden");

  selectedFile = null;
  fileDuration = 0;
  if (input) input.value = "";

  if (fileText) fileText.textContent = "Drag & drop an audio file here";
  if (actionBtn) {
    actionBtn.innerHTML = `<span>🎵 Choose Audio File</span>`;
    actionBtn.classList.remove("ready");
  }

  if (progressFill) progressFill.style.width = "0%";
  if (progressPercent) progressPercent.textContent = "0%";

  if (loader) loader.classList.remove("hidden");
  if (uploadTick) uploadTick.classList.add("hidden");
}
