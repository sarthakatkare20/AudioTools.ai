import subprocess
import os
import sys
import torch

OUTPUT_DIR = "separated"

def get_optimal_config():
    """Detects available acceleration (CUDA/CPU) and allocates CPU worker threads."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # Utilize available CPU cores (cap at 6 to avoid throttling)
    cpu_count = os.cpu_count() or 2
    jobs = max(1, min(6, cpu_count - 1)) if device == "cpu" else 1
    return device, jobs

def split(wav_path):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    device, jobs = get_optimal_config()

    cmd = [
        sys.executable, "-m", "demucs",
        "-n", "htdemucs",
        "-d", device,
        "-j", str(jobs),
        "--shifts", "1",
        wav_path,
        "-o", OUTPUT_DIR
    ]

    subprocess.run(cmd, check=True)

    base = os.path.splitext(os.path.basename(wav_path))[0]
    folder = os.path.join(OUTPUT_DIR, "htdemucs", base)

    return {
        "vocals": os.path.join(folder, "vocals.wav"),
        "drums": os.path.join(folder, "drums.wav"),
        "bass": os.path.join(folder, "bass.wav"),
        "other": os.path.join(folder, "other.wav"),
    }
