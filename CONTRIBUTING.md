# Contributing to Audiotools.ai

Thank you for your interest in contributing to **Audiotools.ai**! 🎉

We welcome contributions from developers, audio engineers, and open-source enthusiasts. Follow these guidelines to ensure a smooth collaboration.

---

## 🛠️ How Can You Contribute?

You can contribute in several ways:
- **Reporting Bugs:** Open an issue describing the bug, steps to reproduce, and your OS/Python environment.
- **Suggesting Features:** Propose new features (e.g., adding BS-Roformer, pitch shifting, batch processing, or waveform visualizers).
- **Submitting Pull Requests:** Improve the codebase, fix bugs, optimize UI/UX, or refine documentation.

---

## 🚀 Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/<YOUR_USERNAME>/Audiotools.ai.git
cd Audiotools.ai
```

### 2. Set Up Local Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes & Test
Make your modifications and test locally:
```bash
python app.py
```

### 5. Commit and Push
Follow clean and descriptive commit messages:
```bash
git add .
git commit -m "feat: add waveform visualizer to stems player"
git push origin feature/your-feature-name
```

### 6. Open a Pull Request
Go to the original repository on GitHub and click **"New Pull Request"**.

---

## 📝 Coding Standards
- Write clean, readable, and PEP 8 compliant Python code.
- Avoid committing large audio files (`.wav`, `.mp3`) or temporary directories (`uploads/`, `separated/`).
- Test changes thoroughly before creating a Pull Request.

---

## 📜 License
By contributing to Audiotools.ai, you agree that your contributions will be licensed under the [MIT License](LICENSE).
