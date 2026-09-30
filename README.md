# 🎧 AudioTools.ai

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.1.2-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Demucs](https://img.shields.io/badge/Demucs-v4-8A2BE2?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

**An open-source, AI-powered local audio processing suite for vocal isolation, music source separation, and multitrack stem splitting.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-project-architecture) • [Quick Start](#-quick-start) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 🌟 Overview

**AudioTools.ai** is an open-source audio processing tool designed for musicians, producers, audio engineers, and developers. Powered by state-of-the-art Deep Learning models (**Demucs `htdemucs`**), it provides high-fidelity source separation with a fast, modern, and intuitive web interface that runs entirely on your local machine with 100% privacy.

---

## 🚀 Key Features

* 🎤 **Vocal & Instrumental Separation**: Extract clear studio vocals and background accompaniment (`no_vocals`).
* 🥁 **4-Stem Multitrack Splitting**: Isolate individual audio stems:
  * **Vocals** (Lead & backing voices)
  * **Drums** (Kick, snare, hi-hats, percussions)
  * **Bass** (Bass guitar, synth bass, low end)
  * **Other** (Guitars, pianos, synths, fx)
* ⚡ **Audio Normalization**: Automatic conversion and audio normalization to 44.1kHz 16-bit stereo WAV via FFmpeg.
* 🌐 **Modern Dark-Mode UI**: Clean, sleek, responsive interface built with vanilla HTML5/CSS3/JavaScript.
* 🔒 **100% Offline & Private**: Audio is processed directly on your hardware with zero cloud uploads or queues.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+, Flask | Lightweight, fast REST API and route orchestration |
| **AI / ML Model** | Demucs v4 (`htdemucs`), PyTorch | Hybrid Transformer architecture for music source separation |
| **Audio Engine** | FFmpeg, SoundFile, PyDub | Format transcoding and stream normalization |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive dark-mode dashboard with interactive controllers |

---

## 📁 Project Architecture

```
AudioTools.ai/
├── app.py                   # Main Flask application & routing
├── requirements.txt         # Core dependencies
├── LICENSE                  # MIT License
├── CONTRIBUTING.md          # Open source contribution guidelines
│
├── modules/                 # Modular backend processing
│   ├── loader.py            # Upload verification & file management
│   ├── converter.py         # FFmpeg audio normalization
│   ├── vocals.py            # 2-stem vocal/instrumental separation
│   └── splitter.py          # 4-stem multitrack splitting
│
├── templates/               # Jinja2 HTML views
│   ├── home.html            # Landing page
│   ├── vocal.html           # Vocal isolation tool UI
│   └── splitter.html        # 4-stem splitter tool UI
│
└── static/
    ├── css/                 # Modern dark UI stylesheets
    └── js/                  # Interactive audio controllers & AJAX handlers
```

---

## ⚡ Quick Start

### Prerequisites
* **Python 3.10+**
* **FFmpeg** installed on your system:
  * **Windows:** `winget install Gyan.FFmpeg` or `choco install ffmpeg`
  * **macOS:** `brew install ffmpeg`
  * **Linux (Ubuntu/Debian):** `sudo apt update && sudo apt install ffmpeg`

### 1. Clone the Repository
```bash
git clone https://github.com/sarthakatkare20/AudioTools.ai.git
cd AudioTools.ai
```

### 2. Create and Activate a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

Open your browser and navigate to: **`http://localhost:7860`** (or `http://localhost:5000`).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/sarthakatkare20/AudioTools.ai/issues) or read the [Contributing Guidelines](CONTRIBUTING.md).

1. **Fork** the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
