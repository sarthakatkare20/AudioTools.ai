import os
import uuid

UPLOAD_DIR = "uploads"
ALLOWED = (".mp3", ".wav", ".flac", ".aac", ".mp4", ".mkv", ".webm")

def save_file(file):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED:
        raise ValueError("Unsupported file type")

    uid = str(uuid.uuid4())
    filename = uid + ext
    path = os.path.join(UPLOAD_DIR, filename)

    file.save(path)
    return path
