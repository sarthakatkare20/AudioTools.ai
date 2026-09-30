import subprocess
import os
import shutil

TEMP_DIR = "temp"
AUDIO_EXT = (".mp3", ".wav", ".flac", ".aac")
VIDEO_EXT = (".mp4", ".mkv", ".webm")

def get_ffmpeg_binary():
    """Finds system ffmpeg or falls back to imageio_ffmpeg bundled binary."""
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        return ffmpeg_path
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"

def to_wav(input_path):
    os.makedirs(TEMP_DIR, exist_ok=True)
    ffmpeg = get_ffmpeg_binary()

    ext = os.path.splitext(input_path)[1].lower()
    name = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(TEMP_DIR, name + ".wav")

    if ext in AUDIO_EXT:
        cmd = [
            ffmpeg, "-y",
            "-threads", "0",
            "-i", input_path,
            "-ar", "44100",
            "-ac", "2",
            output_path
        ]
    elif ext in VIDEO_EXT:
        cmd = [
            ffmpeg, "-y",
            "-threads", "0",
            "-i", input_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            output_path
        ]
    else:
        raise ValueError("Unsupported file format for audio conversion")

    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return output_path
