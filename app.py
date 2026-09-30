from flask import Flask, request, render_template, jsonify, send_file, send_from_directory
import os

from modules.loader import save_file
from modules.converter import to_wav
from modules.vocals import separate
from modules.splitter import split

app = Flask(__name__)

LAST_RESULT = {}

# ---------------- FAVICON & HOME ----------------

@app.route("/favicon.ico")
def favicon():
    return send_from_directory(os.path.join(app.root_path, "static"), "favicon.png", mimetype="image/png")

@app.route("/")
def home():
    return render_template("home.html")

# ---------------- VOCAL REMOVER ----------------

@app.route("/vocal-remover")
def vocal_page():
    return render_template("vocal.html")

@app.route("/vocal-remover/process", methods=["POST"])
def vocal_process():
    try:
        file = request.files["audio"]
        original_name = os.path.splitext(file.filename)[0]

        uploaded = save_file(file)
        wav = to_wav(uploaded)
        result = separate(wav)

        LAST_RESULT.clear()
        LAST_RESULT.update(result)
        LAST_RESULT["name"] = original_name

        return jsonify({"status": "done", "files": list(result.keys())})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- SPLITTER ----------------

@app.route("/splitter")
def splitter_page():
    return render_template("splitter.html")

@app.route("/splitter/process", methods=["POST"])
def splitter_process():
    try:
        file = request.files["audio"]
        original_name = os.path.splitext(file.filename)[0]

        uploaded = save_file(file)
        wav = to_wav(uploaded)
        result = split(wav)

        LAST_RESULT.clear()
        LAST_RESULT.update(result)
        LAST_RESULT["name"] = original_name

        return jsonify({"status": "done", "files": list(result.keys())})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- DOWNLOAD (COMMON) ----------------

@app.route("/download/<stem>")
def download(stem):
    path = LAST_RESULT.get(stem)
    if not path:
        return "File not found", 404

    filename = f"{LAST_RESULT['name']} [{stem}].wav"
    return send_file(path, as_attachment=True, download_name=filename)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)
