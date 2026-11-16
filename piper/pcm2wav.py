import sys, wave

pcm_file = sys.argv[1]
wav_file = sys.argv[2]

with open(pcm_file, "rb") as f:
    pcm = f.read()

with wave.open(wav_file, "wb") as w:
    w.setnchannels(1)          # mono
    w.setsampwidth(2)          # 16-bit
    w.setframerate(22050)      # Piper output rate
    w.writeframes(pcm)

print(f"OK: {wav_file} ({len(pcm)} bytes)")