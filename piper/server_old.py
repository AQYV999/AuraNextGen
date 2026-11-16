from flask import Flask, request, Response
import subprocess

app = Flask(__name__)

PIPER_EXE = r"C:\piper\piper.exe"
MODEL     = r"C:\piper\voices\en_US-lessac-medium.onnx"

@app.route("/tts", methods=["POST"])
def tts():
    teks = request.get_data(as_text=True).strip()
    if not teks:
        return Response(b"", status=400)

    proc = subprocess.Popen(
        [PIPER_EXE, "--model", MODEL, "--output-raw"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    pcm, _ = proc.communicate(input=teks.encode("utf-8"))

    print(f"[TTS] {len(teks)} chars -> {len(pcm)} bytes PCM @ 22050Hz")
    return Response(pcm, mimetype="application/octet-stream")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)