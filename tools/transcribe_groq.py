"""Transcribe meeting audio or video with Groq's whisper-large-v3 (good with Hindi and English mixed).

    python -I tools/transcribe_groq.py <file1.mp4> [<file2.mp4> ...] --out <folder>

The key is read from tools/.env.groq (one line: GROQ_API_KEY=...; this file is git-ignored) and is never printed.
Audio is extracted locally (mono, 16 kHz, small mp3) and only that audio is sent to Groq. Long files are cut into 10 minute pieces.
Writes <name>.txt with time stamps in the output folder.
"""
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))


def key():
    if os.environ.get("GROQ_API_KEY"):
        return os.environ["GROQ_API_KEY"].strip()
    for line in open(os.path.join(HERE, ".env.groq"), encoding="utf-8"):
        if line.strip().startswith("GROQ_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit("tools/.env.groq has no GROQ_API_KEY line")


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def pieces(src, tmp):
    pat = os.path.join(tmp, "p%03d.mp3")
    subprocess.run([ffmpeg(), "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", "-f", "segment", "-segment_time", "600", pat],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return sorted(os.path.join(tmp, f) for f in os.listdir(tmp) if f.startswith("p") and f.endswith(".mp3"))


def send(path, k):
    b = uuid.uuid4().hex
    body = b""
    for n, v in (("model", "whisper-large-v3"), ("response_format", "verbose_json"), ("temperature", "0"),
                 ("prompt", "Doctors discussing changes to a hospital software screen, in Hindi and English: chief complaints, HOPI, informant, history form, risk assessment.")):
        body += f'--{b}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode()
    body += f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode() + open(path, "rb").read() + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request("https://api.groq.com/openai/v1/audio/transcriptions", data=body, method="POST",
                                 headers={"Authorization": "Bearer " + k, "Content-Type": "multipart/form-data; boundary=" + b, "User-Agent": "tulasi-transcribe"})
    return json.loads(urllib.request.urlopen(req, timeout=300).read())


def main():
    args = sys.argv[1:]
    if "--out" not in args:
        sys.exit(__doc__)
    out = args[args.index("--out") + 1]
    files = [a for i, a in enumerate(args) if a != "--out" and (i == 0 or args[i - 1] != "--out")]
    os.makedirs(out, exist_ok=True)
    k = key()
    for f in files:
        lines = []
        with tempfile.TemporaryDirectory() as tmp:
            off = 0
            for p in pieces(f, tmp):
                r = send(p, k)
                for s in r.get("segments", []):
                    t = int(off + s["start"])
                    lines.append("[%d:%02d] %s" % (t // 60, t % 60, s["text"].strip()))
                off += 600
        dst = os.path.join(out, os.path.splitext(os.path.basename(f))[0].replace(" ", "_") + ".txt")
        open(dst, "w", encoding="utf-8").write("\n".join(lines))
        print("done:", os.path.basename(dst), len(lines), "lines")


if __name__ == "__main__":
    main()
