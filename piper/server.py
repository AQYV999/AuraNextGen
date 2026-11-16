from flask import Flask, request, Response
from piper import PiperVoice

app = Flask(__name__)

MODEL_PATH = r"C:\piper\voices\en_US-lessac-medium.onnx"

print("[Piper] Loading voice model...")
voice = PiperVoice.load(MODEL_PATH)
print("[Piper] Model ready. Sample rate:", voice.config.sample_rate)

# Cek method apa yang tersedia di versi lo (buat debug)
print("[Piper] Available methods:", [m for m in dir(voice) if not m.startswith('_')])


@app.route("/tts", methods=["POST"])
def tts():
    teks = request.get_data(as_text=True).strip()
    if not teks:
        return Response(b"", status=400)

    pcm = b""

    # === Coba method 1: synthesize (versi piper-tts 1.3+) ===
    if hasattr(voice, "synthesize"):
        try:
            for chunk in voice.synthesize(teks):
                # chunk bisa berupa AudioChunk (dengan .audio_int16_bytes) atau bytes langsung
                if hasattr(chunk, "audio_int16_bytes"):
                    pcm += chunk.audio_int16_bytes
                elif isinstance(chunk, (bytes, bytearray)):
                    pcm += bytes(chunk)
                else:
                    # fallback: coba convert
                    pcm += bytes(chunk)
        except Exception as e:
            print("[TTS] synthesize() error:", e)
            return Response(b"", status=500)

    # === Coba method 2: synthesize_stream_raw (versi lama) ===
    elif hasattr(voice, "synthesize_stream_raw"):
        for chunk in voice.synthesize_stream_raw(teks):
            pcm += chunk

    # === Coba method 3: synthesize_stream ===
    elif hasattr(voice, "synthesize_stream"):
        import io, wave
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wav:
            voice.synthesize_stream(teks, wav)
        # Extract PCM dari WAV (skip 44-byte header)
        pcm = buf.getvalue()[44:]

    else:
        print("[TTS] Gak ada method synthesize yang dikenal!")
        return Response(b"", status=500)

    print(f"[TTS] {len(teks)} chars -> {len(pcm)} bytes PCM @ {voice.config.sample_rate}Hz")
    return Response(pcm, mimetype="application/octet-stream")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, threaded=True)